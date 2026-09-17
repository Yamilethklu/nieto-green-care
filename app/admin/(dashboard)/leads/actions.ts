"use server";
import {revalidatePath} from "next/cache";
import {requireAdmin} from "@/lib/supabase/auth";
import {createCalendarEvent,deleteCalendarEvent} from "@/lib/google-calendar";

const allowed=new Set(["pending","scheduled","completed","cancelled"]);
const transitions:Record<string,Set<string>>={pending:new Set(["scheduled","cancelled"]),scheduled:new Set(["completed","cancelled"]),completed:new Set(),cancelled:new Set(["pending"])};

export async function updateLeadStatus(formData:FormData){
  const auth=await requireAdmin();if(!auth)throw new Error("Unauthorized");
  const id=String(formData.get("id")||"");const status=String(formData.get("status")||"");
  if(!id||!allowed.has(status))throw new Error("Invalid lead update");
  const {data:lead,error:readError}=await auth.db.from("leads").select("id,full_name,property_address,requested_date,requested_time,phone,email,notes,estimated_price,frequency,status,calendar_event_id").eq("id",id).single();
  if(readError||!lead)throw new Error("Lead not found");
  const current=String(lead.status);
  if(status===current)return;
  if(!transitions[current]?.has(status))throw new Error(`Invalid status transition: ${current} to ${status}`);

  if(status==="scheduled"){
    if(!lead.requested_date||!lead.requested_time)throw new Error("A service date and time are required before scheduling");
    const {error}=await auth.db.from("leads").update({status:"scheduled"}).eq("id",id).eq("status",current);
    if(error)throw new Error(`Could not schedule lead: ${error.message}`);
    try{
      const eventId=await createCalendarEvent(lead);
      if(eventId){const {error:calendarIdError}=await auth.db.from("leads").update({calendar_event_id:eventId}).eq("id",id);if(calendarIdError){await deleteCalendarEvent(eventId).catch(cleanup=>console.error("Calendar cleanup failed",cleanup));await auth.db.from("leads").update({status:current,calendar_event_id:null}).eq("id",id);throw new Error("Could not save Google Calendar event reference");}}
    }catch(error){
      await auth.db.from("leads").update({status:current,calendar_event_id:null}).eq("id",id);
      console.error("Calendar sync failed",error);
      throw new Error("Could not schedule: Google Calendar sync failed");
    }
  }else{
    const oldEventId=lead.calendar_event_id as string|null;
    const patch:{status:string;calendar_event_id?:null}={status};
    if(oldEventId&&(status==="cancelled"||status==="completed"))patch.calendar_event_id=null;
    const {error}=await auth.db.from("leads").update(patch).eq("id",id).eq("status",current);
    if(error)throw new Error(`Could not update lead: ${error.message}`);
    if(oldEventId&&status==="cancelled"){
      try{await deleteCalendarEvent(oldEventId)}catch(error){console.error("Calendar cancellation cleanup failed",error);await auth.db.from("leads").update({status:current,calendar_event_id:oldEventId}).eq("id",id);throw new Error("Could not cancel: Google Calendar sync failed")}
    }
  }
  revalidatePath("/admin");revalidatePath("/admin/leads");revalidatePath("/admin/schedule");
}

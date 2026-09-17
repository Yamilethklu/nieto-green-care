"use server";
import {revalidatePath} from "next/cache";
import {requireAdmin} from "@/lib/supabase/auth";
import {createCalendarEvent,deleteCalendarEvent} from "@/lib/google-calendar";

const allowed=new Set(["pending","scheduled","completed","cancelled"]);
const transitions:Record<string,Set<string>>={pending:new Set(["scheduled","cancelled"]),scheduled:new Set(["completed","cancelled"]),completed:new Set(),cancelled:new Set(["pending"])};
const refresh=()=>{revalidatePath("/admin");revalidatePath("/admin/leads");revalidatePath("/admin/schedule")};

export async function updateLeadStatus(formData:FormData){
  const auth=await requireAdmin();if(!auth)throw new Error("Unauthorized");
  const id=String(formData.get("id")||"");const status=String(formData.get("status")||"");
  if(!id||!allowed.has(status))throw new Error("Invalid lead update");
  const {data:lead,error:readError}=await auth.db.from("leads").select("id,full_name,property_address,requested_date,requested_time,phone,email,notes,estimated_price,frequency,status,calendar_event_id").eq("id",id).single();
  if(readError||!lead)throw new Error("Lead not found");
  const current=String(lead.status);if(status===current)return;
  if(!transitions[current]?.has(status))throw new Error(`Invalid status transition: ${current} to ${status}`);

  if(status==="scheduled"){
    if(!lead.requested_date||!lead.requested_time)throw new Error("A service date and time are required before scheduling");
    const {error}=await auth.db.from("leads").update({status:"scheduled",calendar_sync_status:"pending",calendar_sync_error:null}).eq("id",id).eq("status",current);
    if(error)throw new Error(`Could not schedule lead: ${error.message}`);
    try{
      const eventId=await createCalendarEvent(lead);
      if(!eventId)throw new Error("Google Calendar is not configured");
      const {error:saveError}=await auth.db.from("leads").update({calendar_event_id:eventId,calendar_sync_status:"synced",calendar_sync_error:null,calendar_synced_at:new Date().toISOString()}).eq("id",id);
      if(saveError){await deleteCalendarEvent(eventId).catch(cleanup=>console.error("Calendar cleanup failed",cleanup));throw saveError}
    }catch(error){
      const message=error instanceof Error?error.message:"Unknown calendar error";
      console.error("Calendar sync failed",error);
      await auth.db.from("leads").update({calendar_event_id:null,calendar_sync_status:"failed",calendar_sync_error:message.slice(0,500)}).eq("id",id);
    }
  }else{
    const oldEventId=lead.calendar_event_id as string|null;
    const patch:{status:string;calendar_event_id?:null;calendar_sync_status?:string;calendar_sync_error?:null;calendar_synced_at?:null}={status};
    if(status==="completed"){patch.calendar_event_id=null;patch.calendar_sync_status="not_scheduled";patch.calendar_sync_error=null}
    if(status==="cancelled"){patch.calendar_event_id=null;patch.calendar_sync_status=oldEventId?"pending":"not_scheduled";patch.calendar_sync_error=null}
    const {error}=await auth.db.from("leads").update(patch).eq("id",id).eq("status",current);
    if(error)throw new Error(`Could not update lead: ${error.message}`);
    if(oldEventId&&status==="cancelled"){
      try{await deleteCalendarEvent(oldEventId);await auth.db.from("leads").update({calendar_sync_status:"not_scheduled",calendar_sync_error:null,calendar_synced_at:null}).eq("id",id)}
      catch(error){const message=error instanceof Error?error.message:"Unknown calendar error";console.error("Calendar cancellation cleanup failed",error);await auth.db.from("leads").update({calendar_sync_status:"failed",calendar_sync_error:message.slice(0,500)}).eq("id",id)}
    }
  }
  refresh();
}

export async function retryCalendarSync(formData:FormData){
  const auth=await requireAdmin();if(!auth)throw new Error("Unauthorized");
  const id=String(formData.get("id")||"");if(!id)throw new Error("Invalid lead");
  const {data:lead,error}=await auth.db.from("leads").select("id,full_name,property_address,requested_date,requested_time,phone,email,notes,estimated_price,frequency,status,calendar_event_id").eq("id",id).single();
  if(error||!lead||lead.status!=="scheduled")throw new Error("Only scheduled leads can be synchronized");
  if(lead.calendar_event_id)throw new Error("Lead is already synchronized");
  await auth.db.from("leads").update({calendar_sync_status:"pending",calendar_sync_error:null}).eq("id",id);
  try{
    const eventId=await createCalendarEvent(lead);if(!eventId)throw new Error("Google Calendar is not configured");
    const {error:saveError}=await auth.db.from("leads").update({calendar_event_id:eventId,calendar_sync_status:"synced",calendar_sync_error:null,calendar_synced_at:new Date().toISOString()}).eq("id",id);
    if(saveError){await deleteCalendarEvent(eventId).catch(()=>undefined);throw saveError}
  }catch(syncError){const message=syncError instanceof Error?syncError.message:"Unknown calendar error";await auth.db.from("leads").update({calendar_sync_status:"failed",calendar_sync_error:message.slice(0,500)}).eq("id",id);throw new Error("Google Calendar synchronization failed")}
  refresh();
}

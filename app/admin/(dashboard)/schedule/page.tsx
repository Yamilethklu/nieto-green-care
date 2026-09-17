import {requireAdmin} from "@/lib/supabase/auth";
import {saveCapacity} from "../actions";

export default async function Page(){
  const auth=await requireAdmin();
  const today=new Date().toISOString().slice(0,10);
  const {data=[]}=await auth!.db.from("schedule_capacity").select("service_date,max_slots,booked_slots,is_blocked,note").gte("service_date",today).order("service_date").limit(60);
  return <div>
    <header className="admin-page-head"><div><div className="eyebrow">CAPACITY & SCHEDULE</div><h1>Service calendar</h1><p>Set daily capacity, monitor bookings and block dates for weather, holidays or maintenance.</p></div></header>
    <section className="admin-panel">
      <div className="admin-panel-head"><div><h2>Add or update a day</h2><p>Booked slots are calculated from scheduled leads. Set the maximum only after confirming the crew&apos;s real capacity for that date.</p></div></div>
      <form action={saveCapacity} className="admin-editor admin-editor-pad">
        <label>Date<input className="input" type="date" name="service_date" min={today} required/></label>
        <label>Maximum slots<input className="input" type="number" min="0" name="max_slots" placeholder="Enter confirmed capacity" required/></label>
        <label>Internal note<input className="input" name="note" placeholder="Weather, holiday, crew note…"/></label>
        <label className="check"><input type="checkbox" name="is_blocked"/> Block this date</label>
        <button className="btn btn-primary">Save day</button>
      </form>
      {data?.length?<div className="schedule-grid">{data.map(x=>{const pct=x.max_slots?Math.min(100,Math.round(x.booked_slots/x.max_slots*100)):0;return <form action={saveCapacity} className={`schedule-day ${x.is_blocked?"blocked":""}`} key={x.service_date}><input type="hidden" name="service_date" value={x.service_date}/><div className="schedule-date"><strong>{new Date(`${x.service_date}T12:00:00`).toLocaleDateString("en-US",{weekday:"short"})}</strong><span>{new Date(`${x.service_date}T12:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span></div><div className="capacity-bar"><span style={{width:`${pct}%`}}/></div><strong>{x.booked_slots} booked</strong><label>Maximum slots<input className="input" type="number" min="0" name="max_slots" defaultValue={x.max_slots}/></label><label>Note<input className="input" name="note" defaultValue={x.note||""}/></label><label className="check"><input type="checkbox" name="is_blocked" defaultChecked={x.is_blocked}/> Blocked</label><button className="btn btn-light">Update</button></form>})}</div>:<div className="empty"><h3>No capacity configured</h3><p>Add a service date only when its real crew capacity is known.</p></div>}
    </section>
  </div>;
}

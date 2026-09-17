import {createSign} from "node:crypto";

type CalendarLead={id:string;full_name:string;property_address:string;requested_date:string;requested_time:string|null;phone:string;email:string;notes:string|null;estimated_price:number|null;frequency:string};
const b64=(value:string|Buffer)=>Buffer.from(value).toString("base64url");

async function accessToken(){
  const email=process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey=process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if(!email||!rawKey)return null;
  const key=rawKey.replace(/\\n/g,"\n");
  const now=Math.floor(Date.now()/1000);
  const header=b64(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const claim=b64(JSON.stringify({iss:email,scope:"https://www.googleapis.com/auth/calendar",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600}));
  const unsigned=`${header}.${claim}`;
  const signer=createSign("RSA-SHA256");signer.update(unsigned);signer.end();
  const jwt=`${unsigned}.${signer.sign(key).toString("base64url")}`;
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt}),cache:"no-store"});
  if(!r.ok)throw new Error("Google Calendar authentication failed");
  const body=await r.json() as {access_token:string};
  return body.access_token;
}

function calendarConfig(){
  const calendarId=process.env.GOOGLE_CALENDAR_ID;
  const duration=Number(process.env.GOOGLE_EVENT_DURATION_MINUTES);
  if(!calendarId)return null;
  if(!Number.isInteger(duration)||duration<=0||duration>1440)throw new Error("GOOGLE_EVENT_DURATION_MINUTES must be an integer from 1 to 1440");
  return {calendarId,duration};
}

function addMinutes(date:string,time:string,minutes:number){
  const [year,month,day]=date.split("-").map(Number);
  const [hour,minute]=time.split(":").map(Number);
  const value=new Date(Date.UTC(year,month-1,day,hour,minute));
  value.setUTCMinutes(value.getUTCMinutes()+minutes);
  const yyyy=value.getUTCFullYear();const mm=String(value.getUTCMonth()+1).padStart(2,"0");const dd=String(value.getUTCDate()).padStart(2,"0");const hh=String(value.getUTCHours()).padStart(2,"0");const min=String(value.getUTCMinutes()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
}

export async function createCalendarEvent(lead:CalendarLead){
  const config=calendarConfig();if(!config)return null;
  if(!lead.requested_date||!lead.requested_time)throw new Error("A service date and time are required before scheduling");
  const token=await accessToken();if(!token)throw new Error("Google Calendar credentials are incomplete");
  const time=lead.requested_time.slice(0,5);if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error("Invalid requested service time");
  const start=`${lead.requested_date}T${time}:00`;const end=addMinutes(lead.requested_date,time,config.duration);
  const event={summary:`Nieto Green Care — ${lead.full_name}`,location:lead.property_address,description:`Customer: ${lead.full_name}\nPhone: ${lead.phone}\nEmail: ${lead.email}\nFrequency: ${lead.frequency}\nEstimate: ${lead.estimated_price??"Custom quote"}\n${lead.notes||""}`,start:{dateTime:start,timeZone:"America/Chicago"},end:{dateTime:end,timeZone:"America/Chicago"},extendedProperties:{private:{lead_id:lead.id}}};
  const r=await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events`,{method:"POST",headers:{authorization:`Bearer ${token}`,"content-type":"application/json"},body:JSON.stringify(event),cache:"no-store"});
  if(!r.ok)throw new Error(`Google Calendar event creation failed (${r.status})`);
  const body=await r.json() as {id:string};return body.id;
}

export async function deleteCalendarEvent(eventId:string){
  const config=calendarConfig();if(!config||!eventId)return;
  const token=await accessToken();if(!token)throw new Error("Google Calendar credentials are incomplete");
  const r=await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(eventId)}`,{method:"DELETE",headers:{authorization:`Bearer ${token}`},cache:"no-store"});
  if(!r.ok&&r.status!==404&&r.status!==410)throw new Error(`Google Calendar event deletion failed (${r.status})`);
}

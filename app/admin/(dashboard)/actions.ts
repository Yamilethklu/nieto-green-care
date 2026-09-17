"use server";
import {revalidatePath} from "next/cache";
import {requireAdmin} from "@/lib/supabase/auth";

const text=(f:FormData,k:string)=>String(f.get(k)||"").trim();
const bool=(f:FormData,k:string)=>f.get(k)==="on";
const num=(f:FormData,k:string)=>Number(f.get(k)||0);
async function admin(){const auth=await requireAdmin();if(!auth)throw new Error("Unauthorized");return auth.db;}
function refresh(...paths:string[]){paths.forEach(revalidatePath);}

export async function saveService(f:FormData){const db=await admin();const id=text(f,"id");const row={slug:text(f,"slug"),name_en:text(f,"name_en"),name_es:text(f,"name_es"),description_en:text(f,"description_en"),description_es:text(f,"description_es"),starting_price:num(f,"starting_price"),pricing_unit:text(f,"pricing_unit")||null,active:bool(f,"active"),featured:bool(f,"featured"),sort_order:num(f,"sort_order")};if(!row.slug||!row.name_en||!row.name_es)throw new Error("Service name and slug are required");const q=id?db.from("services").update(row).eq("id",id):db.from("services").insert(row);const {error}=await q;if(error)throw new Error(error.message);refresh("/admin/services","/en/services","/es/services");}
export async function deleteService(f:FormData){const db=await admin();const {error}=await db.from("services").delete().eq("id",text(f,"id"));if(error)throw new Error(error.message);refresh("/admin/services");}

export async function savePricing(f:FormData){const db=await admin();const id=text(f,"id");const max=text(f,"max_sqft");const row={service_id:text(f,"service_id"),min_sqft:num(f,"min_sqft"),max_sqft:max?Number(max):null,price:num(f,"price"),frequency:text(f,"frequency"),active:bool(f,"active")};if(!row.service_id||row.price<=0)throw new Error("Service and a positive price are required");const q=id?db.from("pricing_rules").update(row).eq("id",id):db.from("pricing_rules").insert(row);const {error}=await q;if(error)throw new Error(error.message);refresh("/admin/pricing");}
export async function deletePricing(f:FormData){const db=await admin();const {error}=await db.from("pricing_rules").delete().eq("id",text(f,"id"));if(error)throw new Error(error.message);refresh("/admin/pricing");}

export async function saveArea(f:FormData){const db=await admin();const id=text(f,"id");const row={slug:text(f,"slug"),name:text(f,"name"),content_en:text(f,"content_en"),content_es:text(f,"content_es"),active:bool(f,"active"),sort_order:num(f,"sort_order")};if(!row.slug||!row.name)throw new Error("Area name and slug are required");const q=id?db.from("service_areas").update(row).eq("id",id):db.from("service_areas").insert(row);const {error}=await q;if(error)throw new Error(error.message);refresh("/admin/service-areas","/en/service-areas","/es/service-areas");}
export async function deleteArea(f:FormData){const db=await admin();const {error}=await db.from("service_areas").delete().eq("id",text(f,"id"));if(error)throw new Error(error.message);refresh("/admin/service-areas");}

export async function saveCapacity(f:FormData){const db=await admin();const date=text(f,"service_date");if(!date)throw new Error("Date required");const {error}=await db.from("schedule_capacity").upsert({service_date:date,max_slots:Math.max(0,num(f,"max_slots")),is_blocked:bool(f,"is_blocked"),note:text(f,"note")||null},{onConflict:"service_date"});if(error)throw new Error(error.message);refresh("/admin/schedule","/admin");}

export async function saveSetting(f:FormData){const db=await admin();const key=text(f,"key");if(!key)throw new Error("Setting key required");const value={value:text(f,"value")};const {error}=await db.from("site_settings").upsert({key,value},{onConflict:"key"});if(error)throw new Error(error.message);refresh("/admin/settings");}

export async function updateGallery(f:FormData){const db=await admin();const {error}=await db.from("gallery").update({caption_en:text(f,"caption_en")||null,caption_es:text(f,"caption_es")||null,alt_text:text(f,"alt_text"),sort_order:num(f,"sort_order"),published:bool(f,"published")}).eq("id",text(f,"id"));if(error)throw new Error(error.message);refresh("/admin/gallery","/en/gallery","/es/gallery");}
export async function deleteGallery(f:FormData){const db=await admin();const id=text(f,"id");const path=text(f,"storage_path");if(path)await db.storage.from("gallery").remove([path]);const {error}=await db.from("gallery").delete().eq("id",id);if(error)throw new Error(error.message);refresh("/admin/gallery","/en/gallery","/es/gallery");}

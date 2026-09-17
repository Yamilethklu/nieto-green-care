import {fallbackServices} from "./data";import {publicDb} from "./supabase/server";import type {Service} from "@/types";
export async function getServices():Promise<Service[]>{const db=publicDb();if(!db)return fallbackServices;const {data,error}=await db.from("services").select("*").eq("active",true).order("sort_order");return error||!data?fallbackServices:data as Service[]}

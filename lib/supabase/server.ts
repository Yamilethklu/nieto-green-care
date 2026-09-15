import {createClient} from "@supabase/supabase-js";
export const configured=()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export function publicDb(){if(!configured())return null;return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false}})}
export function adminDb(){if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return null;return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})}

"use client";

import {createBrowserClient} from "@supabase/ssr";
import {useRouter} from "next/navigation";

export function Logout(){
  const router=useRouter();
  return <button className="btn btn-light" onClick={async()=>{
    const u=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const k=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(u&&k)await createBrowserClient(u,k).auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }}>Logout</button>;
}

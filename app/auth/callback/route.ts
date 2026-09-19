import {NextResponse} from "next/server";
import {sessionClient} from "@/lib/supabase/auth";

export async function GET(request:Request){
  const requestUrl=new URL(request.url);
  const code=requestUrl.searchParams.get("code");
  const nextParam=requestUrl.searchParams.get("next");
  const next=nextParam?.startsWith("/")&&!nextParam.startsWith("//")?nextParam:"/admin";

  if(code){
    const db=await sessionClient();
    if(db){
      const {error}=await db.auth.exchangeCodeForSession(code);
      if(!error)return NextResponse.redirect(new URL(next,requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/admin/login?error=oauth",requestUrl.origin));
}

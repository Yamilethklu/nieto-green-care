"use client";

import {createBrowserClient} from "@supabase/ssr";
import {useState} from "react";

export function LoginForm(){
  const [error,setError]=useState("");

  function client(){
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(!url||!key){setError("Database connection not configured");return null}
    return createBrowserClient(url,key);
  }

  async function googleSignIn(){
    setError("");
    const db=client();
    if(!db)return;
    const {error}=await db.auth.signInWithOAuth({
      provider:"google",
      options:{redirectTo:`${window.location.origin}/auth/callback?next=/admin`}
    });
    if(error)setError("No se pudo iniciar sesión con Google.");
  }

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setError("");
    const db=client();
    if(!db)return;
    const f=new FormData(e.currentTarget);
    const {error}=await db.auth.signInWithPassword({
      email:String(f.get("email")),
      password:String(f.get("password"))
    });
    if(error){setError("Invalid credentials or unauthorized account.");return}
    window.location.assign("/admin");
  }

  return <div className="card grid">
    <h1>Admin sign in</h1>
    <button className="btn btn-primary" type="button" onClick={googleSignIn}>Continuar con Google</button>
    <p style={{textAlign:"center",margin:0}}>o</p>
    <form className="grid" onSubmit={submit}>
      <div className="field"><label>Email</label><input className="input" name="email" type="email" required/></div>
      <div className="field"><label>Password</label><input className="input" name="password" type="password" required/></div>
      <button className="btn" type="submit">Sign in</button>
    </form>
    <p role="alert">{error}</p>
  </div>
}

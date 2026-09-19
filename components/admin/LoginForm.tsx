"use client";

import {createBrowserClient} from "@supabase/ssr";
import {useState} from "react";

export function LoginForm(){
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  function client(){
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(!url||!key){setError("Database connection not configured");return null}
    return createBrowserClient(url,key);
  }

  async function googleSignIn(){
    setError("");
    setMessage("");
    const db=client();
    if(!db)return;
    const {error}=await db.auth.signInWithOAuth({provider:"google",options:{redirectTo:`${window.location.origin}/auth/callback?next=/admin`}});
    if(error)setError("No se pudo iniciar sesión con Google.");
  }

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");setMessage("");setBusy(true);
    const db=client();
    if(!db){setBusy(false);return}
    const f=new FormData(e.currentTarget);
    const {error}=await db.auth.signInWithPassword({email:String(f.get("email")),password:String(f.get("password"))});
    setBusy(false);
    if(error){setError("Credenciales inválidas o cuenta no autorizada.");return}
    window.location.assign("/admin");
  }

  async function forgotPassword(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");setMessage("");setBusy(true);
    const db=client();
    if(!db){setBusy(false);return}
    const email=String(new FormData(e.currentTarget).get("recovery_email")||"").trim();
    const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/auth/callback?next=/admin/reset-password`});
    setBusy(false);
    if(error){setError("No se pudo enviar el correo de recuperación.");return}
    setMessage("Revisa tu correo. El enlace te llevará a crear una contraseña nueva para el panel.");
  }

  return <div className="card grid">
    <h1>Admin sign in</h1>
    <button className="btn btn-primary" type="button" onClick={googleSignIn} disabled={busy}>Continuar con Google</button>
    <p style={{textAlign:"center",margin:0}}>o</p>
    <form className="grid" onSubmit={submit}>
      <div className="field"><label htmlFor="email">Email</label><input id="email" className="input" name="email" type="email" autoComplete="email" required/></div>
      <div className="field"><label htmlFor="password">Password</label><input id="password" className="input" name="password" type="password" autoComplete="current-password" required/></div>
      <button className="btn" type="submit" disabled={busy}>{busy?"Signing in…":"Sign in"}</button>
    </form>
    <form className="grid" onSubmit={forgotPassword}>
      <div className="field"><label htmlFor="recovery_email">¿Olvidaste tu contraseña?</label><input id="recovery_email" className="input" name="recovery_email" type="email" autoComplete="email" placeholder="Tu correo de Supabase" required/></div>
      <button className="btn btn-light" type="submit" disabled={busy}>Enviar enlace de recuperación</button>
    </form>
    {message&&<p role="status">{message}</p>}
    {error&&<p role="alert">{error}</p>}
  </div>
}

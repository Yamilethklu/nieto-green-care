"use client";

import {createBrowserClient} from "@supabase/ssr";
import {useState} from "react";

export function ResetPasswordForm(){
  const [password,setPassword]=useState("");
  const [confirmation,setConfirmation]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setError("");
    if(password.length<8){setError("La contraseña debe tener al menos 8 caracteres.");return}
    if(password!==confirmation){setError("Las contraseñas no coinciden.");return}
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(!url||!key){setError("Database connection not configured");return}
    setBusy(true);
    const db=createBrowserClient(url,key);
    const {error}=await db.auth.updateUser({password});
    setBusy(false);
    if(error){setError("El enlace expiró o no es válido. Solicita otro enlace de recuperación.");return}
    window.location.assign("/admin");
  }

  return <div className="card grid">
    <h1>Crear nueva contraseña</h1>
    <p>Define una contraseña nueva para acceder al panel de control.</p>
    <form className="grid" onSubmit={submit}>
      <div className="field"><label htmlFor="new-password">Nueva contraseña</label><input id="new-password" className="input" type="password" minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
      <div className="field"><label htmlFor="confirm-password">Confirmar contraseña</label><input id="confirm-password" className="input" type="password" minLength={8} autoComplete="new-password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} required/></div>
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy?"Guardando…":"Guardar contraseña y entrar"}</button>
    </form>
    {error&&<p role="alert">{error}</p>}
  </div>
}

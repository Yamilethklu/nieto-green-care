"use client";
import {useState} from "react";

export function GalleryUpload(){
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setMessage("");
    const form=new FormData(event.currentTarget);form.set("published",String(form.get("published")==="on"));
    const response=await fetch("/api/admin/gallery",{method:"POST",body:form});
    const body=await response.json();setBusy(false);setMessage(body.error||"Uploaded. Refresh to see the image.");
    if(response.ok)event.currentTarget.reset();
  }
  return <form className="card upload-form" onSubmit={submit}><div className="eyebrow">Gallery upload</div><h2 className="section-title">Add approved garden work</h2><p className="muted">JPG, PNG, or WebP up to 5 MB. Add truthful alt text before publishing.</p><label className="field">Image<input className="input" name="file" type="file" accept="image/jpeg,image/png,image/webp" required/></label><label className="field">Alt text<input className="input" name="alt_text" minLength={5} maxLength={200} required/></label><div className="grid upload-fields"><label className="field">English caption<input className="input" name="caption_en" maxLength={300}/></label><label className="field">Spanish caption<input className="input" name="caption_es" maxLength={300}/></label></div><label><input name="published" type="checkbox"/> Publish immediately</label><button className="btn btn-primary" disabled={busy}>{busy?"Uploading…":"Upload image"}</button>{message&&<p className="notice" role="status">{message}</p>}</form>;
}
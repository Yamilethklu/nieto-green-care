import {notFound} from "next/navigation";
import Link from "next/link";
import {isLocale} from "@/lib/i18n";
import {publicDb} from "@/lib/supabase/server";
import {galleryFallback} from "@/lib/data";

export default async function Page({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;if(!isLocale(locale))notFound();const es=locale==="es";
 const db=publicDb();const {data}=db?await db.from("gallery").select("*").eq("published",true).order("sort_order"):{data:null};
 const photos=data?.length?data:galleryFallback;
 return <section className="section"><div className="container">
  <div className="eyebrow">{es?"TRABAJOS REALES":"REAL PROJECTS"}</div>
  <h1 className="section-title">{es?"Resultados reales en propiedades de Central Texas.":"Real results on Central Texas properties."}</h1>
  <p className="muted gallery-intro">{es?"Césped, mulch, piedra, jardineras, poda y mantenimiento realizados por Nieto Green Care. Esta galería usa únicamente fotografías reales del trabajo.":"Lawns, mulch, stone, garden beds, trimming, and maintenance completed by Nieto Green Care. This gallery uses only real project photography."}</p>
  {photos.length?<div className="gallery-grid">{photos.map((x:any,i:number)=><figure className={`gallery-photo ${i===0?"gallery-featured":""}`} key={x.id}><img loading={i===0?"eager":"lazy"} width="1200" height="900" src={x.image_url} alt={x.alt_text}/><figcaption><span className="gallery-label">{es?"PROYECTO NIETO GREEN CARE":"NIETO GREEN CARE PROJECT"}</span>{locale==="es"?x.caption_es:x.caption_en}</figcaption></figure>)}</div>:<div className="project-empty"><div><div className="eyebrow">{es?"PORTAFOLIO EN PREPARACIÓN":"PORTFOLIO BEING PREPARED"}</div><h2>{es?"Estamos preparando las fotografías reales para publicación.":"Real project photography is being prepared for publication."}</h2><p className="muted">{es?"No mostramos fotografías de stock como si fueran trabajos de la empresa.":"We do not present stock photography as company work."}</p></div><Link className="btn btn-primary" href={`/${locale}/quote`}>{es?"SOLICITAR COTIZACIÓN":"GET A QUOTE"}</Link></div>}
 </div></section>;
}

import Link from "next/link";
import {notFound} from "next/navigation";
import {isLocale} from "@/lib/i18n";
import {publicDb} from "@/lib/supabase/server";
import {galleryFallback} from "@/lib/data";

export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const es=locale==="es";
  const db=publicDb();
  const {data}=db?await db.from("gallery").select("*").eq("published",true).order("sort_order"):{data:null};
  const photos=data?.length?data:galleryFallback;

  return <>
    <section className="portfolio-hero">
      <div className="container portfolio-hero-grid">
        <div>
          <div className="eyebrow">{es?"TRABAJOS REALES • CENTRAL TEXAS":"REAL WORK • CENTRAL TEXAS"}</div>
          <h1 className="section-title portfolio-title">{es?"Resultados que puedes ver antes de llamarnos.":"See the quality before you call."}</h1>
          <p className="muted portfolio-lead">{es?"Césped, mulch, piedra, jardineras, poda y mantenimiento realizados por Nieto Green Care. Esta galería está reservada exclusivamente para fotografías reales de nuestros proyectos.":"Lawns, mulch, stone, garden beds, trimming, and property care completed by Nieto Green Care. This portfolio is reserved exclusively for photos from our real projects."}</p>
          <div className="actions"><Link className="btn btn-primary" href={`/${locale}/quote`}>{es?"COTIZAR MI PROPIEDAD":"GET MY QUOTE"}</Link></div>
        </div>
        <div className="portfolio-stats"><strong>{es?"Trabajo real. Sin fotos de stock.":"Real work. No stock photos."}</strong><span>{es?"Publicamos únicamente proyectos aprobados de Nieto Green Care.":"Only approved Nieto Green Care projects are published here."}</span></div>
      </div>
    </section>
    <section className="section">
      <div className="container">
        {photos.length?<div className="gallery-grid">{photos.map((x:any,i:number)=><figure className={`gallery-photo ${i===0?"gallery-featured":""}`} key={x.id}><img loading={i===0?"eager":"lazy"} width="1400" height="1050" src={x.image_url} alt={x.alt_text}/><figcaption><span>{es?"Proyecto Nieto Green Care":"Nieto Green Care project"}</span><strong>{es?x.caption_es:x.caption_en}</strong></figcaption></figure>)}</div>:<div className="real-work-empty"><div className="eyebrow">{es?"PORTAFOLIO EN PREPARACIÓN":"PORTFOLIO IN PROGRESS"}</div><h2>{es?"Estamos preparando las fotografías reales para publicarlas con la mejor calidad.":"We’re preparing our real project photos for a high-quality web presentation."}</h2><p className="muted">{es?"No utilizamos fotografías genéricas para representar trabajos que no sean nuestros.":"We do not use generic photography to represent work we did not perform."}</p><Link className="btn btn-primary" href={`/${locale}/quote`}>{es?"SOLICITAR COTIZACIÓN":"REQUEST A QUOTE"}</Link></div>}
      </div>
    </section>
  </>;
}

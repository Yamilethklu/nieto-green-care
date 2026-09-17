"use client";
import Link from "next/link";
import {useState} from "react";
import type {Locale} from "@/types";
import {t} from "@/lib/i18n";
import {BUSINESS} from "@/lib/config";

export function Header({locale}:{locale:Locale}){
 const [open,setOpen]=useState(false);const x=t[locale],base=`/${locale}`;
 const links=[["",x.home],["/services",x.services],["/service-areas",x.areas],["/gallery",x.gallery],["/about",x.about],["/faq",x.faq],["/contact",x.contact]];
 return <><header className="header"><div className="container nav"><Link className="brand" href={base} aria-label="Nieto Green Care home">NIETO <span>GREEN CARE</span></Link><nav className="navlinks" aria-label="Main navigation">{links.map(([h,n])=><Link key={h} href={base+h}>{n}</Link>)}</nav><Link href={`/${locale==="en"?"es":"en"}`} aria-label="Change language" style={{fontWeight:900}}>{locale==="en"?"ES":"EN"}</Link><a className="btn btn-light" href={`tel:${BUSINESS.phone}`}>{x.call}</a><Link className="btn btn-primary" href={`${base}/quote`}>{x.quote}</Link><button className="mobile-menu btn btn-light" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label="Menu">{open?"✕":"☰"}</button></div>{open&&<nav className="container grid" aria-label="Mobile navigation" style={{paddingBottom:"1.25rem",gap:"0"}}>{links.map(([h,n])=><Link style={{padding:"13px 0",fontWeight:850,borderBottom:"1px solid #e6eee5"}} onClick={()=>setOpen(false)} key={h} href={base+h}>{n}</Link>)}</nav>}</header><div className="sticky-actions"><a href={`tel:${BUSINESS.phone}`}>{x.call}</a><a href={`sms:${BUSINESS.phone}`}>{x.text}</a><Link href={`${base}/quote`}>{x.quote}</Link></div></>;
}

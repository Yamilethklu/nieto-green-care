import type {Locale} from "@/types";
export const isLocale=(x:string):x is Locale=>x==="en"||x==="es";
export const t={en:{home:"Home",services:"Services",areas:"Service Areas",gallery:"Gallery",about:"About",faq:"FAQ",contact:"Contact",quote:"Get a Quote",call:"Call Now",text:"Text Us",custom:"Custom Quote"},es:{home:"Inicio",services:"Servicios",areas:"Áreas de servicio",gallery:"Galería",about:"Nosotros",faq:"Preguntas",contact:"Contacto",quote:"Cotización",call:"Llamar",text:"Mensaje",custom:"Cotización personalizada"}};

export const BUSINESS={name:"Nieto Green Care",phone:process.env.NEXT_PUBLIC_BUSINESS_PHONE||"7373144215",displayPhone:"737-314-4215",email:process.env.NEXT_PUBLIC_BUSINESS_EMAIL||"nietogreencare@gmail.com"};
export const APP_URL=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";
export const PAYMENT={cashAppUrl:process.env.NEXT_PUBLIC_CASH_APP_URL||"https://cash.app/$JaimeNietoMorales",zellePhone:process.env.NEXT_PUBLIC_ZELLE_PHONE||BUSINESS.phone};
export const MAP={tiles:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",attribution:"Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, and the GIS User Community"};

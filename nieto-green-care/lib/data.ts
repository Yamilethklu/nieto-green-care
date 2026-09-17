import type {Locale,Service} from "@/types";
const raw=[
["lawn-mowing","Lawn Mowing","Corte de césped","A clean, even cut with careful edging and a tidy finish.","Corte uniforme, bordes cuidados y acabado limpio."],
["tree-bush-trimming","Tree & Bush Trimming","Poda de árboles y arbustos","Thoughtful trimming to keep growth controlled and outdoor areas neat.","Poda cuidadosa para controlar el crecimiento y mantener áreas ordenadas."],
["sod-installation","Sod Installation","Instalación de césped","Site preparation and sod placement tailored to your property.","Preparación del terreno e instalación adaptada a su propiedad."],
["flower-beds","Flower Beds","Jardineras","Defined, maintained beds that complement your landscape.","Jardineras definidas y cuidadas que complementan su paisaje."],
["fertilization","Fertilization","Fertilización","Application planning based on your lawn and seasonal needs.","Aplicación planificada según el césped y la temporada."],
["gravel-stone","Gravel & Stone","Grava y piedra","Practical hardscape accents with clean installation.","Detalles funcionales de piedra con instalación limpia."],
["metal-edging","Metal Edging","Borde metálico","Crisp boundaries for lawns, beds, and pathways.","Límites definidos para césped, jardineras y caminos."],
["mulch","Mulch","Mantillo","Fresh coverage that helps beds retain moisture and look finished.","Cobertura que ayuda a conservar humedad y mejora el acabado."],
["yard-cleanups","Yard Cleanups","Limpieza de jardín","Focused cleanup for overgrowth, leaves, and landscape debris.","Limpieza de crecimiento excesivo, hojas y residuos del jardín."],
["topsoil","Topsoil","Tierra vegetal","Topsoil placement for grading, beds, and lawn preparation.","Colocación de tierra vegetal para nivelación y preparación."],
["recurring-lawn-service","Recurring Lawn Service","Servicio recurrente","Dependable ongoing care with a schedule that fits your property.","Cuidado continuo confiable con una frecuencia adecuada."]];
export const fallbackServices:Service[]=raw.map((x,i)=>({id:String(i+1),slug:x[0],name_en:x[1],name_es:x[2],description_en:x[3],description_es:x[4],starting_price:0,pricing_unit:null,image_url:null,active:true,featured:i<6,sort_order:i+1}));
export const areas=[
{slug:"hutto-tx",name:"Hutto",en:"Dependable lawn care for Hutto homes, from routine mowing to seasonal property cleanup.",es:"Cuidado confiable para hogares de Hutto, desde corte rutinario hasta limpieza estacional."},
{slug:"round-rock-tx",name:"Round Rock",en:"Flexible lawn and landscape maintenance for established neighborhoods and growing properties.",es:"Mantenimiento flexible de césped y jardines para vecindarios y propiedades en crecimiento."},
{slug:"georgetown-tx",name:"Georgetown",en:"Detail-focused landscape care suited to Georgetown yards, beds, and outdoor living areas.",es:"Cuidado detallado para patios, jardineras y áreas exteriores de Georgetown."},
{slug:"leander-tx",name:"Leander",en:"Straightforward scheduling for lawn service and landscape improvements across Leander.",es:"Programación sencilla para césped y mejoras de paisaje en Leander."},
{slug:"cedar-park-tx",name:"Cedar Park",en:"Consistent property care that keeps Cedar Park lawns clean, edged, and manageable.",es:"Cuidado consistente que mantiene los jardines de Cedar Park limpios y definidos."},
{slug:"liberty-hill-tx",name:"Liberty Hill",en:"Practical lawn and acreage-edge maintenance with clear communication from request to follow-up.",es:"Mantenimiento práctico con comunicación clara desde la solicitud hasta el seguimiento."},
{slug:"jarrell-tx",name:"Jarrell",en:"Local lawn service options for routine upkeep, cleanup, and new landscape projects.",es:"Opciones locales para mantenimiento, limpieza y nuevos proyectos de jardín."}];
export const galleryFallback=[
{id:"garden-1",image_url:"https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1200&q=85",alt_text:"Freshly edged green lawn beside a garden bed",caption_en:"A clean edge changes the whole yard.",caption_es:"Un borde limpio transforma todo el jardín."},
{id:"garden-2",image_url:"https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=85",alt_text:"Hands planting flowers in rich garden soil",caption_en:"Thoughtful planting for a garden that lasts.",caption_es:"Plantación cuidadosa para un jardín duradero."},
{id:"garden-3",image_url:"https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=1200&q=85",alt_text:"Layered garden beds with ornamental plants",caption_en:"Outdoor spaces made easier to enjoy.",caption_es:"Espacios exteriores más fáciles de disfrutar."}];
export const localized=(s:Service,l:Locale)=>({name:l==="es"?s.name_es:s.name_en,description:l==="es"?s.description_es:s.description_en});

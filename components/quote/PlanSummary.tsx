import type { BookingSummary } from "@/lib/integrations";

const mowingIncluded = {
  en: ["Mow lawn", "Line trim", "Edge hard surfaces", "Blow debris from serviced areas", "Text support for your request"],
  es: ["Corte de césped", "Desbroce con línea", "Bordes en superficies duras", "Soplado de residuos en áreas atendidas", "Soporte por mensaje para su solicitud"],
};

export function PlanSummary({ booking, locale, optionalServices = [], mowArea = "front_back", latitude, longitude }: { booking: BookingSummary; locale: "en" | "es"; optionalServices?: string[]; mowArea?: "front_back" | "front" | "back"; latitude?: number; longitude?: number }) {
  const es = locale === "es";
  const custom = booking.estimate === null;
  return (
    <article className="card plan-card">
      <div className="plan-head">
        <div>
          <div className="eyebrow">{es ? "Su plan solicitado" : "Your requested plan"}</div>
          <h2 className="section-title">{booking.service}</h2>
          <div className="plan-price">{custom ? (es ? "Cotización" : "Custom quote") : `$${booking.estimate!.toFixed(2)}`}</div>
          <p className="muted">{es ? "Estimado sujeto a revisión y confirmación." : "Estimate subject to review and confirmation."}</p>
        </div>
        <div className="notice">
          <strong>{es ? "Solicitud, no cita confirmada" : "Request, not a confirmed appointment"}</strong>
          <p>{es ? "Nieto Green Care confirmará alcance, fecha e importe final por teléfono o mensaje." : "Nieto Green Care will confirm scope, date, and final amount by phone or text."}</p>
        </div>
        {latitude && longitude ? <div className="satellite-preview" role="img" aria-label={es ? "Vista satelital aproximada de la propiedad seleccionada" : "Approximate satellite view of the selected property"} style={{backgroundImage:`linear-gradient(rgba(0,230,118,.18),rgba(0,230,118,.18)),url("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${longitude-.002},${latitude-.002},${longitude+.002},${latitude+.002}&bboxSR=4326&size=700,380&format=jpg&f=image")`}}><span>{es ? "Área medida en el mapa" : "Area measured on map"}</span></div> : null}
      </div>
      <dl className="plan-meta">
        <div><dt>{es ? "Dirección" : "Address"}</dt><dd>{booking.address}</dd></div>
        <div><dt>{es ? "Área de césped" : "Lawn square footage"}</dt><dd>{Math.round(booking.sqft).toLocaleString("en-US")} sq ft</dd></div>
        <div><dt>{es ? "Fecha solicitada" : "Requested date"}</dt><dd>{booking.date} · {booking.time}</dd></div>
        <div><dt>{es ? "Frecuencia" : "Frequency"}</dt><dd>{booking.frequency.replace("_", " ")}</dd></div>
        <div><dt>{es ? "Área de corte" : "Mow area"}</dt><dd>{{front_back: es ? "Frente y posterior" : "Front & Back",front: es ? "Solo frente" : "Front Only",back: es ? "Solo trasero" : "Back Only"}[mowArea]}</dd></div>
        <div><dt>{es ? "Preferencia de pago" : "Payment preference"}</dt><dd>{booking.payment}</dd></div>
        <div><dt>{es ? "Estado" : "Status"}</dt><dd>{es ? "Pendiente de confirmación" : "Pending confirmation"}</dd></div>
      </dl>
      <div className="included">
        <div className="included-title">{es ? "Incluido en el servicio de corte" : "Included with lawn mowing"}</div>
        <ul className="check-list">{mowingIncluded[locale].map(item => <li key={item}>{item}</li>)}</ul>
        {optionalServices.length > 0 && <><div className="included-title">{es ? "Complementos solicitados" : "Requested add-ons"}</div><ul className="check-list">{optionalServices.map(item => <li key={item}>{item === "flower_bed_cleaning" ? (es ? "Limpieza de camas de flores" : "Flower Bed Cleaning") : (es ? "Poda de arbustos" : "Bush Trimming")}</li>)}</ul></>}
        <p className="payment-note">{es ? "La inclusión exacta depende del servicio seleccionado y se confirmará antes del trabajo." : "Exact inclusions depend on the selected service and are confirmed before work begins."}</p>
      </div>
    </article>
  );
}

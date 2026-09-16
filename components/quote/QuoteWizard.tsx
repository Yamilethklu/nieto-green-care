"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Frequency, Locale, Service } from "@/types";
import { BUSINESS } from "@/lib/config";
import { calendarUrl, smsUrl, type BookingSummary } from "@/lib/integrations";
import type { MapValue } from "./LawnMap";
import { PlanSummary } from "./PlanSummary";
import { Turnstile } from "@/components/forms/Turnstile";

const LawnMap = dynamic(() => import("./LawnMap"), {
  ssr: false,
  loading: () => <div className="notice">Loading satellite map…</div>,
});

type GeoResult = { display_name: string; lat: string; lon: string };
type YesNo = "yes" | "no";
type MowArea = "front_back" | "front" | "back";
const emptyGeo: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

const questions = [
  ["grass_over_6", "Is the grass over 6 inches?", "¿El césped mide más de 6 pulgadas?"],
  ["grass_over_12", "Is the grass over 12 inches?", "¿El césped mide más de 12 pulgadas?"],
  ["community_gate", "Is there a community gate?", "¿Hay portón comunitario?"],
  ["backyard_gate", "Is there a backyard gate?", "¿Hay portón en el patio trasero?"],
  ["flower_beds", "Are there flower beds?", "¿Hay camas de flores?"],
  ["pets", "Are there pets in the backyard?", "¿Hay mascotas en el patio?"],
  ["white_vinyl_fence", "Is there a white vinyl fence?", "¿Hay cerca de vinilo blanco?"],
  ["above_ground_pool", "Is there an above-ground pool?", "¿Hay piscina sobre suelo?"],
  ["trampoline", "Is there a trampoline?", "¿Hay trampolín?"],
] as const;

const initialAnswers = Object.fromEntries(questions.map(([key]) => [key, "no"])) as Record<(typeof questions)[number][0], YesNo>;

export function QuoteWizard({ locale, services }: { locale: Locale; services: Service[] }) {
  const es = locale === "es";
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<BookingSummary | null>(null);
  const [form, setForm] = useState({
    address: "", zip: "", lat: 0, lng: 0, sqft: 0, geometry: emptyGeo,
    service_id: "", frequency: "biweekly" as Frequency, occupancy: "occupied" as "occupied" | "vacant",
    mow_area: "front_back" as MowArea, corner_lot: "no" as YesNo, date: "", time: "09:00",
    optional_services: [] as string[], first_name: "", last_name: "", email: "", phone: "",
    answers: initialAnswers, special_requests: "", referral_source: "", payment: "cash" as "cash" | "transfer", captcha_token: "", website: "",
  });

  useEffect(() => {
    if (query.trim().length < 4 || form.address === query) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        setResults(response.ok ? await response.json() : []);
      } catch (requestError) {
        if (!(requestError instanceof DOMException && requestError.name === "AbortError")) setResults([]);
      } finally { setLoading(false); }
    }, 600);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, form.address]);

  const selected = services.find(service => service.id === form.service_id);
  const measure = useCallback((value: MapValue) => setForm(current => ({ ...current, sqft: value.sqft, geometry: value.geometry })), []);
  const summary = useMemo<BookingSummary>(() => ({
    name: `${form.first_name} ${form.last_name}`.trim() || (es ? "Cliente" : "Customer"),
    service: selected ? (es ? selected.name_es : selected.name_en) : (es ? "Servicio de césped" : "Lawn service"),
    address: form.address, sqft: form.sqft, estimate: null, date: form.date, time: form.time,
    frequency: form.frequency, payment: form.payment,
  }), [es, form, selected]);

  function toggleOptional(value: string) {
    setForm(current => ({ ...current, optional_services: current.optional_services.includes(value)
      ? current.optional_services.filter(item => item !== value) : [...current.optional_services, value] }));
  }

  function validateCurrentStep() {
    if (step === 1 && (!form.address || !/^\d{5}(-\d{4})?$/.test(form.zip))) return es ? "Seleccione una dirección e ingrese un código postal válido." : "Select an address and enter a valid ZIP code.";
    if (step === 3 && form.sqft <= 0) return es ? "Dibuje al menos un área de césped en el mapa." : "Draw at least one lawn area on the map.";
    if (step === 4 && !form.date) return es ? "Seleccione una fecha de inicio preferida." : "Select a preferred start date.";
    if (step === 5 && !form.service_id) return es ? "Seleccione un servicio principal." : "Select a primary service.";
    if (step === 6 && (!form.first_name || !form.last_name || !form.email || !form.phone)) return es ? "Complete sus datos de contacto." : "Complete your contact details.";
    return "";
  }

  function next() { const issue = validateCurrentStep(); if (issue) return setError(issue); setError(""); setStep(current => Math.min(7, current + 1)); }
  function back() { setError(""); setStep(current => Math.max(1, current - 1)); }

  async function submit() {
    setLoading(true); setError("");
    const payload = {
      full_name: `${form.first_name} ${form.last_name}`.trim(), first_name: form.first_name, last_name: form.last_name,
      email: form.email, phone: form.phone, property_address: form.address, postal_code: form.zip,
      latitude: form.lat, longitude: form.lng, lawn_sqft: form.sqft, lawn_geometry: form.geometry,
      service_id: form.service_id, requested_date: form.date, requested_time: form.time, frequency: form.frequency,
      property_occupancy: form.occupancy, mow_area: form.mow_area, corner_lot: form.corner_lot === "yes",
      optional_services: form.optional_services, property_answers: form.answers, notes: form.special_requests,
      referral_source: form.referral_source || undefined, payment_method: form.payment, captcha_token: form.captcha_token || undefined, website: form.website,
    };
    const response = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const body = await response.json(); setLoading(false);
    if (!response.ok) return setError(body.error || (es ? "No pudimos guardar la solicitud." : "Unable to save the request."));
    setDone({ ...summary, estimate: body.estimated_price }); setStep(8);
  }

  if (done && step === 8) return (
    <div className="grid">
      <div className="card"><div className="eyebrow">{es ? "Solicitud recibida" : "Request received"}</div><h2 className="section-title">{es ? "Gracias. Revisaremos los detalles." : "Thank you. We’ll review the details."}</h2><p>{es ? "Aún se requiere confirmación humana antes del servicio o pago." : "Human confirmation is still required before service or payment."}</p></div>
      <PlanSummary booking={done} locale={locale} optionalServices={form.optional_services} mowArea={form.mow_area} />
      <div className="actions"><a className="btn btn-primary" href={smsUrl(done)}>{es ? "Enviar resumen por SMS" : "Text request summary"}</a><a className="btn btn-light" target="_blank" rel="noreferrer" href={calendarUrl(done)}>{es ? "Añadir a Google Calendar" : "Add to Google Calendar"}</a><Link className="btn btn-accent" href={`/${locale}/payments`}>{es ? "Opciones de pago" : "Payment options"}</Link></div>
      <p className="muted">SMS fallback: {BUSINESS.displayPhone}</p>
    </div>
  );

  return (
    <div className="quote-shell">
      <ol className="quote-progress" aria-label={es ? `Paso ${step} de 7` : `Step ${step} of 7`}>
        {[1,2,3,4,5,6,7].map(number => <li className={number <= step ? "on" : ""} key={number}><span>{number}</span><small>{number === step ? (es ? "Actual" : "Current") : ""}</small></li>)}
      </ol>
      <div className="card quote-card">
        {step === 1 && <section><div className="eyebrow">{es ? "Paso 1 · Propiedad" : "Step 1 · Property"}</div><h2 className="section-title">{es ? "Cotización de precio gratis" : "Free price quote"}</h2><p className="muted">{es ? "Comience con la dirección donde necesita el servicio." : "Start with the address where service is needed."}</p><div className="field"><label htmlFor="address">{es ? "Dirección" : "Address"}</label><input id="address" className="input input-large" value={query} onChange={event => { setQuery(event.target.value); setForm(current => ({ ...current, address: "" })); }} autoComplete="street-address" placeholder="123 Main St, Hutto, TX" />{loading && <span aria-live="polite">{es ? "Buscando…" : "Searching…"}</span>}<div className="address-results">{results.map(result => <button type="button" className="address-result" key={`${result.lat}${result.lon}`} onClick={() => { setForm(current => ({ ...current, address: result.display_name, lat: +result.lat, lng: +result.lon })); setQuery(result.display_name); setResults([]); }}>{result.display_name}</button>)}</div></div><div className="field"><label htmlFor="zip">{es ? "Código postal" : "ZIP Code"}</label><input id="zip" inputMode="numeric" maxLength={10} className="input" value={form.zip} onChange={event => setForm({ ...form, zip: event.target.value })} placeholder="78634" /></div></section>}
        {step === 2 && <section><div className="eyebrow">{es ? "Paso 2 · Configuración" : "Step 2 · Service setup"}</div><h2 className="section-title">{es ? "Configure su visita" : "Set up your visit"}</h2><div className="field"><label>{es ? "Elija la frecuencia" : "Choose your service frequency"}</label><select className="input input-large" value={form.frequency} onChange={event => setForm({ ...form, frequency: event.target.value as Frequency })}><option value="weekly">{es ? "Semanal" : "Weekly"}</option><option value="biweekly">{es ? "Quincenal" : "Bi-Weekly"}</option><option value="one_time">{es ? "Una vez" : "One time"}</option></select></div><div className="field"><label>{es ? "¿La propiedad está ocupada o desocupada?" : "Is your home occupied or vacant?"}</label><div className="choice-grid">{(["occupied","vacant"] as const).map(value => <button type="button" className={`choice-card ${form.occupancy === value ? "selected" : ""}`} key={value} onClick={() => setForm({ ...form, occupancy: value })}>{value === "occupied" ? (es ? "Ocupada" : "Occupied") : (es ? "Desocupada" : "Vacant")}</button>)}</div></div></section>}
        {step === 3 && <section><div className="eyebrow">{es ? "Paso 3 · Área de corte" : "Step 3 · Mow area"}</div><h2 className="section-title">{es ? "Seleccione el área a cortar" : "Select your mow area"}</h2><div className="mow-options">{([["front_back","⌂","Front & Back","Frente y posterior"],["front","◒","Front Only","Solo frente"],["back","◓","Back Only","Solo trasero"]] as const).map(([value,icon,en,spa]) => <button type="button" className={`choice-card mow-choice ${form.mow_area === value ? "selected" : ""}`} key={value} onClick={() => setForm({ ...form, mow_area: value })}><span className="mow-icon" aria-hidden="true">{icon}</span><strong>{es ? spa : en}</strong></button>)}</div><fieldset className="inline-question"><legend>{es ? "¿Es un lote de esquina?" : "Is your property a corner lot?"}</legend>{(["yes","no"] as const).map(value => <label key={value}><input type="radio" name="corner" checked={form.corner_lot === value} onChange={() => setForm({ ...form, corner_lot: value })} /> {value === "yes" ? (es ? "Sí" : "Yes") : "No"}</label>)}</fieldset><h3>{es ? "Dibuje las áreas de césped" : "Draw the lawn areas"}</h3>{form.lat ? <LawnMap lat={form.lat} lng={form.lng} onChange={measure} /> : <p className="notice">{es ? "Regrese y seleccione una dirección." : "Go back and select an address."}</p>}<div className="lawn-total"><small>{es ? "ÁREA TOTAL" : "TOTAL LAWN AREA"}</small><strong>{Math.round(form.sqft).toLocaleString()} SQ FT</strong></div></section>}
        {step === 4 && <section><div className="eyebrow">{es ? "Paso 4 · Calendario" : "Step 4 · Calendar"}</div><h2 className="section-title">{es ? "Elija una fecha de inicio" : "Choose a preferred start date"}</h2><p className="muted">{es ? "La fecha y el precio por visita se confirmarán después de revisar la propiedad y la capacidad de la ruta." : "The date and per-visit price are confirmed after property and route-capacity review."}</p><div className="calendar-panel"><div className="field"><label htmlFor="date">{es ? "Fecha preferida" : "Preferred date"}</label><input id="date" type="date" min={new Date().toISOString().slice(0,10)} className="input input-large" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} /></div><div className="field"><label htmlFor="time">{es ? "Hora preferida" : "Preferred time"}</label><input id="time" type="time" className="input" value={form.time} onChange={event => setForm({ ...form, time: event.target.value })} /></div><div className="capacity-key"><span><i className="available" />{es ? "Disponible para solicitar" : "Available to request"}</span><span><i className="pending" />{es ? "Sujeto a capacidad" : "Subject to capacity"}</span></div></div></section>}
        {step === 5 && <section><div className="eyebrow">{es ? "Paso 5 · Plan" : "Step 5 · Plan"}</div><h2 className="section-title">{es ? "Construya su plan de césped" : "Build your lawn care plan"}</h2><div className="field"><label>{es ? "Servicio principal" : "Primary service"}</label><select className="input input-large" value={form.service_id} onChange={event => setForm({ ...form, service_id: event.target.value })}><option value="">{es ? "Seleccione…" : "Select…"}</option>{services.map(service => <option value={service.id} key={service.id}>{es ? service.name_es : service.name_en}</option>)}</select></div><div className="included-preview"><div className="included-title">{es ? "Incluido con corte de césped" : "Included with lawn mowing"}</div><ul className="check-list"><li>{es ? "Corte de césped" : "Mow lawn"}</li><li>{es ? "Desbroce con línea" : "Line trim"}</li><li>{es ? "Orillado" : "Edge"}</li><li>{es ? "Soplado de residuos" : "Blow debris"}</li><li>{es ? "Soporte por mensaje" : "Text support"}</li></ul></div><fieldset className="option-list"><legend className="included-title">{es ? "Servicios opcionales" : "Optional services"}</legend>{[["flower_bed_cleaning",es ? "Limpieza de camas de flores" : "Flower Bed Cleaning"],["bush_trimming",es ? "Poda de arbustos" : "Bush Trimming"]].map(([value,label]) => <label className="option-row" key={value}><input type="checkbox" checked={form.optional_services.includes(value)} onChange={() => toggleOptional(value)} /><span>{label}</span><small>{es ? "Cotización personalizada" : "Custom quote"}</small></label>)}</fieldset></section>}
        {step === 6 && <section><div className="eyebrow">{es ? "Paso 6 · Cuenta" : "Step 6 · Account details"}</div><h2 className="section-title">{es ? "Cuéntenos los detalles" : "Tell us the details"}</h2><div className="form-grid">{[["first_name",es ? "Nombre" : "First name","text"],["last_name",es ? "Apellido" : "Last name","text"],["email","Email","email"],["phone",es ? "Teléfono" : "Phone","tel"]].map(([key,label,type]) => <div className="field" key={key}><label htmlFor={key}>{label}</label><input id={key} required type={type} className="input" value={form[key as "first_name"]} onChange={event => setForm({ ...form, [key]: event.target.value })} /></div>)}</div><div className="terrain-questions">{questions.map(([key,en,spa]) => <fieldset className="yes-no-row" key={key}><legend>{es ? spa : en}</legend>{(["yes","no"] as const).map(value => <label key={value}><input type="radio" name={key} checked={form.answers[key] === value} onChange={() => setForm({ ...form, answers: { ...form.answers, [key]: value } })} /> {value === "yes" ? (es ? "Sí" : "Yes") : "No"}</label>)}</fieldset>)}</div><div className="field"><label>{es ? "Solicitudes especiales" : "Special requests"}</label><textarea className="input" maxLength={1500} value={form.special_requests} onChange={event => setForm({ ...form, special_requests: event.target.value })} /></div><div className="field"><label>{es ? "¿Cómo nos conoció?" : "How did you hear about us?"}</label><select className="input" value={form.referral_source} onChange={event => setForm({ ...form, referral_source: event.target.value })}><option value="">{es ? "Seleccione…" : "Select…"}</option><option value="search">{es ? "Búsqueda en internet" : "Online search"}</option><option value="referral">{es ? "Recomendación" : "Referral"}</option><option value="yard_sign">{es ? "Letrero" : "Yard sign"}</option><option value="other">{es ? "Otro" : "Other"}</option></select></div><input name="website" aria-hidden="true" tabIndex={-1} autoComplete="off" className="honeypot" value={form.website} onChange={event => setForm({ ...form, website: event.target.value })} /></section>}
        {step === 7 && <section><div className="eyebrow">{es ? "Paso 7 · Confirmación" : "Step 7 · Confirmation"}</div><h2 className="section-title">{es ? "Revise y envíe su solicitud" : "Review and submit your request"}</h2><PlanSummary booking={summary} locale={locale} optionalServices={form.optional_services} mowArea={form.mow_area} /><div className="field payment-preference"><label>{es ? "Preferencia de pago" : "Payment preference"}</label><select className="input" value={form.payment} onChange={event => setForm({ ...form, payment: event.target.value as "cash" | "transfer" })}><option value="cash">{es ? "Efectivo" : "Cash"}</option><option value="transfer">{es ? "Transferencia (Cash App o Zelle)" : "Transfer (Cash App or Zelle)"}</option></select><p className="payment-note">{es ? "No se cobran tarjetas en este sitio. Nunca pague antes de recibir confirmación del importe final." : "Cards are not charged on this site. Never pay before receiving confirmation of the final amount."}</p></div><Turnstile locale={locale} onToken={token => setForm(current => ({ ...current, captcha_token: token }))} /></section>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="quote-actions">{step > 1 && <button className="btn btn-light" type="button" onClick={back}>{es ? "Atrás" : "Back"}</button>}{step < 7 ? <button className="btn btn-primary quote-next" type="button" onClick={next}>{step === 1 ? (es ? "COTIZACIÓN GRATIS" : "FREE PRICE QUOTE") : (es ? "CONTINUAR" : "CONTINUE")}</button> : <button className="btn btn-primary quote-next" type="button" disabled={loading} onClick={submit}>{loading ? (es ? "ENVIANDO…" : "SUBMITTING…") : (es ? "ENVIAR SOLICITUD" : "SUBMIT REQUEST")}</button>}</div>
      </div>
    </div>
  );
}

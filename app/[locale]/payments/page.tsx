import { notFound } from "next/navigation";
import { PaymentOptions } from "@/components/payments/PaymentOptions";
import { isLocale } from "@/lib/i18n";

export const metadata = { title: "Payment Options" };

export default async function PaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const es = locale === "es";

  return (
    <section className="section soft">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="eyebrow">{es ? "Opciones de pago" : "Payment options"}</div>
        <h1 className="title">{es ? "Pague después de confirmar su servicio" : "Pay after your service is confirmed"}</h1>
        <p className="muted">
          {es
            ? "Use Cash App o Zelle solamente después de recibir la confirmación y el importe final de Nieto Green Care. Este sitio no procesa ni almacena información bancaria."
            : "Use Cash App or Zelle only after Nieto Green Care confirms your service and final amount. This website does not process or store banking information."}
        </p>
        <div className="notice" role="note">
          <strong>{es ? "Antes de enviar:" : "Before sending:"}</strong>{" "}
          {es ? "verifique que el destinatario y el importe coincidan con su confirmación." : "verify that the recipient and amount match your confirmation."}
        </div>
        <div style={{ marginTop: "1.5rem" }}><PaymentOptions locale={locale} /></div>
      </div>
    </section>
  );
}

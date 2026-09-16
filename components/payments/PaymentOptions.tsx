"use client";

import { QRCodeCanvas } from "qrcode.react";
import { PAYMENT } from "@/lib/config";

export function PaymentOptions({ locale }: { locale: "en" | "es" }) {
  const es = locale === "es";
  const copyZelle = async () => navigator.clipboard.writeText(PAYMENT.zellePhone);

  return (
    <div className="payment-grid">
      <article className="card payment-card">
        <p className="payment-mark">Cash App</p>
        <QRCodeCanvas value={PAYMENT.cashAppUrl} size={240} level="H" marginSize={3} />
        <h2>{es ? "Pagar con Cash App" : "Pay with Cash App"}</h2>
        <p className="muted">
          {es ? "Escanee el código o abra el enlace seguro de Cash App." : "Scan the code or open the secure Cash App link."}
        </p>
        <a className="btn btn-primary" href={PAYMENT.cashAppUrl} target="_blank" rel="noreferrer">
          {es ? "Abrir Cash App" : "Open Cash App"}
        </a>
      </article>
      <article className="card payment-card">
        <p className="payment-mark zelle">Zelle®</p>
        <h2>{es ? "Transferir con Zelle" : "Transfer with Zelle"}</h2>
        <p>{es ? "Destinatario:" : "Recipient:"} <strong>Nieto Green Care LLC</strong></p>
        <p className="plan-price" style={{ fontSize: "2rem" }}>737-314-4215</p>
        <button className="btn btn-light" type="button" onClick={copyZelle}>
          {es ? "Copiar teléfono" : "Copy phone number"}
        </button>
        <p className="payment-note">
          {es ? "Abra la aplicación de su banco y confirme cuidadosamente el destinatario antes de transferir." : "Open your bank app and carefully confirm the recipient before transferring."}
        </p>
      </article>
    </div>
  );
}

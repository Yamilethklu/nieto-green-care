"use client";

import { MessageSquareText, Smartphone } from "lucide-react";

export function SmsWidget() {
  return (
    <aside className="sms-widget" aria-label="Text support">
      <div className="sms-widget__card">
        <div className="sms-widget__avatar" aria-hidden="true">NG</div>
        <p>Hi there, have a question? Text us here.</p>
      </div>
      <a className="sms-widget__button" href="sms:+17373144215" aria-label="Text Nieto Green Care">
        <Smartphone size={20} strokeWidth={2.5} aria-hidden="true" />
        <span>Text us</span>
        <MessageSquareText size={16} aria-hidden="true" />
      </a>
    </aside>
  );
}

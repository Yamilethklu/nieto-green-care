"use client";

export function SmsWidget() {
  return (
    <aside className="sms-widget" aria-label="Text support">
      <div className="sms-widget__card">
        <div className="sms-widget__avatar" aria-hidden="true">NG</div>
        <p>Hi there, have a question? Text us here.</p>
      </div>
      <a className="sms-widget__button" href="sms:+17373144215" aria-label="Text Nieto Green Care">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2.75h10A2.25 2.25 0 0 1 19.25 5v14A2.25 2.25 0 0 1 17 21.25H7A2.25 2.25 0 0 1 4.75 19V5A2.25 2.25 0 0 1 7 2.75Zm0 1.5A.75.75 0 0 0 6.25 5v14c0 .414.336.75.75.75h10a.75.75 0 0 0 .75-.75V5a.75.75 0 0 0-.75-.75H7ZM12 17.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>
        <strong>Text us</strong>
        <span aria-hidden="true">›</span>
      </a>
    </aside>
  );
}

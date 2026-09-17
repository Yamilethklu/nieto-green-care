"use client";

export function SmsWidget() {
  return (
    <aside className="fixed bottom-6 right-6 z-50 flex max-w-[calc(100vw-3rem)] flex-col items-end gap-3" aria-label="Text support">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-xl ring-1 ring-slate-200">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime-500 text-xs font-bold text-white" aria-hidden="true">NG</div>
        <p>Hi there, have a question? Text us here.</p>
      </div>
      <a className="inline-flex items-center gap-2 rounded-full bg-lime-500 px-5 py-3 font-bold text-slate-950 shadow-lg transition hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-lime-300" href="sms:+17373144215" aria-label="Text Nieto Green Care">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M7 2.75h10A2.25 2.25 0 0 1 19.25 5v14A2.25 2.25 0 0 1 17 21.25H7A2.25 2.25 0 0 1 4.75 19V5A2.25 2.25 0 0 1 7 2.75ZM12 17.25h.01" /></svg>
        <span>Text us</span>
        <span aria-hidden="true">›</span>
      </a>
    </aside>
  );
}

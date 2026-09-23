"use client";

import { useState } from "react";

export function CopyBox({ text, json, label }: { text: string; json: string; label?: string }) {
  const [tab, setTab] = useState<"text" | "json">("text");
  const [copied, setCopied] = useState(false);
  const content = tab === "text" ? text : json;

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Panoya erişim izni yoksa kullanıcı elle seçip kopyalayabilir.
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
        <div className="flex gap-1">
          <TabButton active={tab === "text"} onClick={() => setTab("text")}>
            Okunabilir metin
          </TabButton>
          <TabButton active={tab === "json"} onClick={() => setTab("json")}>
            JSON
          </TabButton>
        </div>
        {label && <span className="text-xs text-slate-400">{label}</span>}
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap bg-slate-900 px-4 py-3.5 font-mono text-xs leading-relaxed text-slate-100">
        {content || "(boş)"}
      </pre>
      <div className="border-t border-slate-200 px-3 py-2.5">
        <button
          type="button"
          onClick={copy}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition ${
            copied ? "bg-green-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
                  clipRule="evenodd"
                />
              </svg>
              Kopyalandı
            </>
          ) : (
            "Panoya Kopyala"
          )}
        </button>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

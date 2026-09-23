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
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-3 py-2">
        <div className="flex gap-1">
          <TabButton active={tab === "text"} onClick={() => setTab("text")}>
            Okunabilir metin
          </TabButton>
          <TabButton active={tab === "json"} onClick={() => setTab("json")}>
            JSON
          </TabButton>
        </div>
        {label && <span className="text-xs text-neutral-400">{label}</span>}
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap px-4 py-3 font-mono text-xs text-neutral-700">
        {content || "(boş)"}
      </pre>
      <div className="border-t border-neutral-200 px-3 py-2">
        <button
          type="button"
          onClick={copy}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
        >
          {copied ? "Kopyalandı ✓" : "Panoya Kopyala"}
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
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}

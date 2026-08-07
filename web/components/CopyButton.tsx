"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  label = "Üzenet másolása",
  copiedLabel = "Kimásolva ✓",
  className = "btn btn-primary",
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API nélkül (pl. http + régi böngésző) marad a kézi kijelölés.
      window.prompt("Másold ki innen:", text);
    }
  }

  return (
    <button type="button" onClick={copy} className={className}>
      {copied ? copiedLabel : label}
    </button>
  );
}

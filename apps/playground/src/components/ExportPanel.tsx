import { useState } from "react";
import {
  exportTypescript,
  exportJSON,
  type PatternPair,
} from "@eml-fn/bullet-choreographer";

interface ExportPanelProps {
  pair: PatternPair;
}

export function ExportPanel({ pair }: ExportPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const tsCode = exportTypescript(pair);
  const jsonCode = JSON.stringify(exportJSON(pair), null, 2);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="export-panel">
      <h3>
        TypeScript Export
        <button
          className="copy-btn"
          onClick={() => copyToClipboard(tsCode, "ts")}
        >
          {copied === "ts" ? "Copied!" : "Copy"}
        </button>
      </h3>
      <pre className="export-code">{tsCode}</pre>

      <h3>
        JSON Export
        <button
          className="copy-btn"
          onClick={() => copyToClipboard(jsonCode, "json")}
        >
          {copied === "json" ? "Copied!" : "Copy"}
        </button>
      </h3>
      <pre className="export-code">{jsonCode}</pre>
    </div>
  );
}

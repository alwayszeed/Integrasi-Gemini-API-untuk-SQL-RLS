"use client";

import { useState } from "react";
import type { DBMLParseResult } from "@/lib/dbml";

const SAMPLE = `Table users {
  id integer [pk, increment]
  username varchar(255) [not null, unique]
  email varchar(255) [unique]
  created_at timestamp
}

Table posts {
  id integer [pk]
  user_id integer [ref: > users.id]
  title varchar(255)
  body text [null]
}

Ref: posts.user_id > users.id
`;

export default function Home() {
  const [input, setInput] = useState(SAMPLE);
  const [parsed, setParsed] = useState<DBMLParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [genResult, setGenResult] = useState<{
    migrationSql: string;
    rlsSql: string;
    notes: string;
  } | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const onParse = async () => {
    setParsing(true);
    setParseError(null);
    setGenResult(null);
    try {
      const res = await fetch("/api/parse-dbml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Parse failed");
      setParsed(data as DBMLParseResult);
    } catch (e) {
      setParsed(null);
      setParseError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setParsing(false);
    }
  };

  const onGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/generate-sql-rls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          parsed,
          apiKey: apiKey || undefined,
          model: model || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setGenResult({
        migrationSql: data.migrationSql,
        rlsSql: data.rlsSql,
        notes: data.notes,
      });
    } catch (e) {
      setGenResult(null);
      setGenError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">DBML → SQL & Supabase RLS (Gemini)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section>
          <label className="block text-sm font-medium mb-1">DBML input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-[320px] font-mono text-sm border rounded p-3"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={onParse}
              disabled={parsing}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              {parsing ? "Parsing..." : "Parse DBML"}
            </button>
            <button
              onClick={onGenerate}
              disabled={generating}
              className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate SQL & RLS"}
            </button>
          </div>
          {parseError && <p className="mt-2 text-red-600 text-sm">{parseError}</p>}
          {genError && <p className="mt-2 text-red-600 text-sm">{genError}</p>}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Gemini API key (optional if env set)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="AIza..."
            />
            <label className="block text-sm font-medium mt-2 mb-1">Model (optional)</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="gemini-1.5-flash"
            />
          </div>
        </section>
        <section>
          <label className="block text-sm font-medium mb-1">Parsed JSON</label>
          <pre className="w-full h-[320px] font-mono text-xs border rounded p-3 overflow-auto bg-gray-50">
            {parsed ? JSON.stringify(parsed, null, 2) : "Run parse to see output."}
          </pre>
        </section>
      </div>

      {genResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <section>
            <label className="block text-sm font-medium mb-1">Migration SQL</label>
            <pre className="w-full h-[360px] font-mono text-xs border rounded p-3 overflow-auto bg-gray-50 whitespace-pre-wrap">
              {genResult.migrationSql}
            </pre>
          </section>
          <section>
            <label className="block text-sm font-medium mb-1">RLS SQL (Supabase)</label>
            <pre className="w-full h-[360px] font-mono text-xs border rounded p-3 overflow-auto bg-gray-50 whitespace-pre-wrap">
              {genResult.rlsSql}
            </pre>
            {genResult.notes && (
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{genResult.notes}</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

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

Enum status {
  active [note: 'live']
  archived
}
`;

export default function Home() {
  const [input, setInput] = useState(SAMPLE);
  const [result, setResult] = useState<DBMLParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onParse = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parse-dbml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Parse failed");
      setResult(data as DBMLParseResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">DBML to JSON Parser</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section>
          <label className="block text-sm font-medium mb-1">DBML input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-[480px] font-mono text-sm border rounded p-3"
          />
          <button
            onClick={onParse}
            disabled={loading}
            className="mt-3 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {loading ? "Parsing..." : "Parse"}
          </button>
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
        </section>
        <section>
          <label className="block text-sm font-medium mb-1">JSON output</label>
          <pre className="w-full h-[480px] font-mono text-sm border rounded p-3 overflow-auto bg-gray-50">
            {result ? JSON.stringify(result, null, 2) : "Run parse to see output."}
          </pre>
        </section>
      </div>
    </main>
  );
}

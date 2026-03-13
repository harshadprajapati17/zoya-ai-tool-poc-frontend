"use client";

import { useEffect, useState } from "react";

type ChatLog = {
  id: string;
  created_at: string;
  session_id: string | null;
  user_message: string | null;
  full_prompt: string | null;
  products_json: unknown;
  model_answer: string | null;
  model_name: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  error: string | null;
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/chat-logs?limit=50");
        if (!res.ok) {
          throw new Error("Failed to load chat logs");
        }
        const data = (await res.json()) as ChatLog[];
        setLogs(data);
      } catch (e) {
        console.error(e);
        setError("Could not load chat logs.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8 text-slate-800">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 text-violet-500">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Loading conversation logs…
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 text-slate-800">
      <div className="glass-surface-strong mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl p-6">
        <header className="border-b border-violet-200/40 pb-4">
          <p className="text-xs uppercase tracking-[0.32em] text-violet-400">
            Brand Studio
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-gradient">
            Conversation Trace Explorer
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Inspect how each reply was composed: guest input, internal prompt,
            vector matches, model response, and token usage.
          </p>
        </header>

        {error && (
          <p className="text-xs text-red-500">
            {error}
          </p>
        )}

        {logs.length === 0 && !error && (
          <p className="text-sm text-slate-400">
            No conversations logged yet. Start a chat to see traces here.
          </p>
        )}

        <section className="space-y-3">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <article
                key={log.id}
                className="card-surface rounded-2xl p-4"
              >
                <header className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      {formatDate(log.created_at)}
                    </p>
                    <p className="max-w-xl text-sm text-slate-800 line-clamp-2">
                      {log.user_message || "—"}
                    </p>
                    {log.session_id && (
                      <p className="text-[10px] text-slate-400">
                        Session: {log.session_id}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end text-right text-[11px] text-slate-400">
                    <span>
                      {log.model_name || "Model"}
                    </span>
                    <span className="mt-0.5">
                      {log.total_tokens != null
                        ? `${log.total_tokens} tokens`
                        : log.input_tokens != null || log.output_tokens != null
                          ? `${log.input_tokens ?? "?"} in / ${log.output_tokens ?? "?"} out`
                          : "Token usage unavailable"}
                    </span>
                  </div>
                </header>

                <div className="mt-3 flex flex-col gap-2 text-xs text-slate-600">
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                      Assistant Reply
                    </p>
                    <p className="whitespace-pre-wrap">
                      {log.model_answer || "—"}
                    </p>
                  </div>

                  {log.error && (
                    <p className="text-[11px] text-red-500">
                      Error: {log.error}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-violet-200/30 pt-3 text-[11px] text-slate-400">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : log.id)
                    }
                    className="accent-pill rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
                  >
                    {isExpanded ? "Hide Trace" : "View Full Trace"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 grid gap-3 border-t border-violet-200/30 pt-3 text-[11px] text-slate-700 sm:grid-cols-3">
                    <div className="space-y-1 sm:col-span-1">
                      <p className="font-semibold uppercase tracking-[0.18em] text-violet-400">
                        Guest Message
                      </p>
                      <pre className="max-h-64 overflow-auto rounded-lg bg-slate-50/80 p-3 text-[11px] text-slate-700 border border-slate-200/50">
                        {log.user_message || "—"}
                      </pre>
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <p className="font-semibold uppercase tracking-[0.18em] text-violet-400">
                        Full Prompt Sent To Model
                      </p>
                      <pre className="max-h-64 overflow-auto rounded-lg bg-slate-50/80 p-3 text-[11px] text-slate-700 border border-slate-200/50">
                        {log.full_prompt || "—"}
                      </pre>
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <p className="font-semibold uppercase tracking-[0.18em] text-violet-400">
                        Vector Matches (Products)
                      </p>
                      <pre className="max-h-64 overflow-auto rounded-lg bg-slate-50/80 p-3 text-[11px] text-slate-700 border border-slate-200/50">
                        {prettyJson(log.products_json)}
                      </pre>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

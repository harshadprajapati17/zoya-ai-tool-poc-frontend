"use client";

import { useEffect, useRef, useState } from "react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { SuggestionChips } from "@/components/SuggestionChips";
import { TypingIndicator } from "@/components/TypingIndicator";
import { CollapsibleProducts } from "@/components/CollapsibleProducts";

type Role = "user" | "assistant";

type Product = {
  pid: string;
  name: string;
  price: number | null;
  currency?: string | null;
  category?: string | null;
  material?: string | null;
  collection?: string | null;
  product_details?: string | null;
  link?: string | null;
};

type Message = {
  id: string;
  role: Role;
  content: string;
  products?: Product[];
};

type ChatResponse = {
  answer: string;
  products: Product[];
};

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to Zoya. I'm your personal jewelry concierge. Tell me about the occasion, budget, and style you have in mind, and I'll curate pieces just for you.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastAssistantRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let existing = window.localStorage.getItem("zoya_session_id");
      if (!existing) {
        existing =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        window.localStorage.setItem("zoya_session_id", existing);
      }
      setSessionId(existing);
    }
  }, []);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    const hasCards =
      !loading &&
      lastMsg?.role === "assistant" &&
      (lastMsg.products?.length ?? 0) > 0;
    if (hasCards && lastAssistantRef.current) {
      lastAssistantRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function buildHistory(): { role: string; content: string }[] {
    return messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));
  }

  async function sendMessage(text: string) {
    const id = `${Date.now()}`;
    setError(null);
    setMessages((prev) => [...prev, { id, role: "user", content: text }]);
    setLoading(true);

    try {
      const history = buildHistory();
      history.push({ role: "user", content: text });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId ?? null,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = (await res.json()) as ChatResponse;

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: data.answer || "I couldn't find the right words just now.",
          products: data.products?.length ? data.products : undefined,
        },
      ]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const lastAssistantIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  })();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <main className="glass-surface-strong flex h-[680px] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] px-6 py-5 shadow-[0_24px_80px_rgba(99,102,241,0.1)]">
        <header className="mb-4 flex items-center justify-between border-b border-violet-200/40 pb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-violet-400">
              Zoya Concierge
            </p>
            <h1 className="font-playfair text-xl text-gradient">
              Discover your next piece of art.
            </h1>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Powered by Gemini
            </span>
            <span className="mt-0.5 text-[11px] text-slate-400">
              Trained on Zoya&apos;s collection
            </span>
          </div>
        </header>

        <div
          ref={containerRef}
          className="flex-1 space-y-4 overflow-y-auto pb-4 pr-1"
        >
          {messages.map((m, i) => {
            const isLatestAssistant = i === lastAssistantIdx;
            const hasProducts = (m.products?.length ?? 0) > 0;
            return (
              <div
                key={m.id}
                ref={isLatestAssistant ? lastAssistantRef : undefined}
              >
                <ChatMessage role={m.role} content={m.content} />
                {hasProducts && (
                  <CollapsibleProducts
                    products={m.products!}
                    defaultExpanded={isLatestAssistant && !loading}
                  />
                )}
              </div>
            );
          })}

          {loading && (
            <div className="mt-2">
              <TypingIndicator />
            </div>
          )}

          {!loading && messages.length <= 1 && (
            <section className="mt-2 text-sm text-slate-600">
              <p>
                You can ask for a budget, metal colour, gemstones, or a
                particular collection. I&apos;ll translate that into the right
                Zoya pieces.
              </p>
              <SuggestionChips onSelect={sendMessage} />
            </section>
          )}

          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
        </div>

        <div className="mt-3 border-t border-violet-200/40 pt-3">
          <ChatInput onSend={sendMessage} disabled={loading} />
          <p className="mt-2 text-[10px] text-slate-400">
            Zoya Concierge suggests jewelry based on your preferences and the
            current collection. Availability and pricing are subject to change
            on{" "}
            <a
              href="https://www.zoya.in"
              target="_blank"
              rel="noreferrer"
              className="text-electric-blue underline-offset-2 hover:underline"
            >
              zoya.in
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}

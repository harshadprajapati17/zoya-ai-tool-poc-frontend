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
  product_images?: string[] | null;
};

type Message = {
  id: string;
  role: Role;
  content: string;
  products?: Product[];
};

type ChatResponse = {
  answer: string;
  products?: Product[];
};

type BrandConfig = {
  greeting_message: string | null;
};

type ToolMode = "chat" | "product_finder" | "tone_refinement";

type ToneOption = "friendly" | "formal" | "concise" | "empathetic" | "sales";

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolMode>("chat");
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to chat mode. You can paste a client query or ask your own question about products, in any language you’re comfortable with.",
    },
  ]);
  const [productFinderMessages, setProductFinderMessages] = useState<Message[]>(
    [
      {
        id: "welcome-product-finder",
        role: "assistant",
        content:
          "Welcome to Product Finder mode. Describe the occasion, style, budget, or preferences, and I’ll suggest suitable pieces.",
      },
    ],
  );
  const [toneMessages, setToneMessages] = useState<Message[]>([
    {
      id: "welcome-tone",
      role: "assistant",
      content:
        "Welcome to Tone Refinement mode. Paste your current message, and I’ll rewrite it in the tone you choose.",
    },
  ]);
  const [toneOption, setToneOption] = useState<ToneOption>("friendly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastAssistantRef = useRef<HTMLDivElement | null>(null);

  const messages =
    activeTool === "chat"
      ? chatMessages
      : activeTool === "product_finder"
      ? productFinderMessages
      : toneMessages;

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
    // Admin-configured greetings are no longer applied in the new
    // multi-tool interface. We keep the default Chat welcome defined
    // in the initial chatMessages state to ensure a consistent entry
    // experience for internal users.
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

  function buildHistory(mode: ToolMode): { role: string; content: string }[] {
    const sourceMessages =
      mode === "chat"
        ? chatMessages
        : mode === "product_finder"
        ? productFinderMessages
        : toneMessages;

    return sourceMessages
      .filter((m) => !m.id.startsWith("welcome"))
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));
  }

  function appendMessage(mode: ToolMode, message: Message) {
    if (mode === "chat") {
      setChatMessages((prev) => [...prev, message]);
    } else if (mode === "product_finder") {
      setProductFinderMessages((prev) => [...prev, message]);
    } else {
      setToneMessages((prev) => [...prev, message]);
    }
  }

  async function sendMessage(text: string) {
    const mode = activeTool;
    const id = `${Date.now()}`;
    setError(null);
    appendMessage(mode, { id, role: "user", content: text });
    setLoading(true);

    try {
      const history = buildHistory(mode);
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
          mode,
          tone: mode === "tone_refinement" ? toneOption : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = (await res.json()) as ChatResponse;

      const isToneRefinement = mode === "tone_refinement";
      const products =
        !isToneRefinement && data.products && data.products.length > 0
          ? data.products
          : undefined;

      appendMessage(mode, {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: data.answer || "I couldn't find the right words just now.",
        products,
      });
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
            <p className="mt-1 text-xs text-slate-500">
              Chat in any language you&apos;re comfortable with.
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {activeTool === "chat" && "Mode: Chat"}
              {activeTool === "product_finder" && "Mode: Product Finder"}
              {activeTool === "tone_refinement" && "Mode: Tone Refinement"}
            </p>
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

        {activeTool === "product_finder" && (
          <ModeChipsPanel
            title="Ways to find pieces"
            chips={[
              "Rose gold pieces up to ₹5 lakhs",
              "Pieces priced below ₹2 lakhs",
              "Minimal designs under ₹2 lakhs",
            ]}
            onChipSelect={(template) => sendMessage(template)}
          />
        )}

        {activeTool === "tone_refinement" && (
          <ToneChipsPanel
            tone={toneOption}
            onToneChange={setToneOption}
          />
        )}

        <div
          ref={containerRef}
          className="mt-2 flex-1 space-y-4 overflow-y-auto pb-4 pr-1"
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

          {!loading && activeTool === "chat" && messages.length <= 1 && (
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
          <ToolSelectorChips activeTool={activeTool} onSelect={setActiveTool} />
          <ChatInput onSend={sendMessage} disabled={loading} />
        </div>
      </main>
    </div>
  );
}

type ToolSelectorProps = {
  activeTool: ToolMode;
  onSelect: (mode: ToolMode) => void;
};

function ToolSelectorChips({ activeTool, onSelect }: ToolSelectorProps) {
  const baseClasses =
    "inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer";

  const tools: { id: ToolMode; label: string }[] = [
    { id: "chat", label: "Chat" },
    { id: "product_finder", label: "Product Finder" },
    { id: "tone_refinement", label: "Tone Refinement" },
  ];

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {tools.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => onSelect(tool.id)}
            className={`${baseClasses} ${
              isActive
                ? "border-violet-500 bg-violet-500/10 text-violet-600"
                : "border-slate-300 bg-white/40 text-slate-600 hover:border-violet-300 hover:text-violet-500"
            }`}
          >
            {tool.label}
          </button>
        );
      })}
    </div>
  );
}

type ModeChipsPanelProps = {
  title: string;
  chips: string[];
  onChipSelect: (text: string) => void;
};

function ModeChipsPanel({ title, chips, onChipSelect }: ModeChipsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="rounded-2xl border border-violet-200/60 bg-violet-50/60 px-4 py-2 text-xs text-slate-700">
      <button
        type="button"
        className="flex w-full items-center justify-between"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="font-medium text-violet-700">{title}</span>
        <span className="text-[10px] text-violet-500">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>
      {expanded && (
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[11px] text-slate-700 shadow-sm ring-1 ring-violet-200 hover:bg-violet-50 hover:text-violet-700"
              onClick={() => onChipSelect(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

type ToneChipsPanelProps = {
  tone: ToneOption;
  onToneChange: (tone: ToneOption) => void;
};

function ToneChipsPanel({ tone, onToneChange }: ToneChipsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const tones: { id: ToneOption; label: string }[] = [
    { id: "friendly", label: "Friendly" },
    { id: "formal", label: "Formal" },
    { id: "concise", label: "Concise" },
    { id: "empathetic", label: "Empathetic" },
    { id: "sales", label: "Sales-focused" },
  ];

  return (
    <section className="rounded-2xl border border-violet-200/60 bg-violet-50/60 px-4 py-2 text-xs text-slate-700">
      <button
        type="button"
        className="flex w-full items-center justify-between"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="font-medium text-violet-700">Choose tone</span>
        <span className="text-[10px] text-violet-500">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>
      {expanded && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tones.map((t) => {
            const isActive = t.id === tone;
            return (
              <button
                key={t.id}
                type="button"
                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] shadow-sm ring-1 ${
                  isActive
                    ? "bg-violet-600 text-white ring-violet-600"
                    : "bg-white/80 text-slate-700 ring-violet-200 hover:bg-violet-50 hover:text-violet-700"
                }`}
                onClick={() => onToneChange(t.id)}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

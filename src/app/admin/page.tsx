"use client";

import { useEffect, useState } from "react";

type BrandConfig = {
  id?: number;
  brand_name: string;
  voice_rules: string | null;
  forbidden_words: string | null;
  price_framing: string | null;
  out_of_stock_script: string | null;
  greeting_message: string | null;
  follow_up_style: string | null;
};

const VOICE_RULE_OPTIONS = [
  {
    value: "luxurious",
    label: "Luxurious",
    description: "Elegant, refined, exclusive",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Clear, knowledgeable, direct",
  },
  {
    value: "warm",
    label: "Warm & Personal",
    description: "Friendly, approachable, empathetic",
  },
  {
    value: "poetic",
    label: "Poetic & Evocative",
    description: "Sensory, expressive, rich imagery",
  },
];

const FOLLOW_UP_OPTIONS = [
  {
    value: "gentle",
    label: "Gentle Invitation",
    description: "Softly invite continued exploration",
  },
  {
    value: "question",
    label: "Question-Based",
    description: "Ask thoughtful preference questions",
  },
  {
    value: "suggestion",
    label: "Suggestion-Led",
    description: "Proactively suggest related pieces",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Brief, no-pressure closings",
  },
];

const LIMITS = {
  forbidden_words: 200,
  price_framing: 300,
  out_of_stock_script: 200,
  greeting_message: 300,
};

function countChars(value: string | null | undefined): number {
  return value?.length ?? 0;
}

export default function AdminPage() {
  const [config, setConfig] = useState<BrandConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/brand-config");
        if (!res.ok) {
          throw new Error("Failed to load brand config");
        }
        const data = (await res.json()) as BrandConfig | null;
        if (data) {
          const validVoice = VOICE_RULE_OPTIONS.some((o) => o.value === data.voice_rules);
          const validFollowUp = FOLLOW_UP_OPTIONS.some((o) => o.value === data.follow_up_style);
          setConfig({
            ...data,
            voice_rules: validVoice ? data.voice_rules : "luxurious",
            follow_up_style: validFollowUp ? data.follow_up_style : "gentle",
          });
        } else {
          setConfig({
            brand_name: "Zoya",
            voice_rules: "luxurious",
            forbidden_words: null,
            price_framing: null,
            out_of_stock_script: null,
            greeting_message: null,
            follow_up_style: "gentle",
          });
        }
      } catch (e) {
        console.error(e);
        setError("Could not load configuration.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/brand-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        throw new Error("Save failed");
      }
      setSaved(true);
    } catch (e) {
      console.error(e);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof BrandConfig>(key: K, value: string) {
    if (!config) return;
    setConfig({
      ...config,
      [key]: value,
    });
    setSaved(false);
  }

  function selectChip(field: "voice_rules" | "follow_up_style", value: string) {
    if (!config) return;
    setConfig({
      ...config,
      [field]: config[field] === value ? null : value,
    });
    setSaved(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8 text-slate-800">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 text-violet-500">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Loading brand studio…
          </div>
        </div>
      </main>
    );
  }

  if (!config) {
    return (
      <main className="min-h-screen px-4 py-8 text-slate-800">
        <div className="mx-auto max-w-3xl">
          <p>Configuration could not be initialized.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 text-slate-800">
      <div className="glass-surface-strong mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl p-6">
        <header className="border-b border-violet-200/40 pb-4">
          <p className="text-xs uppercase tracking-[0.32em] text-violet-400">
            Brand Studio
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-gradient">
            Concierge Voice Configuration
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Shape how the AI concierge speaks. These settings control tone and
            phrasing, but core safety and brand rules are enforced separately.
          </p>
        </header>

        <section className="space-y-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Brand Name
            </label>
            <input
              type="text"
              value={config.brand_name}
              onChange={(e) => updateField("brand_name", e.target.value)}
              maxLength={80}
              className="rounded-lg border border-violet-200/40 bg-white/60 px-3 py-2 text-sm text-slate-800 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-300/50 focus:border-violet-300"
            />
          </div>

          <ChipSelector
            label="Voice Style"
            description="Choose the tone your concierge uses. This controls vocabulary, formality, and overall feel."
            options={VOICE_RULE_OPTIONS}
            selected={config.voice_rules}
            onSelect={(v) => selectChip("voice_rules", v)}
          />

          <ConfigTextarea
            label="Forbidden Words"
            description="Comma-separated words the concierge should avoid (e.g. cheap, discount, deal)."
            value={config.forbidden_words ?? ""}
            onChange={(v) => updateField("forbidden_words", v)}
            limit={LIMITS.forbidden_words}
          />

          <ChipSelector
            label="Follow-up Style"
            description="How the concierge should close responses and keep the conversation going."
            options={FOLLOW_UP_OPTIONS}
            selected={config.follow_up_style}
            onSelect={(v) => selectChip("follow_up_style", v)}
          />

          <ConfigTextarea
            label="Price Framing Guide"
            description="How you want price to be framed (e.g. as an heirloom investment, never as a discount)."
            value={config.price_framing ?? ""}
            onChange={(v) => updateField("price_framing", v)}
            limit={LIMITS.price_framing}
          />

          <ConfigTextarea
            label="Out-of-Stock Script"
            description="One or two graceful sentences for when a piece is not available."
            value={config.out_of_stock_script ?? ""}
            onChange={(v) => updateField("out_of_stock_script", v)}
            limit={LIMITS.out_of_stock_script}
          />

          <ConfigTextarea
            label="Greeting Message"
            description="The first message guests see when they open the chat."
            value={config.greeting_message ?? ""}
            onChange={(v) => updateField("greeting_message", v)}
            limit={LIMITS.greeting_message}
          />
        </section>

        {error && (
          <p className="text-xs text-red-500">
            {error}
          </p>
        )}
        {saved && !error && (
          <p className="text-xs text-emerald-500">
            Changes saved. New conversations will use this voice.
          </p>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-violet-200/40 pt-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="accent-pill rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ── Chip Selector ─────────────────────────────────────── */

type ChipOption = {
  value: string;
  label: string;
  description: string;
};

type ChipSelectorProps = {
  label: string;
  description: string;
  options: ChipOption[];
  selected: string | null;
  onSelect: (value: string) => void;
};

function ChipSelector({
  label,
  description,
  options,
  selected,
  onSelect,
}: ChipSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </label>
      <p className="text-[11px] text-slate-400">{description}</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`
                group relative rounded-full border px-4 py-2 text-xs font-medium transition-all
                ${
                  active
                    ? "border-violet-400 bg-violet-500 text-white shadow-md shadow-violet-200/50"
                    : "border-violet-200/40 bg-white/60 text-slate-600 hover:border-violet-300 hover:bg-violet-50/60"
                }
              `}
            >
              <span>{opt.label}</span>
              <span
                className={`ml-1.5 text-[10px] ${active ? "text-violet-200" : "text-slate-400"}`}
              >
                · {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Config Textarea ───────────────────────────────────── */

type ConfigTextareaProps = {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  limit: number;
};

function ConfigTextarea({
  label,
  description,
  value,
  onChange,
  limit,
}: ConfigTextareaProps) {
  const chars = countChars(value);
  const ratio = chars / limit;
  const colorClass =
    ratio < 0.8
      ? "text-slate-400"
      : ratio < 1
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </label>
        <span className={`text-[10px] ${colorClass}`}>
          {chars} / {limit}
        </span>
      </div>
      <p className="text-[11px] text-slate-400">
        {description}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={limit}
        rows={3}
        className="mt-1 w-full rounded-lg border border-violet-200/40 bg-white/60 px-3 py-2 text-sm text-slate-800 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-300/50 focus:border-violet-300"
      />
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_FORBIDDEN_WORDS = 200;
const MAX_PRICE_FRAMING = 300;
const MAX_OUT_OF_STOCK = 200;
const MAX_GREETING = 300;

const VALID_VOICE_RULES = ["luxurious", "professional", "warm", "poetic"];
const VALID_FOLLOW_UP = ["gentle", "question", "suggestion", "minimal"];

function clampText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  if (!value.trim()) return null;
  return value.slice(0, max);
}

export async function GET() {
  const { data, error } = await supabase
    .from("brand_config")
    .select(
      "id, brand_name, system_prompt, voice_rules, forbidden_words, price_framing, out_of_stock_script, greeting_message, follow_up_style",
    )
    .limit(1);

  if (error) {
    console.error("GET /api/admin/brand-config error:", error);
    return NextResponse.json(
      { error: "Failed to load brand config" },
      { status: 500 },
    );
  }

  const existing = data?.[0];

  if (existing) {
    return NextResponse.json(existing);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("brand_config")
    .insert({
      brand_name: "Zoya",
      voice_rules: "luxurious",
      follow_up_style: "gentle",
      greeting_message:
        "Welcome to Zoya. I'm your personal jewelry concierge. Tell me about the occasion, budget, and style you have in mind.",
    })
    .select(
      "id, brand_name, system_prompt, voice_rules, forbidden_words, price_framing, out_of_stock_script, greeting_message, follow_up_style",
    )
    .limit(1);

  if (insertError) {
    console.error("Insert default brand_config failed:", insertError);
    return NextResponse.json(
      { error: "Failed to create default brand config" },
      { status: 500 },
    );
  }

  return NextResponse.json(inserted?.[0] ?? null);
}

export async function POST(req: NextRequest) {
  const json = await req.json();

  const voiceRules =
    typeof json.voice_rules === "string" && VALID_VOICE_RULES.includes(json.voice_rules)
      ? json.voice_rules
      : null;

  const followUp =
    typeof json.follow_up_style === "string" && VALID_FOLLOW_UP.includes(json.follow_up_style)
      ? json.follow_up_style
      : null;

  const payload = {
    brand_name:
      typeof json.brand_name === "string" && json.brand_name.trim()
        ? json.brand_name.trim().slice(0, 80)
        : "Zoya",
    system_prompt: null as string | null,
    voice_rules: voiceRules,
    forbidden_words: clampText(json.forbidden_words, MAX_FORBIDDEN_WORDS),
    price_framing: clampText(json.price_framing, MAX_PRICE_FRAMING),
    out_of_stock_script: clampText(
      json.out_of_stock_script,
      MAX_OUT_OF_STOCK,
    ),
    greeting_message: clampText(json.greeting_message, MAX_GREETING),
    follow_up_style: followUp,
  };

  const { data: rows, error } = await supabase
    .from("brand_config")
    .select("id")
    .limit(1);

  if (error) {
    console.error("brand_config select error:", error);
    return NextResponse.json(
      { error: "Failed to load brand config" },
      { status: 500 },
    );
  }

  const existing = rows?.[0];

  if (existing) {
    const { error: updateError } = await supabase
      .from("brand_config")
      .update(payload)
      .eq("id", existing.id);

    if (updateError) {
      console.error("brand_config update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save changes" },
        { status: 500 },
      );
    }
  } else {
    const { error: insertError } = await supabase
      .from("brand_config")
      .insert(payload);

    if (insertError) {
      console.error("brand_config insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save changes" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}

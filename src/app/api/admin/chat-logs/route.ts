import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  let limit = Number(limitParam ?? DEFAULT_LIMIT);
  if (!Number.isFinite(limit) || limit <= 0) {
    limit = DEFAULT_LIMIT;
  }
  limit = Math.min(limit, MAX_LIMIT);

  const offset = Number(offsetParam ?? 0);

  const { data, error } = await supabase
    .from("chat_logs")
    .select(
      "id, created_at, session_id, user_message, full_prompt, products_json, model_answer, model_name, input_tokens, output_tokens, total_tokens, error",
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("GET /api/admin/chat-logs error:", error);
    return NextResponse.json(
      { error: "Failed to load chat logs" },
      { status: 500 },
    );
  }

  return NextResponse.json(data ?? []);
}


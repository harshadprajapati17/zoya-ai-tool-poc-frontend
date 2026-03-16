import { useMemo, useState } from "react";

type Role = "user" | "assistant";

type ChatMessageProps = {
  role: Role;
  content: string;
};

type Segment = { type: "text" | "bold" | "italic"; value: string };

function parseInlineMarkdown(text: string): Segment[] {
  const segments: Segment[] = [];
  // Match **bold** and *italic* (non-greedy, no nesting)
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    if (match[2]) {
      segments.push({ type: "bold", value: match[2] });
    } else if (match[3]) {
      segments.push({ type: "italic", value: match[3] });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const rendered = useMemo(() => {
    if (isUser) return content;

    const segments = parseInlineMarkdown(content);
    return segments.map((seg, i) => {
      if (seg.type === "bold") {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {seg.value}
          </strong>
        );
      }
      if (seg.type === "italic") {
        return (
          <em key={i} className="italic">
            {seg.value}
          </em>
        );
      }
      return <span key={i}>{seg.value}</span>;
    });
  }, [content, isUser]);

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed transition-all ${
          isUser
            ? "gradient-accent text-white shadow-[0_4px_14px_rgba(99,102,241,0.25)]"
            : "glass-surface text-slate-700"
        }`}
      >
        {!isUser && !content.startsWith("Welcome to ") && (
          <button
            type="button"
            onClick={async () => {
              try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  await navigator.clipboard.writeText(content);
                }
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {
                // Ignore copy failures silently
              }
            }}
            className="absolute -right-2 -top-3 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-500 shadow-sm hover:bg-violet-50 hover:text-violet-700"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
        {rendered}
      </div>
    </div>
  );
}

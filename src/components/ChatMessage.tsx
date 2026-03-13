type Role = "user" | "assistant";

type ChatMessageProps = {
  role: Role;
  content: string;
};

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed transition-all ${
          isUser
            ? "gradient-accent text-white shadow-[0_4px_14px_rgba(99,102,241,0.25)]"
            : "glass-surface text-slate-700"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

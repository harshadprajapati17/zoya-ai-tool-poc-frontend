import { FormEvent, useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => Promise<void> | void;
  disabled?: boolean;
  placeholder?: string;
};

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue("");
    await onSend(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 rounded-full border border-violet-200/40 bg-white/60 px-4 py-2.5 shadow-sm backdrop-blur-sm transition-all focus-within:border-violet-300 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          placeholder ?? "Ask Zoya for a piece, occasion, or style..."
        }
        className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={disabled}
        className="accent-pill rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
      >
        Send
      </button>
    </form>
  );
}

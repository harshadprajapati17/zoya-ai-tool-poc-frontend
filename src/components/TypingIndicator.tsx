export function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 text-xs text-slate-500 shadow-sm backdrop-blur-sm">
      <span className="mr-1 text-[10px] uppercase tracking-[0.18em] text-violet-400">
        Zoya is thinking
      </span>
      <div className="flex items-center gap-1">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-violet-400" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-electric-blue" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-coral-pink" />
      </div>
    </div>
  );
}

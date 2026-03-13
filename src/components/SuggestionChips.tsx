type SuggestionChipsProps = {
  onSelect: (value: string) => void;
};

const SUGGESTIONS = [
  "Show me diamond rings under 2 lakhs",
  "What necklaces are in the Aeterna collection?",
  "Find rose gold earrings for everyday wear",
  "What's available in the Samave collection?",
  "Show pendants with amethyst",
  "I want a subtle 18K gold piece for gifting",
];

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {SUGGESTIONS.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className="rounded-full border border-violet-200/50 bg-white/50 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:shadow-[0_2px_12px_rgba(139,92,246,0.12)]"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

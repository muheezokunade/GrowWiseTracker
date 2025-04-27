import { Check, Clock } from "lucide-react";

interface SmartSuggestionProps {
  suggestions: Array<{ 
    type: "tip" | "alert";
    text: string 
  }>;
}

export function SmartSuggestionCard({ suggestions }: SmartSuggestionProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-[#27AE60]/10 border border-[#27AE60]/30 p-4 rounded-xl mb-6">
      <h2 className="font-heading font-semibold text-[#219653] mb-2">Smart Suggestions</h2>
      <ul className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="flex items-start">
            {suggestion.type === "tip" ? (
              <Check className="h-5 w-5 text-[#27AE60] mt-0.5 flex-shrink-0" />
            ) : (
              <Clock className="h-5 w-5 text-[#27AE60] mt-0.5 flex-shrink-0" />
            )}
            <span className="ml-2 text-sm text-gray-900">{suggestion.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

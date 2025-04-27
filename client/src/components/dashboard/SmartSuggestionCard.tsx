import { Check, Clock, LightbulbIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl mb-6 shadow-card animate-slide-up">
      <div className="flex items-center mb-3">
        <LightbulbIcon className="h-5 w-5 text-primary mr-2" />
        <h2 className="font-heading font-semibold text-primary">Smart Suggestions</h2>
      </div>
      <ul className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <li key={index} className={cn(
            "flex items-start p-3 rounded-lg",
            suggestion.type === "tip" ? "bg-secondary/50" : "bg-accent/10"
          )}>
            {suggestion.type === "tip" ? (
              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            )}
            <span className="ml-3 text-sm">{suggestion.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

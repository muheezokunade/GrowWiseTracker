import { Slider } from "@/components/ui/slider";
import { useCurrency } from "@/hooks/use-currency";

interface ProfitSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  amount?: number;
}

export function ProfitSlider({
  label,
  value,
  onChange,
  description,
  amount = 0,
}: ProfitSliderProps) {
  const { formatCurrency } = useCurrency();
  
  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div>
      <div className="flex justify-between mb-1">
        <label htmlFor={`slider-${label}`} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-[#27AE60]">{value}%</span>
          {amount !== undefined && (
            <span className="text-xs text-gray-500">
              {formatCurrency(amount)}
            </span>
          )}
        </div>
      </div>
      <Slider
        id={`slider-${label}`}
        min={0}
        max={100}
        step={1}
        value={[value]}
        onValueChange={handleSliderChange}
        className="my-2"
      />
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
}

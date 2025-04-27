import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";

// Define the form schema for adding cash
const addCashSchema = z.object({
  amountToAdd: z.coerce
    .number()
    .positive("Amount must be positive")
    .min(0.01, "Amount must be at least 0.01"),
});

type AddCashFormValues = z.infer<typeof addCashSchema>;

interface AddCashFormProps {
  onSubmit: (data: AddCashFormValues) => void;
  isSubmitting: boolean;
  currentAmount: number;
  targetAmount: number;
}

export function AddCashForm({ 
  onSubmit, 
  isSubmitting, 
  currentAmount, 
  targetAmount 
}: AddCashFormProps) {
  const { formatCurrency } = useCurrency();
  const remaining = targetAmount - currentAmount;

  const form = useForm<AddCashFormValues>({
    resolver: zodResolver(addCashSchema),
    defaultValues: {
      amountToAdd: remaining > 0 ? remaining : 0,
    },
  });

  const handleSubmit = (data: AddCashFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Current amount:</span>
            <span className="font-medium">{formatCurrency(currentAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Target amount:</span>
            <span className="font-medium">{formatCurrency(targetAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Remaining:</span>
            <span className="font-medium">{formatCurrency(Math.max(0, remaining))}</span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="amountToAdd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount to Add</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="submit"
            className="bg-[#27AE60] hover:bg-[#219653]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Cash"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
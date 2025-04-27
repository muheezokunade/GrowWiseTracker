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
import { GrowthGoal } from "@shared/schema";

const goalFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.coerce.number().positive("Target amount must be positive"),
  currentAmount: z.coerce.number().min(0, "Current amount must be 0 or positive"),
  targetDate: z.string().refine(
    (val) => {
      if (!val) return true; // Optional, so empty is ok
      // Accept either YYYY-MM-DD, DD/MM/YYYY, or MM/DD/YYYY formats
      return (
        /^\d{4}-\d{2}-\d{2}$/.test(val) || 
        /^\d{2}\/\d{2}\/\d{4}$/.test(val) ||
        /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)
      );
    }, 
    { message: "Date must be in a valid format (YYYY-MM-DD or DD/MM/YYYY)" }
  ).optional(),
  isCompleted: z.boolean().default(false),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

interface GoalFormProps {
  onSubmit: (data: GoalFormValues) => void;
  isSubmitting: boolean;
  initialData?: GrowthGoal;
}

export function GoalForm({ onSubmit, isSubmitting, initialData }: GoalFormProps) {
  // Format date string for form input
  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString().split("T")[0];
  };

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          targetAmount: initialData.targetAmount,
          currentAmount: initialData.currentAmount,
          targetDate: formatDateForInput(initialData.targetDate),
          isCompleted: initialData.isCompleted,
        }
      : {
          name: "",
          targetAmount: 0,
          currentAmount: 0,
          targetDate: "",
          isCompleted: false,
        },
  });

  const handleSubmit = (data: GoalFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g., New Equipment Purchase" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Amount ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Amount ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="targetDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Date (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {initialData && (
          <FormField
            control={form.control}
            name="isCompleted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 text-[#27AE60] rounded focus:ring-[#27AE60]"
                  />
                </FormControl>
                <FormLabel className="font-normal">Mark as completed</FormLabel>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="bg-[#27AE60] hover:bg-[#219653]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initialData ? (
              "Update Goal"
            ) : (
              "Create Goal"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layouts/MainLayout";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Transaction, insertTransactionSchema } from "@shared/schema";
import { Loader2, PlusCircle, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import queryString from "query-string";

// Define form schema for transactions
const transactionFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["income", "expense"]),
  category: z.string().optional(),
  date: z.string().refine(
    (val) => {
      // Accept either YYYY-MM-DD, DD/MM/YYYY, or MM/DD/YYYY formats
      return (
        /^\d{4}-\d{2}-\d{2}$/.test(val) || 
        /^\d{2}\/\d{2}\/\d{4}$/.test(val) ||
        /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)
      );
    }, 
    { message: "Date must be in a valid format (YYYY-MM-DD or DD/MM/YYYY)" }
  ),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export default function TransactionsPage() {
  const { toast } = useToast();
  const [location] = useLocation();
  const params = queryString.parse(location.split('?')[1] || '');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(params.action === "add");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch transactions
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Add transaction mutation
  const addMutation = useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Transaction added",
        description: "Your transaction has been added successfully.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to add transaction",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Edit transaction mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TransactionFormValues> }) => {
      // Ensure date is in the correct format
      let formattedData = { ...data };
      if (formattedData.date) {
        // Ensure date is in YYYY-MM-DD format for the server
        if (typeof formattedData.date === 'string') {
          if (formattedData.date.includes('/')) {
            const [day, month, year] = formattedData.date.split('/');
            formattedData.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
      }

      const res = await apiRequest("PUT", `/api/transactions/${id}`, formattedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Transaction updated",
        description: "Your transaction has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setCurrentTransaction(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update transaction",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Transaction deleted",
        description: "Your transaction has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete transaction",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form for adding new transactions
  const addForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
      type: "expense",
      category: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Form for editing transactions
  const editForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    // Default values will be set when a transaction is selected for editing
  });

  // Handle adding a new transaction
  const onAddSubmit = (data: TransactionFormValues) => {
    // Ensure date is in the correct format 'YYYY-MM-DD'
    let formattedData = { ...data };
    
    // Format the date to ensure it's in the expected format
    if (formattedData.date) {
      // If date is in DD/MM/YYYY format, convert to YYYY-MM-DD
      if (formattedData.date.includes('/')) {
        const [day, month, year] = formattedData.date.split('/');
        formattedData.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    addMutation.mutate(formattedData);
  };

  // Handle editing a transaction
  const onEditSubmit = (data: TransactionFormValues) => {
    if (currentTransaction) {
      // Directly use the data from the form as editMutation already handles date formatting
      editMutation.mutate({
        id: currentTransaction.id,
        data: data,
      });
    }
  };

  // Handle editing a transaction
  const handleEdit = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    editForm.reset({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type as "income" | "expense",
      category: transaction.category || "",
      date: new Date(transaction.date).toISOString().split("T")[0],
    });
    setIsEditDialogOpen(true);
  };

  // Handle deleting a transaction
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter transactions by search term
  const filteredTransactions = transactions && Array.isArray(transactions) 
    ? transactions.filter(
        (transaction: Transaction) =>
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (transaction.category &&
            transaction.category.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  return (
    <MainLayout title="Transactions">
      <div className="max-w-4xl mx-auto">
        {/* Search and Add Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            className="bg-[#27AE60] hover:bg-[#219653]"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#27AE60]" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {filteredTransactions && filteredTransactions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction: Transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500">
                  {searchTerm
                    ? "No transactions match your search."
                    : "No transactions yet. Add your first transaction!"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Add Transaction Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
              <DialogDescription>
                Add a new income or expense transaction to track your finances.
              </DialogDescription>
            </DialogHeader>

            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Client Payment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
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
                    control={addForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Software, Rent" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#27AE60] hover:bg-[#219653]"
                    disabled={addMutation.isPending}
                  >
                    {addMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Transaction"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Transaction Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Update the details of your transaction.
              </DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Client Payment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
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
                    control={editForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Software, Rent" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#27AE60] hover:bg-[#219653]"
                    disabled={editMutation.isPending}
                  >
                    {editMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Transaction"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

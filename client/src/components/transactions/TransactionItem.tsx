import { CreditCard, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction } from "@shared/schema";
import { useCurrency } from "@/hooks/use-currency";

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: number) => void;
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  const { formatCurrency } = useCurrency();
  
  const formattedAmount = formatCurrency(transaction.amount);
  
  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(transaction);
    }
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(transaction.id);
    }
  };
  
  return (
    <div className="p-4 hover:bg-gray-50 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0",
            isIncome ? "bg-green-100" : "bg-red-100"
          )}>
            {isIncome ? (
              <DollarSign className="h-5 w-5 text-green-500" />
            ) : (
              <CreditCard className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div>
            <p className="font-medium">{transaction.description}</p>
            <p className="text-xs text-gray-400">{formattedDate}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            "font-medium",
            isIncome ? "text-green-600" : "text-red-600"
          )}>
            {isIncome ? "+" : "-"}{formattedAmount}
          </p>
          <p className="text-xs text-gray-400">{transaction.category || "Uncategorized"}</p>
        </div>
      </div>
      
      {(onEdit || onDelete) && (
        <div className="mt-2 flex justify-end space-x-2">
          {onEdit && (
            <button 
              onClick={handleEdit}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button 
              onClick={handleDelete}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

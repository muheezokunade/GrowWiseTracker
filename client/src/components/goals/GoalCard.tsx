import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, calculateDaysUntil, calculateProgressPercentage } from "@/lib/utils";
import { CalendarClock, Edit, Trash2 } from "lucide-react";
import { GrowthGoal } from "@shared/schema";

interface GoalCardProps {
  goal: GrowthGoal;
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  // Calculate progress percentage
  const progressPercentage = calculateProgressPercentage(goal.currentAmount, goal.targetAmount);
  
  // Calculate days until target date
  const daysRemaining = goal.targetDate ? calculateDaysUntil(goal.targetDate) : null;
  
  // Format amounts
  const formattedCurrentAmount = formatCurrency(goal.currentAmount);
  const formattedTargetAmount = formatCurrency(goal.targetAmount);
  
  // Determine status text and color
  let statusText = "";
  let statusColor = "";
  
  if (goal.isCompleted) {
    statusText = "Completed";
    statusColor = "text-[#27AE60] bg-[#27AE60]/10";
  } else if (daysRemaining !== null) {
    if (daysRemaining < 0) {
      statusText = "Overdue";
      statusColor = "text-red-600 bg-red-50";
    } else if (daysRemaining <= 7) {
      statusText = "Due Soon";
      statusColor = "text-amber-600 bg-amber-50";
    } else {
      statusText = `${daysRemaining} Days Left`;
      statusColor = "text-blue-600 bg-blue-50";
    }
  } else {
    statusText = "In Progress";
    statusColor = "text-blue-600 bg-blue-50";
  }
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-medium text-lg">{goal.name}</h3>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor}`}>
              {statusText}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-gray-100" />
          </div>
          
          <div className="flex justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">Current</p>
              <p className="font-medium">{formattedCurrentAmount}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Target</p>
              <p className="font-medium">{formattedTargetAmount}</p>
            </div>
          </div>
          
          {goal.targetDate && (
            <div className="flex items-center text-sm text-gray-600">
              <CalendarClock className="h-4 w-4 mr-1" />
              <span>Target Date: {formatDate(goal.targetDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end bg-gray-50 px-6 py-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 mr-2"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

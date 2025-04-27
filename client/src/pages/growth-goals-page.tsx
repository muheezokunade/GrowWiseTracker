import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layouts/MainLayout";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalForm } from "@/components/goals/GoalForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GrowthGoal } from "@shared/schema";
import { useLocation } from "wouter";
import queryString from "query-string";
import { AddCashForm } from "@/components/goals/AddCashForm";

export default function GrowthGoalsPage() {
  const { toast } = useToast();
  const [location] = useLocation();
  const params = queryString.parse(location.split('?')[1] || '');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(params.action === "create");
  const [editingGoal, setEditingGoal] = useState<GrowthGoal | null>(null);
  const [addCashGoal, setAddCashGoal] = useState<GrowthGoal | null>(null);

  // Fetch growth goals
  const { data: goals, isLoading } = useQuery<GrowthGoal[]>({
    queryKey: ["/api/growth-goals"],
  });

  // Create goal mutation
  const createGoal = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/growth-goals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/growth-goals"] });
      toast({
        title: "Goal created",
        description: "Your growth goal has been created successfully.",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create goal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update goal mutation
  const updateGoal = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/growth-goals/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/growth-goals"] });
      toast({
        title: "Goal updated",
        description: "Your growth goal has been updated successfully.",
      });
      setEditingGoal(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update goal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete goal mutation
  const deleteGoal = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/growth-goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/growth-goals"] });
      toast({
        title: "Goal deleted",
        description: "Your growth goal has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete goal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Add cash to goal mutation
  const addCashToGoal = useMutation({
    mutationFn: async ({ id, amountToAdd }: { id: number; amountToAdd: number }) => {
      const res = await apiRequest("POST", `/api/growth-goals/${id}/add-cash`, { amountToAdd });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/growth-goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Cash added",
        description: "Cash has been added to your growth goal successfully.",
      });
      setAddCashGoal(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to add cash",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDateForSubmission = (data: any) => {
    const formattedData = { ...data };
    
    // If targetDate exists and is in DD/MM/YYYY format, convert to YYYY-MM-DD
    if (formattedData.targetDate && formattedData.targetDate.includes('/')) {
      const [day, month, year] = formattedData.targetDate.split('/');
      formattedData.targetDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return formattedData;
  };

  const handleAddGoal = (data: any) => {
    const formattedData = formatDateForSubmission(data);
    createGoal.mutate(formattedData);
  };

  const handleUpdateGoal = (data: any) => {
    if (editingGoal) {
      const formattedData = formatDateForSubmission(data);
      updateGoal.mutate({ id: editingGoal.id, data: formattedData });
    }
  };

  const handleDeleteGoal = (goalId: number) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      deleteGoal.mutate(goalId);
    }
  };

  const handleEditGoal = (goal: GrowthGoal) => {
    setEditingGoal(goal);
  };
  
  const handleAddCash = (goal: GrowthGoal) => {
    setAddCashGoal(goal);
  };
  
  const handleSubmitAddCash = (data: { amountToAdd: number }) => {
    if (addCashGoal) {
      addCashToGoal.mutate({ 
        id: addCashGoal.id, 
        amountToAdd: data.amountToAdd 
      });
    }
  };

  return (
    <MainLayout title="Growth Goals">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Set and track financial goals for your business growth.
          </p>
          <Button
            className="bg-[#27AE60] hover:bg-[#219653]"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Growth Goal
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#27AE60]" />
          </div>
        ) : goals && Array.isArray(goals) && goals.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {goals.map((goal: GrowthGoal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => handleEditGoal(goal)}
                onDelete={() => handleDeleteGoal(goal.id)}
                onAddCash={() => handleAddCash(goal)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-[#27AE60]/10 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-[#27AE60]" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Growth Goals Yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first growth goal to start planning your business growth.
            </p>
            <Button
              className="bg-[#27AE60] hover:bg-[#219653]"
              onClick={() => setIsAddDialogOpen(true)}
            >
              Add Your First Goal
            </Button>
          </div>
        )}

        {/* Add Goal Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Growth Goal</DialogTitle>
            </DialogHeader>
            <GoalForm onSubmit={handleAddGoal} isSubmitting={createGoal.isPending} />
          </DialogContent>
        </Dialog>

        {/* Edit Goal Dialog */}
        <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Growth Goal</DialogTitle>
            </DialogHeader>
            {editingGoal && (
              <GoalForm
                onSubmit={handleUpdateGoal}
                isSubmitting={updateGoal.isPending}
                initialData={editingGoal}
              />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Add Cash Dialog */}
        <Dialog open={!!addCashGoal} onOpenChange={(open) => !open && setAddCashGoal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Cash to Goal</DialogTitle>
            </DialogHeader>
            {addCashGoal && (
              <AddCashForm
                onSubmit={handleSubmitAddCash}
                isSubmitting={addCashToGoal.isPending}
                currentAmount={addCashGoal.currentAmount}
                targetAmount={addCashGoal.targetAmount}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

// Inline component for empty state
function TrendingUp(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

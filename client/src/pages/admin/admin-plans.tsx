import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreditCard, Plus, Edit, Eye, PenLine, Check, X } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
  features: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export default function AdminPlans() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [features, setFeatures] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ["/api/admin/plans"],
  });
  
  const createPlanMutation = useMutation({
    mutationFn: async (data: Partial<Plan>) => {
      const res = await apiRequest("POST", "/api/admin/plans", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      resetForm();
      setIsCreateDialogOpen(false);
    }
  });
  
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Plan> }) => {
      const res = await apiRequest("PUT", `/api/admin/plans/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      setIsEditDialogOpen(false);
    }
  });
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setBillingCycle("monthly");
    setFeatures("");
    setIsActive(true);
  };
  
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };
  
  const openEditDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setName(plan.name);
    setDescription(plan.description);
    setPrice(plan.price.toString());
    setBillingCycle(plan.billingCycle);
    setFeatures(plan.features);
    setIsActive(plan.isActive);
    setIsEditDialogOpen(true);
  };
  
  const handleCreatePlan = () => {
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
      alert("Please enter a valid price");
      return;
    }
    
    createPlanMutation.mutate({
      name,
      description,
      price: priceValue,
      billingCycle,
      features,
      isActive
    });
  };
  
  const handleUpdatePlan = () => {
    if (!selectedPlan) return;
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
      alert("Please enter a valid price");
      return;
    }
    
    updatePlanMutation.mutate({
      id: selectedPlan.id,
      data: {
        name,
        description,
        price: priceValue,
        billingCycle,
        features,
        isActive
      }
    });
  };
  
  const handleToggleActive = (plan: Plan) => {
    updatePlanMutation.mutate({
      id: plan.id,
      data: {
        isActive: !plan.isActive
      }
    });
  };
  
  const formatFeaturesList = (featuresString: string) => {
    try {
      // Features could be stored as a JSON string containing an array
      const featuresArray = JSON.parse(featuresString);
      if (Array.isArray(featuresArray)) {
        return (
          <ul className="list-disc list-inside">
            {featuresArray.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        );
      }
    } catch (e) {
      // If it's not JSON, just display as plain text
    }
    
    // Plain text with each line as a feature
    return (
      <ul className="list-disc list-inside">
        {featuresString.split('\n').map((feature, index) => (
          feature.trim() ? <li key={index}>{feature}</li> : null
        ))}
      </ul>
    );
  };
  
  return (
    <AdminLayout title="Plan Management">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Pricing Plans
          </CardTitle>
          <CardDescription>
            Manage subscription plans and pricing for GrowWise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Plan
            </Button>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="text-center py-8">No plans found. Create your first plan!</div>
            ) : (
              plans.map((plan) => (
                <Card key={plan.id} className={!plan.isActive ? "opacity-60" : undefined}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>
                        {plan.billingCycle === "monthly" ? "Monthly" : "Yearly"} billing
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={plan.isActive ? "success" : "outline"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(plan)}>
                        <PenLine className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleToggleActive(plan)}
                      >
                        {plan.isActive ? (
                          <X className="h-4 w-4 text-destructive" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold">
                        {formatCurrency(plan.price)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Created: {formatDate(plan.createdAt)}
                      </span>
                    </div>
                    <p className="mb-4">{plan.description}</p>
                    <div className="text-sm">
                      <h4 className="font-medium mb-2">Features:</h4>
                      {formatFeaturesList(plan.features)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>
              Add a new subscription plan for GrowWise users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Plan Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Basic, Pro, Enterprise"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <div className="col-span-3 flex">
                <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="rounded-l-none"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="billing" className="text-right">
                Billing Cycle
              </Label>
              <Select value={billingCycle} onValueChange={setBillingCycle}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="active">
                  {isActive ? "Plan is visible and available to users" : "Plan is hidden from users"}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Brief description of this plan"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="features" className="text-right pt-2">
                Features
              </Label>
              <Textarea
                id="features"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="col-span-3 min-h-[150px]"
                placeholder="Enter features, one per line"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan} disabled={createPlanMutation.isPending}>
              {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>
              Update an existing subscription plan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Plan Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price
              </Label>
              <div className="col-span-3 flex">
                <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                  $
                </span>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-billing" className="text-right">
                Billing Cycle
              </Label>
              <Select value={billingCycle} onValueChange={setBillingCycle}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-active" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="edit-active">
                  {isActive ? "Plan is visible and available to users" : "Plan is hidden from users"}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-features" className="text-right pt-2">
                Features
              </Label>
              <Textarea
                id="edit-features"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="col-span-3 min-h-[150px]"
                placeholder="Enter features, one per line"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan} disabled={updatePlanMutation.isPending}>
              {updatePlanMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
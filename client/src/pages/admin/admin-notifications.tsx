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
import { formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bell, Plus, Trash2, Search, RefreshCw } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  targetUserIds: string | null;
  sentAt: string;
  expiresAt: string | null;
  isActive: boolean;
  createdById: number;
}

export default function AdminNotifications() {
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [targetUserIds, setTargetUserIds] = useState("all");
  const [isActive, setIsActive] = useState(true);
  const [expireDays, setExpireDays] = useState("30");
  
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/admin/notifications"],
  });
  
  const createNotificationMutation = useMutation({
    mutationFn: async (data: Partial<Notification>) => {
      const res = await apiRequest("POST", "/api/admin/notifications", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      resetForm();
      setIsCreateDialogOpen(false);
    }
  });
  
  const updateNotificationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Notification> }) => {
      const res = await apiRequest("PUT", `/api/admin/notifications/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      setIsEditDialogOpen(false);
    }
  });
  
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
    }
  });
  
  // Filter notifications based on search
  const filteredNotifications = notifications.filter((notification) => {
    const searchTerm = search.toLowerCase();
    return (
      notification.title.toLowerCase().includes(searchTerm) ||
      notification.message.toLowerCase().includes(searchTerm)
    );
  });
  
  const resetForm = () => {
    setTitle("");
    setMessage("");
    setType("announcement");
    setTargetUserIds("all");
    setIsActive(true);
    setExpireDays("30");
  };
  
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };
  
  const openEditDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    setTitle(notification.title);
    setMessage(notification.message);
    setType(notification.type);
    setTargetUserIds(notification.targetUserIds || "all");
    setIsActive(notification.isActive);
    setExpireDays("30"); // Default
    setIsEditDialogOpen(true);
  };
  
  const handleCreateNotification = () => {
    const expireDate = expireDays === "never" ? null : 
      new Date(Date.now() + parseInt(expireDays) * 24 * 60 * 60 * 1000).toISOString();
    
    createNotificationMutation.mutate({
      title,
      message,
      type,
      targetUserIds: targetUserIds === "all" ? "all" : targetUserIds,
      isActive,
      expiresAt: expireDate
    });
  };
  
  const handleUpdateNotification = () => {
    if (!selectedNotification) return;
    
    const expireDate = expireDays === "never" ? null : 
      new Date(Date.now() + parseInt(expireDays) * 24 * 60 * 60 * 1000).toISOString();
    
    updateNotificationMutation.mutate({
      id: selectedNotification.id,
      data: {
        title,
        message,
        type,
        targetUserIds: targetUserIds === "all" ? "all" : targetUserIds,
        isActive,
        expiresAt: expireDate
      }
    });
  };
  
  const handleToggleActive = (notification: Notification) => {
    updateNotificationMutation.mutate({
      id: notification.id,
      data: {
        isActive: !notification.isActive
      }
    });
  };
  
  const handleDeleteNotification = (id: number) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      deleteNotificationMutation.mutate(id);
    }
  };
  
  return (
    <AdminLayout title="Notification Management">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Platform Notifications
          </CardTitle>
          <CardDescription>
            Manage announcements and notifications for users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              New Notification
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading notifications...
                    </TableCell>
                  </TableRow>
                ) : filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No notifications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">
                        <div
                          className="cursor-pointer hover:underline"
                          onClick={() => openEditDialog(notification)}
                        >
                          {notification.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            notification.type === "announcement"
                              ? "default"
                              : notification.type === "alert"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {notification.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {notification.targetUserIds === "all" ? (
                          "All Users"
                        ) : (
                          `Specific Users`
                        )}
                      </TableCell>
                      <TableCell>{formatDate(notification.sentAt)}</TableCell>
                      <TableCell>
                        {notification.expiresAt
                          ? formatDate(notification.expiresAt)
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={notification.isActive ? "success" : "outline"}
                        >
                          {notification.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(notification)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Notification Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Notification</DialogTitle>
            <DialogDescription>
              Create a new notification or announcement for users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target" className="text-right">
                Target
              </Label>
              <Select value={targetUserIds} onValueChange={setTargetUserIds}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select target users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="1,2,3">Selected Users (Demo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expire" className="text-right">
                Expires In
              </Label>
              <Select value={expireDays} onValueChange={setExpireDays}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
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
                  {isActive ? "Visible to users" : "Hidden from users"}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="message" className="text-right pt-2">
                Message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="col-span-3 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotification} disabled={createNotificationMutation.isPending}>
              {createNotificationMutation.isPending ? "Creating..." : "Create Notification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Notification Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
            <DialogDescription>
              Update existing notification details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-target" className="text-right">
                Target
              </Label>
              <Select value={targetUserIds} onValueChange={setTargetUserIds}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select target users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="1,2,3">Selected Users (Demo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-expire" className="text-right">
                Set New Expiration
              </Label>
              <Select value={expireDays} onValueChange={setExpireDays}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
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
                  {isActive ? "Visible to users" : "Hidden from users"}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-message" className="text-right pt-2">
                Message
              </Label>
              <Textarea
                id="edit-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="col-span-3 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateNotification} disabled={updateNotificationMutation.isPending}>
              {updateNotificationMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
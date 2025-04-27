import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, CheckCircle, LifeBuoy } from "lucide-react";

interface SupportTicket {
  id: number;
  userId: number;
  username?: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string | null;
  assignedToId: number | null;
  resolution: string | null;
}

export default function AdminSupport() {
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolution, setResolution] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get tickets with username (would need to be joined on the server)
  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/admin/support-tickets"],
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SupportTicket> }) => {
      const res = await apiRequest("PUT", `/api/admin/support-tickets/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-tickets"] });
      setIsDialogOpen(false);
    },
  });

  // Filter tickets based on search
  const filteredTickets = tickets.filter((ticket) => {
    const searchTerm = search.toLowerCase();
    return (
      ticket.subject.toLowerCase().includes(searchTerm) ||
      ticket.message.toLowerCase().includes(searchTerm) ||
      (ticket.username && ticket.username.toLowerCase().includes(searchTerm))
    );
  });

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResolution(ticket.resolution || "");
    setIsDialogOpen(true);
  };

  const handleUpdateTicket = () => {
    if (!selectedTicket) return;

    updateTicketMutation.mutate({
      id: selectedTicket.id,
      data: {
        resolution,
        status: resolution ? "resolved" : selectedTicket.status,
      },
    });
  };

  const handleStatusChange = (status: string) => {
    if (!selectedTicket) return;

    updateTicketMutation.mutate({
      id: selectedTicket.id,
      data: {
        status,
      },
    });
  };

  const handlePriorityChange = (priority: string) => {
    if (!selectedTicket) return;

    updateTicketMutation.mutate({
      id: selectedTicket.id,
      data: {
        priority,
      },
    });
  };

  return (
    <AdminLayout title="Support Tickets">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LifeBuoy className="mr-2 h-5 w-5" />
            Support Ticket Management
          </CardTitle>
          <CardDescription>
            View and respond to support tickets from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets by subject or message..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              defaultValue="all"
              onValueChange={(value) => setSearch(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading tickets...
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No tickets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <TableCell>#{ticket.id}</TableCell>
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
                      <TableCell>{ticket.username || `User ${ticket.userId}`}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ticket.status === "open"
                              ? "default"
                              : ticket.status === "in_progress"
                                ? "secondary"
                                : ticket.status === "resolved"
                                  ? "success"
                                  : "outline"
                          }
                        >
                          {ticket.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ticket.priority === "high"
                              ? "destructive"
                              : ticket.priority === "medium"
                                ? "default"
                                : "outline"
                          }
                        >
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Ticket #{selectedTicket?.id}: {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription>
              View and respond to this support ticket
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  <Select
                    defaultValue={selectedTicket.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Priority</h4>
                  <Select
                    defaultValue={selectedTicket.priority}
                    onValueChange={handlePriorityChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">User</h4>
                <p>{selectedTicket.username || `User ${selectedTicket.userId}`}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Message</h4>
                <div className="rounded-md border p-3 bg-muted/20 whitespace-pre-wrap">
                  {selectedTicket.message}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Resolution</h4>
                <Textarea
                  placeholder="Enter your response or resolution details..."
                  className="min-h-[100px]"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <div>
              {selectedTicket?.status !== "resolved" && (
                <Button
                  variant="default"
                  onClick={() => handleStatusChange("resolved")}
                  disabled={updateTicketMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Resolved
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={updateTicketMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleUpdateTicket}
                disabled={updateTicketMutation.isPending}
              >
                {updateTicketMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
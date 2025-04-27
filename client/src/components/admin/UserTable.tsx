import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { User } from "@shared/schema";
import { MoreHorizontal, Search, UserCheck, UserX } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function UserTable() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsDialogOpen(false);
    },
  });

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const searchTerm = search.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchTerm) ||
      (user.businessName && user.businessName.toLowerCase().includes(searchTerm))
    );
  });

  const handleStatusChange = (user: User, status: string) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { status },
    });
  };

  const handleRoleChange = (user: User, isAdmin: boolean) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { isAdmin },
    });
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">Export</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.businessName || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active"
                          ? "success"
                          : user.status === "suspended"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge variant="default">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? formatDate(user.createdAt) : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                          View Details
                        </DropdownMenuItem>
                        {user.status === "active" ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(user, "suspended")}>
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleStatusChange(user, "active")}>
                            Activate User
                          </DropdownMenuItem>
                        )}
                        {!user.isAdmin ? (
                          <DropdownMenuItem onClick={() => handleRoleChange(user, true)}>
                            Make Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleRoleChange(user, false)}>
                            Remove Admin Role
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Username</h4>
                  <p>{selectedUser.username}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  <Badge
                    variant={
                      selectedUser.status === "active"
                        ? "success"
                        : selectedUser.status === "suspended"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Business Name</h4>
                  <p>{selectedUser.businessName || "-"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Industry</h4>
                  <p>{selectedUser.industry || "-"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Monthly Revenue</h4>
                  <p>{selectedUser.monthlyRevenue || "-"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Joined</h4>
                  <p>{selectedUser.createdAt ? formatDate(selectedUser.createdAt) : "-"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Login</h4>
                  <p>{selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : "-"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Role</h4>
                  <p>{selectedUser.isAdmin ? "Admin" : "User"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <div>
              {selectedUser && selectedUser.status === "active" ? (
                <Button
                  variant="destructive"
                  onClick={() => handleStatusChange(selectedUser, "suspended")}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Suspend User
                </Button>
              ) : selectedUser && (
                <Button
                  variant="default"
                  onClick={() => handleStatusChange(selectedUser, "active")}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activate User
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
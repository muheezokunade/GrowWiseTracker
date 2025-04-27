import { AdminLayout } from "@/components/layouts/AdminLayout";
import { UserTable } from "@/components/admin/UserTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsers() {
  return (
    <AdminLayout title="User Management">
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage all users registered on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
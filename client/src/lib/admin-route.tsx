import { useAuth } from "../hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function AdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // If not authenticated or not an admin, redirect
  if (!user || !user.isAdmin) {
    return (
      <Route path={path}>
        <Redirect to={user ? "/dashboard" : "/auth"} />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
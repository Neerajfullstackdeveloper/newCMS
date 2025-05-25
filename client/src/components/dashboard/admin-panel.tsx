import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, DataRequest } from "@shared/schema";
import { Users, ClipboardList, BarChart, Loader2 } from "lucide-react";
import { format } from "date-fns";

export function AdminPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "requests">("overview");

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: pendingRequests = [], isLoading: requestsLoading } = useQuery<DataRequest[]>({
    queryKey: ["/api/data-requests/pending"],
  });

  // Mutations
  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/data-requests/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-requests"] });
      toast({ title: "Request status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update request status", variant: "destructive" });
    },
  });

  const handleRequestAction = (id: number, status: string) => {
    updateRequestStatusMutation.mutate({ id, status });
  };

  const renderOverview = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Administration Panel</h2>
        <p className="text-gray-600">System management and user administration</p>
      </div>

      {/* Admin Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* User Management */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            </div>
            <p className="text-gray-600 mb-4">Manage employee accounts and permissions</p>
            <Button 
              className="w-full" 
              onClick={() => setActiveTab("users")}
            >
              Manage Users
            </Button>
          </CardContent>
        </Card>

        {/* Data Requests */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Data Requests</h3>
            </div>
            <p className="text-gray-600 mb-4">Review and approve employee data requests</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Pending: <strong>{pendingRequests.length}</strong>
              </span>
              <Button 
                variant="outline"
                onClick={() => setActiveTab("requests")}
              >
                Review
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Analytics */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                <BarChart className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            </div>
            <p className="text-gray-600 mb-4">View system usage and performance metrics</p>
            <Button className="w-full">
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Management</h2>
        <p className="text-gray-600">Manage employee accounts and permissions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <Button onClick={() => setActiveTab("overview")}>
              Back to Overview
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.loginTime ? format(new Date(user.loginTime), "MMM dd, yyyy HH:mm") : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderRequests = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Data Requests</h2>
        <p className="text-gray-600">Review and approve employee data requests</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Requests</CardTitle>
            <Button onClick={() => setActiveTab("overview")}>
              Back to Overview
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">User ID: {request.userId}</h4>
                      <p className="text-sm text-gray-600 capitalize">{request.requestType} Request</p>
                      {request.industry && (
                        <p className="text-sm text-gray-500">Industry: {request.industry}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(request.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{request.justification}</p>
                  <div className="flex space-x-3">
                    <Button
                      size="sm"
                      onClick={() => handleRequestAction(request.id, "approved")}
                      disabled={updateRequestStatusMutation.isPending}
                    >
                      {updateRequestStatusMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRequestAction(request.id, "rejected")}
                      disabled={updateRequestStatusMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
              <p className="text-gray-600">All data requests have been processed.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  switch (activeTab) {
    case "users":
      return renderUsers();
    case "requests":
      return renderRequests();
    default:
      return renderOverview();
  }
}

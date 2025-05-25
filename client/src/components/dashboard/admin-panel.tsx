import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { User, DataRequest, Company, Holiday } from "@shared/schema";
import { Users, ClipboardList, BarChart, Loader2, Plus, Edit, Trash2, Building, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export function AdminPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "requests" | "companies" | "holidays">("overview");
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [isCreateHolidayOpen, setIsCreateHolidayOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    employeeId: "",
    role: "employee"
  });
  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    industry: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    companySize: "",
    notes: "",
    assignedToUserId: ""
  });
  const [newHolidayData, setNewHolidayData] = useState({
    name: "",
    date: "",
    description: "",
    duration: "full_day"
  });

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: pendingRequests = [], isLoading: requestsLoading } = useQuery<DataRequest[]>({
    queryKey: ["/api/data-requests/pending"],
  });

  const { data: allCompanies = [], isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: activeTab === "companies",
  });

  const { data: holidays = [], isLoading: holidaysLoading } = useQuery<Holiday[]>({
    queryKey: ["/api/holidays"],
    enabled: activeTab === "holidays",
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

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/admin/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User created successfully" });
      setIsCreateUserOpen(false);
      setNewUserData({ username: "", email: "", password: "", fullName: "", employeeId: "", role: "employee" });
    },
    onError: () => {
      toast({ title: "Failed to create user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: any) => {
      const response = await apiRequest("POST", "/api/admin/companies", companyData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({ title: "Company created successfully" });
      setIsCreateCompanyOpen(false);
      setNewCompanyData({ name: "", industry: "", email: "", phone: "", address: "", website: "", companySize: "", notes: "", assignedToUserId: "" });
    },
    onError: () => {
      toast({ title: "Failed to create company", variant: "destructive" });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/companies/${companyId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({ title: "Company deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete company", variant: "destructive" });
    },
  });

  const createHolidayMutation = useMutation({
    mutationFn: async (holidayData: any) => {
      const response = await apiRequest("POST", "/api/holidays", holidayData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      toast({ title: "Holiday created successfully" });
      setIsCreateHolidayOpen(false);
      setNewHolidayData({ name: "", date: "", description: "", duration: "full_day" });
    },
    onError: () => {
      toast({ title: "Failed to create holiday", variant: "destructive" });
    },
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: async (holidayId: number) => {
      const response = await apiRequest("DELETE", `/api/holidays/${holidayId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      toast({ title: "Holiday deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete holiday", variant: "destructive" });
    },
  });

  const handleRequestAction = (id: number, status: string) => {
    updateRequestStatusMutation.mutate({ id, status });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUserData);
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const companyData = {
      ...newCompanyData,
      assignedToUserId: newCompanyData.assignedToUserId ? parseInt(newCompanyData.assignedToUserId) : null
    };
    createCompanyMutation.mutate(companyData);
  };

  const handleCreateHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    const holidayData = {
      ...newHolidayData,
      date: new Date(newHolidayData.date).toISOString()
    };
    createHolidayMutation.mutate(holidayData);
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
            <div className="flex space-x-2">
              <Button 
                className="flex-1" 
                onClick={() => setActiveTab("users")}
              >
                Manage Users
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Management */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Company Data</h3>
            </div>
            <p className="text-gray-600 mb-4">Add and manage company records for all employees</p>
            <Button 
              className="w-full" 
              onClick={() => setActiveTab("companies")}
            >
              Manage Companies
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

        {/* Holiday Management */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Holiday Management</h3>
            </div>
            <p className="text-gray-600 mb-4">Manage company holidays and schedules</p>
            <Button 
              className="w-full" 
              onClick={() => setActiveTab("holidays")}
            >
              Manage Holidays
            </Button>
          </CardContent>
        </Card>

        {/* System Analytics */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                <BarChart className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">System Stats</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Users: {users.length} | Companies: {allCompanies.length} | Holidays: {holidays.length}
            </p>
            <Button className="w-full" variant="outline">
              View Details
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
            <div className="flex space-x-3">
              <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={newUserData.fullName}
                        onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUserData.email}
                        onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newUserData.username}
                        onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        value={newUserData.employeeId}
                        onChange={(e) => setNewUserData({...newUserData, employeeId: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={newUserData.role} onValueChange={(value) => setNewUserData({...newUserData, role: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="tl">Team Lead (TL)</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Main Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUserData.password}
                        onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button type="button" variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createUserMutation.isPending}>
                        {createUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create User"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button onClick={() => setActiveTab("overview")}>
                Back to Overview
              </Button>
            </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{userItem.fullName}</div>
                          <div className="text-sm text-gray-500">{userItem.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="capitalize">
                          {userItem.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={userItem.isActive ? "default" : "secondary"}>
                          {userItem.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userItem.loginTime ? format(new Date(userItem.loginTime), "MMM dd, yyyy HH:mm") : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user?.role === "admin" && userItem.id !== user.id && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUserMutation.mutate(userItem.id)}
                            disabled={deleteUserMutation.isPending}
                          >
                            {deleteUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        )}
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

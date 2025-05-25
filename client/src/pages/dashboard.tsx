import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyCard } from "@/components/dashboard/company-card";
import { CommentModal } from "@/components/dashboard/comment-modal";
import { AdminPanel } from "@/components/dashboard/admin-panel";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Company, Holiday, DataRequest, Comment } from "@shared/schema";
import { Menu, Bell, User, Database, Calendar, Clock, Plus, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

type Section = 
  | "allData" 
  | "todayData" 
  | "facebookData" 
  | "facebookRequest" 
  | "followUp" 
  | "hotData" 
  | "blockData" 
  | "newList" 
  | "requestData" 
  | "holidays" 
  | "adminPanel";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<Section>("allData");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");

  // Update login time when dashboard loads
  useEffect(() => {
    const updateLoginTime = async () => {
      try {
        await apiRequest("POST", "/api/user/login-time");
      } catch (error) {
        console.error("Failed to update login time:", error);
      }
    };
    updateLoginTime();
  }, []);

  // Queries
  const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: currentSection === "allData",
  });

  const { data: myCompanies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies/my"],
    enabled: user?.role === "employee",
  });

  const { data: todayComments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/comments/today"],
    enabled: currentSection === "todayData",
  });

  const { data: holidays = [] } = useQuery<Holiday[]>({
    queryKey: ["/api/holidays"],
    enabled: currentSection === "holidays",
  });

  const { data: dataRequests = [] } = useQuery<DataRequest[]>({
    queryKey: ["/api/data-requests"],
    enabled: currentSection === "requestData",
  });

  const { data: followUpCompanies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies/category/followup"],
    enabled: currentSection === "followUp",
  });

  const { data: hotCompanies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies/category/hot"],
    enabled: currentSection === "hotData",
  });

  const { data: blockCompanies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies/category/block"],
    enabled: currentSection === "blockData",
  });

  // Mutations
  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/companies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({ title: "Company added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add company", variant: "destructive" });
    },
  });

  const createDataRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/data-requests", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-requests"] });
      toast({ title: "Data request submitted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to submit data request", variant: "destructive" });
    },
  });

  // Filter companies based on search and filters
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === "all" || company.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const handleNewCompanySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      industry: formData.get("industry") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      website: formData.get("website") as string,
      companySize: formData.get("companySize") as string,
      notes: formData.get("notes") as string,
    };
    createCompanyMutation.mutate(data);
    e.currentTarget.reset();
  };

  const handleDataRequestSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      requestType: formData.get("requestType") as string,
      industry: formData.get("industry") as string,
      justification: formData.get("justification") as string,
    };
    createDataRequestMutation.mutate(data);
    e.currentTarget.reset();
  };

  const renderSection = () => {
    switch (currentSection) {
      case "allData":
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">All Company Data</h2>
              <p className="text-gray-600">Complete overview of all company records in the system</p>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="followup">Follow-Up</SelectItem>
                      <SelectItem value="hot">Hot Data</SelectItem>
                      <SelectItem value="block">Block Data</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Company Cards */}
            {companiesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      onAddComment={() => setSelectedCompany(company)}
                    />
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="text-center py-12">
                      <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                      <p className="text-gray-600">Try adjusting your search criteria or add new companies.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        );

      case "todayData":
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Today's Activity</h2>
              <p className="text-gray-600">Comments and updates made today, sorted by time</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Activity Timeline</CardTitle>
                  <span className="text-sm text-gray-600">{format(new Date(), "MMMM dd, yyyy")}</span>
                </div>
              </CardHeader>
              <CardContent>
                {todayComments.length > 0 ? (
                  <div className="space-y-6">
                    {todayComments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">Company #{comment.companyId}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              comment.category === "followup" ? "bg-yellow-100 text-yellow-800" :
                              comment.category === "hot" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {comment.category === "followup" ? "Follow-Up" :
                               comment.category === "hot" ? "Hot Data" : "Block Data"}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{comment.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{format(new Date(comment.commentDate), "h:mm a")}</span>
                            <span>by {user?.fullName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activity today</h3>
                    <p className="text-gray-600">Start adding comments to companies to see today's activity.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "newList":
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Company</h2>
              <p className="text-gray-600">Manually add new company data to the system</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleNewCompanySubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <Input name="name" placeholder="Enter company name" required />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                      <Select name="industry" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <Input name="email" type="email" placeholder="company@email.com" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <Input name="phone" type="tel" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <Input name="address" placeholder="Company address" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <Input name="website" type="url" placeholder="https://company.com" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                      <Select name="companySize">
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea 
                      name="notes"
                      rows={4} 
                      placeholder="Additional information about the company..." 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCompanyMutation.isPending}>
                      {createCompanyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Company
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        );

      case "requestData":
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Company Data</h2>
              <p className="text-gray-600">Request access to new company data from administrators</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Request Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Submit Data Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDataRequestSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
                      <Select name="requestType" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select request type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Company Data</SelectItem>
                          <SelectItem value="industry">Industry Specific</SelectItem>
                          <SelectItem value="geographic">Geographic Region</SelectItem>
                          <SelectItem value="size">Company Size Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry (Optional)</label>
                      <Select name="industry">
                        <SelectTrigger>
                          <SelectValue placeholder="All Industries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Industries</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Justification</label>
                      <textarea 
                        name="justification"
                        rows={4} 
                        placeholder="Explain why you need this data..." 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={createDataRequestMutation.isPending}>
                      {createDataRequestMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Request History */}
              <Card>
                <CardHeader>
                  <CardTitle>Request History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dataRequests.length > 0 ? (
                      dataRequests.map((request) => (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{request.requestType}</span>
                            <span className={`px-3 py-1 text-xs rounded-full ${
                              request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              request.status === "approved" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {request.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{request.justification}</p>
                          <p className="text-xs text-gray-500">
                            Submitted {format(new Date(request.createdAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Download className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-600">No requests yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "holidays":
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Holidays</h2>
              <p className="text-gray-600">Upcoming holidays and company events</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {holidays.length > 0 ? (
                holidays.map((holiday) => (
                  <Card key={holiday.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{holiday.name}</h3>
                          <p className="text-sm text-gray-600">{format(new Date(holiday.date), "MMMM dd, yyyy")}</p>
                        </div>
                      </div>
                      {holiday.description && (
                        <p className="text-sm text-gray-600 mb-3">{holiday.description}</p>
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{holiday.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No holidays scheduled</h3>
                    <p className="text-gray-600">Contact your administrator to add holidays.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case "followUp":
        return renderCategorySection("Follow-Up Data", followUpCompanies, "yellow");

      case "hotData":
        return renderCategorySection("Hot Data", hotCompanies, "green");

      case "blockData":
        return renderCategorySection("Block Data", blockCompanies, "red");

      case "adminPanel":
        return user && ["tl", "manager", "admin"].includes(user.role) ? (
          <AdminPanel />
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">You don't have permission to access the admin panel.</p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const renderCategorySection = (title: string, companies: Company[], colorScheme: string) => {
    const colorClasses = {
      yellow: "bg-yellow-100 text-yellow-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
    };

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">Companies categorized as {title.toLowerCase()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.length > 0 ? (
            companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onAddComment={() => setSelectedCompany(company)}
                statusColor={colorClasses[colorScheme as keyof typeof colorClasses]}
              />
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {title.toLowerCase()} found</h3>
                <p className="text-gray-600">Companies will appear here when categorized as {title.toLowerCase()}.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Database className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">DataFlow Dashboard</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-white text-xs flex items-center justify-center">
                3
              </span>
            </Button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          followUpCount={followUpCompanies.length}
          hotDataCount={hotCompanies.length}
          blockDataCount={blockCompanies.length}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderSection()}
        </main>
      </div>

      {/* Comment Modal */}
      {selectedCompany && (
        <CommentModal
          company={selectedCompany}
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building, Phone, Mail, Globe, MapPin, Users, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

export function AssignedCompanies() {
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["/api/companies/my"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/companies/my");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assigned Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies assigned yet</h3>
            <p className="text-gray-600">
              Your assigned companies will appear here after your data request is approved by an admin.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assigned Companies ({companies.length})</CardTitle>
          <Badge variant="outline" className="text-sm">
            Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company: any) => (
            <Card key={company.id} className="relative hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{company.name}</h4>
                      <p className="text-sm text-gray-500">ID: {company.id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="capitalize">
                        {company.industry}
                      </Badge>
                      <Badge 
                        variant={company.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {company.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {company.companySize && (
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {company.companySize}
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {company.email}
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {company.phone}
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center text-gray-600">
                        <Globe className="h-4 w-4 mr-2" />
                        {company.website}
                      </div>
                    )}
                  </div>

                  {company.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                      <span>{company.address}</span>
                    </div>
                  )}

                  {company.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium mb-1">Notes:</p>
                      <p className="whitespace-pre-line bg-gray-50 p-2 rounded">{company.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(company.createdAt), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(company.updatedAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
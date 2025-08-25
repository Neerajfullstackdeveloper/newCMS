import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { User } from "shared/schema";

export function AdminCompanyForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState("");
  const [newService, setNewService] = useState("");
  const [assignedToUserId, setAssignedToUserId] = useState<string | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const assignCompanyMutation = useMutation({
    mutationFn: async ({ companyId, userId }: { companyId: number, userId: number }) => {
      const response = await apiRequest("POST", `/api/admin/companies/${companyId}/assign`, { userId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({ title: "Company assigned successfully" });
    },
    onError: () => {
      toast({ title: "Failed to assign company", variant: "destructive" });
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/companies", data);
      return response.json();
    },
    onSuccess: (newCompany) => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({ title: "Company added successfully" });
      if (assignedToUserId) {
        assignCompanyMutation.mutate({ companyId: newCompany.id, userId: parseInt(assignedToUserId) });
      }
      // Reset form
      setProducts([]);
      setServices([]);
      setNewProduct("");
      setNewService("");
      setAssignedToUserId(null);
    },
    onError: () => {
      toast({ title: "Failed to add company", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      clientname: formData.get("clientname") as string,
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      products: products,
      services: services,
    };
    createCompanyMutation.mutate(data);
    e.currentTarget.reset();
  };

  const addProduct = () => {
    if (newProduct.trim()) {
      setProducts([...products, newProduct.trim()]);
      setNewProduct("");
    }
  };

  const addService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Company</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="clientname">Company Client Name</Label>
            <Input id="clientname" name="clientname" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input id="name" name="name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Contact Number</Label>
            <Input id="phone" name="phone" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign-to">Assign to User</Label>
            <Select onValueChange={setAssignedToUserId} value={assignedToUserId || ""}>
              <SelectTrigger id="assign-to">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {usersLoading ? (
                  <SelectItem value="loading" disabled>Loading users...</SelectItem>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.fullName} ({user.username})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Products</Label>
            <div className="flex gap-2">
              <Input
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                placeholder="Add a product"
              />
              <Button type="button" onClick={addProduct}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  <span>{product}</span>
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Services</Label>
            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Add a service"
              />
              <Button type="button" onClick={addService}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  <span>{service}</span>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={createCompanyMutation.isPending}>
            {createCompanyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Company...
              </>
            ) : (
              "Add Company"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
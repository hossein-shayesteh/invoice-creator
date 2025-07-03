"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type User = {
  id: string;
  username: string;
  role: string;
  invoiceCount?: number;
  invoices?: Invoice[];
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  total: number;
  items: InvoiceItem[];
};

type InvoiceItem = {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewInvoicesDialogOpen, setIsViewInvoicesDialogOpen] =
    useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "USER",
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError("Error loading users. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      username: "",
      password: "",
      role: "USER",
    });
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (user: User) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  // View user invoices
  const handleViewInvoices = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const userData = await response.json();
      setCurrentUser(userData);
      setIsViewInvoicesDialogOpen(true);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to fetch user invoices");
      console.error(err);
    }
  };

  // Add new user
  const handleAddUser = async () => {
    try {
      if (!formData.username || !formData.password) {
        toast.error("Username and password are required");
        return;
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add user");
      }

      await fetchUsers();
      setIsAddDialogOpen(false);
      resetFormData();
      toast.success("User added successfully");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to add user");
      console.error(err);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      await fetchUsers();
      setIsDeleteDialogOpen(false);
      setCurrentUser(null);
      toast.success("User deleted successfully");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to delete user");
      console.error(err);
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete invoice");
      }

      // Refresh user data to update invoices
      if (currentUser) {
        const userResponse = await fetch(`/api/users/${currentUser.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
        }
      }

      // Refresh users list to update invoice counts
      await fetchUsers();

      toast.success("Invoice deleted successfully");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to delete invoice");
      console.error(err);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add New User</Button>
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.invoiceCount || 0}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoices(user)}
                      >
                        View Invoices
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(user)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the user &quot;
              {currentUser?.username}&quot;? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Invoices Dialog */}
      <Dialog
        open={isViewInvoicesDialogOpen}
        onOpenChange={setIsViewInvoicesDialogOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoices for {currentUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto py-4">
            {currentUser?.invoices?.length === 0 ? (
              <p className="py-4 text-center">
                No invoices found for this user.
              </p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {currentUser?.invoices?.map((invoice) => (
                  <AccordionItem key={invoice.id} value={invoice.id}>
                    <AccordionTrigger className="flex justify-between px-4">
                      <div className="flex w-full justify-between pr-4">
                        <span>Invoice #{invoice.invoiceNumber}</span>
                        <span>{formatDate(invoice.createdAt)}</span>
                        <span>${invoice.total.toFixed(2)}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-4 py-2">
                        <h4 className="mb-2 font-semibold">Items:</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoice.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>${item.price.toFixed(2)}</TableCell>
                                <TableCell>
                                  ${item.subtotal.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                          >
                            Delete Invoice
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewInvoicesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

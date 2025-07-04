"use client";

import React, { useState } from "react";

import { User } from "@prisma/client";
import { FileText, MoreHorizontal, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

import { useAction } from "@/hooks/use-action";

import { createUser } from "@/lib/actions/create-user";
import { deleteInvoice } from "@/lib/actions/delete-invoice";
import { deleteUser } from "@/lib/actions/delete-user";
import { getUserById } from "@/lib/user-services";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { GetUserByIdInvoiceResult, GetUserByIdResult } from "@/types";

interface AdminUsersSectionProps {
  users: User[];
}

const AdminUsersSection = ({ users }: AdminUsersSectionProps) => {
  const [selectedUser, setSelectedUser] = useState<GetUserByIdResult | null>(
    null,
  );
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [userInvoices, setUserInvoices] = useState<GetUserByIdInvoiceResult[]>(
    [],
  );
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: "",
    username: "",
    password: "",
    isAdmin: false,
  });

  const { execute: executeCreateUser } = useAction(createUser, {
    onSuccess: async (_data, message) => {
      resetUserForm();
      setUserDialogOpen(false);
      toast.success(message);
    },
    onError: async (error) => {
      toast.error(error);
    },
  });

  const { execute: executeDeleteUser } = useAction(deleteUser, {
    onSuccess: async (_data, message) => {
      resetUserForm();
      setUserDialogOpen(false);
      toast.success(message);
    },
    onError: async (error) => {
      toast.error(error);
    },
  });

  const { execute: executeDeleteInvoice } = useAction(deleteInvoice, {
    onSuccess: async (_data, message) => {
      resetUserForm();
      setUserDialogOpen(false);
      toast.success(message);
    },
    onError: async (error) => {
      toast.error(error);
    },
  });

  // Handle user form input change
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change for isAdmin
  const handleCheckboxChange = (checked: boolean) => {
    setUserFormData((prev) => ({ ...prev, isAdmin: checked }));
  };

  // Reset user form
  const resetUserForm = () => {
    setUserFormData({
      name: "",
      username: "",
      password: "",
      isAdmin: false,
    });
  };

  // Fetch user details
  const fetchUserDetails = async (userId: string) => {
    const user = await getUserById(userId);
    setSelectedUser(user);
    setUserInvoices(user?.invoices || []);
    setUserDetailsOpen(true);
  };

  // Handle user form submission
  const handleCreateUser = async () => {
    await executeCreateUser({ ...userFormData });
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? All their invoices will also be deleted.",
      )
    )
      return;

    await executeDeleteUser({ id: userId });
  };

  // Delete invoice
  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    await executeDeleteInvoice({ id: invoiceId });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  if (!users)
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );

  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetUserForm();
                setUserDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Fill in the user details below.
              </DialogDescription>
            </DialogHeader>

            <form action={handleCreateUser} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={userFormData.name}
                    onChange={handleUserInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    name="username"
                    value={userFormData.username}
                    onChange={handleUserInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={userFormData.password}
                    onChange={handleUserInputChange}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAdmin"
                    checked={userFormData.isAdmin}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="isAdmin">Admin User</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetUserForm();
                    setUserDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Invoices</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "ADMIN" ? "default" : "outline"}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {/*TODO*/}
                      {/*{user._count?.invoices || 0}*/}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => fetchUserDetails(user.id)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-2 font-semibold">User Information</h3>
                  <p>
                    <strong>Name:</strong> {selectedUser.name}
                  </p>
                  <p>
                    <strong>Username:</strong> {selectedUser.username}
                  </p>
                  <p>
                    <strong>Role:</strong>{" "}
                    <Badge
                      variant={
                        selectedUser.role === "ADMIN" ? "default" : "outline"
                      }
                    >
                      {selectedUser.role}
                    </Badge>
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">
                  Invoices ({userInvoices.length})
                </h3>
                {userInvoices.length === 0 ? (
                  <p className="text-gray-500">No invoices found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">CC Points</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.invoiceNumber}</TableCell>
                          <TableCell className="text-right">
                            {invoice.total.toLocaleString()} IRR
                          </TableCell>
                          <TableCell className="text-right">
                            {invoice.totalCC.toFixed(3)}
                          </TableCell>
                          <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUsersSection;

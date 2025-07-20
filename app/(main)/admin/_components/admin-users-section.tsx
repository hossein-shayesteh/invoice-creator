"use client";

import React, { useState } from "react";

import { User } from "@prisma/client";
import { ScrollArea } from "@radix-ui/react-scroll-area";
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
    idNumber: "",
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
      setUserDetailsOpen(false);
      toast.success(message);
    },
    onError: async (error) => {
      toast.error(error);
      setUserDetailsOpen(false);
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
      idNumber: "",
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
      <div
        className="my-4 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between"
        dir="rtl"
      >
        <h2 className="text-xl font-semibold">مدیریت کاربران</h2>
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
              افزودن کاربر
            </Button>
          </DialogTrigger>
          {/* 1. Set direction and alignment for the Dialog */}
          <DialogContent className="text-right">
            <DialogHeader>
              <DialogTitle>افزودن کاربر جدید</DialogTitle>
              <DialogDescription>
                جزئیات کاربر را در زیر وارد کنید.
              </DialogDescription>
            </DialogHeader>

            <form action={handleCreateUser} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">نام کامل *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={userFormData.name}
                    onChange={handleUserInputChange}
                    required
                    className="text-right"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username">نام کاربری *</Label>
                  <Input
                    id="username"
                    name="username"
                    value={userFormData.username}
                    onChange={handleUserInputChange}
                    required
                    className="text-right"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="idNumber">شماره شناسایی *</Label>
                  <Input
                    id="idNumber"
                    name="idNumber"
                    value={userFormData.idNumber}
                    onChange={handleUserInputChange}
                    required
                    className="text-right"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">رمز عبور *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={userFormData.password}
                    onChange={handleUserInputChange}
                    required
                    className="text-right"
                  />
                </div>

                {/* 2. Use direction-agnostic 'gap' for spacing */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isAdmin"
                    checked={userFormData.isAdmin}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="isAdmin" className="p-0">
                    کاربر ادمین
                  </Label>
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
                  انصراف
                </Button>
                <Button type="submit">ایجاد</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card dir="rtl" className="w-full text-right">
        <CardContent className="p-0">
          {/* ------------------ START: DESKTOP VIEW (TABLE) ------------------ */}
          {/* This table is only visible on medium screens and larger (md and up) */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">نام کاربری</TableHead>
                  <TableHead className="text-right">شماره شناسایی</TableHead>
                  <TableHead className="text-right">نقش</TableHead>
                  <TableHead className="text-center">فاکتورها</TableHead>
                  <TableHead className="text-right">تاریخ ایجاد</TableHead>
                  <TableHead className="text-center">اقدامات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      کاربری یافت نشد.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell className="font-mono">
                        {user.idNumber}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "default" : "secondary"
                          }
                        >
                          {user.role === "ADMIN" ? "ادمین" : "کاربر"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {(userInvoices.length || 0).toLocaleString("fa-IR")}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>اقدامات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => fetchUserDetails(user.id)}
                              className="flex cursor-pointer items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              <span>مشاهده جزئیات</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex cursor-pointer items-center gap-2 text-red-600"
                            >
                              <Trash className="h-4 w-4" />
                              <span>حذف</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* ------------------ END: DESKTOP VIEW (TABLE) ------------------ */}

          {/* ------------------ START: MOBILE VIEW (LIST OF CARDS) ------------------ */}
          {/* This list is only visible on small screens (up to md) */}
          <div className="block border-t md:hidden">
            {users.length === 0 ? (
              <p className="text-muted-foreground p-8 text-center">
                کاربری یافت نشد.
              </p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="border-b">
                  {/* Card Header: Name and Actions */}
                  <div className="flex items-center justify-between p-4">
                    <span className="font-semibold">{user.name}</span>
                    <DropdownMenu dir="rtl">
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>اقدامات</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => fetchUserDetails(user.id)}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          <span>مشاهده جزئیات</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex cursor-pointer items-center gap-2 text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                          <span>حذف</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Card Body: Details in a grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 pb-4 text-sm">
                    <div className="text-muted-foreground">نام کاربری</div>
                    <div>{user.username}</div>

                    <div className="text-muted-foreground">شماره شناسایی</div>
                    <div className="font-mono">{user.idNumber}</div>

                    <div className="text-muted-foreground">نقش</div>
                    <div>
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role === "ADMIN" ? "ادمین" : "کاربر"}
                      </Badge>
                    </div>

                    <div className="text-muted-foreground">فاکتورها</div>
                    <div>
                      {(userInvoices.length || 0).toLocaleString("fa-IR")}
                    </div>
                  </div>

                  {/* Card Footer: Creation Date */}
                  <div className="bg-muted/50 text-muted-foreground px-4 py-2 text-xs">
                    عضویت در: {formatDate(user.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className={"text-right sm:max-w-4xl"} dir="rtl">
          <DialogHeader>
            <DialogTitle>اطلاعات کاربر</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="w-full space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p>
                    <strong>نام:</strong> {selectedUser.name}
                  </p>
                  <p>
                    <strong>نام کاربری:</strong> {selectedUser.username}
                  </p>
                  <p>
                    <strong>نقش:</strong>{" "}
                    <Badge
                      variant={
                        selectedUser.role === "ADMIN" ? "default" : "secondary"
                      }
                    >
                      {selectedUser.role === "ADMIN" ? "ادمین" : "کاربر"}
                    </Badge>
                  </p>
                  <p>
                    <strong>تاریخ ایجاد:</strong>{" "}
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">
                  فاکتورها ({userInvoices.length.toLocaleString("fa-IR")})
                </h3>
                {userInvoices.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">
                    فاکتوری یافت نشد.
                  </p>
                ) : (
                  <ScrollArea className={"h-[300px] w-full"}>
                    <Table dir="rtl">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            شماره فاکتور
                          </TableHead>
                          <TableHead className="text-right">مبلغ کل</TableHead>
                          <TableHead className="text-right">CC</TableHead>
                          <TableHead className="text-right">
                            تاریخ ایجاد
                          </TableHead>
                          <TableHead className="text-center">اقدامات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-mono">
                              {invoice.invoiceNumber}
                            </TableCell>
                            <TableCell className="text-right">
                              {invoice.total.toLocaleString("fa-IR")} تومان
                            </TableCell>
                            <TableCell className="text-right">
                              {invoice.totalCC.toLocaleString("fa-IR", {
                                minimumFractionDigits: 3,
                              })}
                            </TableCell>
                            <TableCell>
                              {formatDate(invoice.createdAt)}
                            </TableCell>
                            <TableCell className="text-center">
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
                  </ScrollArea>
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

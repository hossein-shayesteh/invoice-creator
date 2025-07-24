"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogOut, User } from "lucide-react";
import { useSession } from "next-auth/react";

import { handleSignOut } from "@/lib/auth-services";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserButton = () => {
  const session = useSession();
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");
  const isAuth =
    session.data?.user.role === "ADMIN" ||
    session.data?.user.role === "MODERATOR";

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary">
              {session.data?.user.name?.charAt(0).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>حساب من</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAuth && (
          <Link href={isDashboard ? "/admin" : "/dashboard"}>
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>{isDashboard ? "داشبورد ادمین" : "صفحه اصلی"}</span>
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>خروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import db from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  debug: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.idNumber = user.idNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.username = token.username as string;
        session.user.idNumber = token.idNumber as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        if (
          typeof credentials.username !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        try {
          console.log("🔍 Looking for user:", credentials.username);

          const user = await db.user.findUnique({
            where: { username: credentials.username.trim() },
          });

          if (!user) {
            return null;
          }

          if (!user.password) {
            return null;
          }

          const passwordIsValid = await compare(
            credentials.password,
            user.password,
          );

          if (!passwordIsValid) {
            return null;
          }

          const returnUser = {
            id: user.id,
            name: user.name,
            idNumber: user.idNumber,
            username: user.username,
            role: user.role,
          };

          return returnUser;
        } catch (error) {
          console.error("💥 Authorize - Database Error:", error);
          return null;
        }
      },
    }),
  ],
});

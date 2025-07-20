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
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.idNumber = user.idNumber;
      }
      // Handle session updates
      else if (trigger === "update" && session?.user) {
        token = { ...token, ...session.user };
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

        try {
          const user = await db.user.findUnique({
            where: { username: credentials.username.toString().trim() },
          });

          if (!user || !user.password) return null;

          const passwordIsValid = await compare(
            credentials.password.toString(),
            user.password,
          );

          if (!passwordIsValid) return null;

          return {
            id: user.id,
            name: user.name,
            idNumber: user.idNumber,
            username: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
});

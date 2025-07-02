import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import db from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // adapter: MongoDBAdapter(mongoClient),
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  debug: process.env.NODE_ENV === "development", // Enable debug logs
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }

      return token;
    },
    async session({ session, token }) {
      // Add user info from token to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.username = token.username as string;
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
        // Validate credentials exist and are strings
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
          // Check if user exists
          const user = await db.user.findUnique({
            where: { username: credentials.username },
          });

          if (!user || !user.password) {
            return null;
          }

          // Check if password is valid
          const passwordIsValid = await compare(
            credentials.password,
            user.password,
          );

          if (!passwordIsValid) return null;

          // Return user object
          return {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorize - Error:", error);
          return null;
        }
      },
    }),
  ],
});

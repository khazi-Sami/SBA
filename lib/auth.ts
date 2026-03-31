import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { getPrisma } from "@/lib/prisma";

type AppRole = "ADMIN" | "TEACHER" | "STUDENT";

function isAppRole(value: unknown): value is AppRole {
  return value === "ADMIN" || value === "TEACHER" || value === "STUDENT";
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const prisma = getPrisma();
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const role = (user as { role?: unknown }).role;
        if (isAppRole(role)) {
          token.role = role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (isAppRole(token.role)) {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
};

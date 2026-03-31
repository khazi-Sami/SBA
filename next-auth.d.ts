import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "ADMIN" | "TEACHER" | "STUDENT";
    };
  }

  interface User {
    id: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "TEACHER" | "STUDENT";
  }
}

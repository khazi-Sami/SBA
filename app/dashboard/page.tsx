import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <p>Welcome {session.user?.email}</p>
    </div>
  );
}
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CalendarScreen } from "./CalendarScreen";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  return <CalendarScreen />;
}

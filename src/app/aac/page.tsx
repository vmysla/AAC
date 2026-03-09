import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AACScreen } from "./AACScreen";

export default async function AACPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  return <AACScreen />;
}

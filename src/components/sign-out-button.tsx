"use client";

import { useRouter } from "next/navigation";
import { IconLogOut } from "@/components/icons";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="btn btn-ghost inline-flex items-center gap-1.5"
    >
      <IconLogOut size={15} />
      Sign out
    </button>
  );
}

import { redirect } from "next/navigation";

// R4 — Available listings is the default tab after login. Unauthenticated
// visitors never reach here (proxy redirects "/" to "/login" first).
export default function RootPage() {
  redirect("/listings");
}

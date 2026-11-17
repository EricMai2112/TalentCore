import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
        if (payload.role === "EMPLOYEE") {
          redirect("/interviews");
        }
      }
    } catch {
      // fallback to dashboard
    }
  }

  redirect("/dashboard");
}

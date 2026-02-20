import { cookies } from "next/headers";

export async function getUserId() {
  const userId = cookies().get("login")?.value;
  return userId;
}

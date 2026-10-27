import { redirect } from "next/navigation";

// Temporary: send the homepage to the roster until the real Home page exists.
export default function Home() {
  redirect("/roster");
}

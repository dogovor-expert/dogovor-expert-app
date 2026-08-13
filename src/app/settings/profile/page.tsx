import { redirect } from "next/navigation";

export default function OldProfileSettingsPage() {
  redirect("/settings?tab=profile");
}
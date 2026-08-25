"use client";
import { VaultProvider } from "@/lib/vault/VaultProvider";

export default function VaultWrapper({ children }: { children: React.ReactNode }) {
  return <VaultProvider>{children}</VaultProvider>;
}
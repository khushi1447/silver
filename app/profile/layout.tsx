import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "My account",
  description: "Manage your profile and saved addresses.",
  robots: { index: false, follow: true },
}

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children
}

import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/ui/Toast"

export const metadata: Metadata = {
  title: "CRM EQUILATERA",
  description: "CRM Comercial Interno — EQUILATERA",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}

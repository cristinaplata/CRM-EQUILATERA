import type { NextAuthConfig } from "next-auth"
import Resend from "next-auth/providers/resend"

// Lightweight config — no Prisma, compatible with Edge Runtime (middleware)
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "CRM EQUILATERA <noreply@equilatera.com.co>",
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
  },
}

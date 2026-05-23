import Image from "next/image"
import { signIn } from "@/lib/auth"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-modal p-8 w-full max-w-sm border border-border">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo-equilatera.png"
            alt="EQUILATERA"
            width={180}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="font-heading text-h2 text-text-primary text-center mb-2">Iniciar sesión</h1>
        <p className="text-body text-text-muted text-center mb-6">
          Te enviaremos un enlace de acceso a tu correo.
        </p>

        <form
          action={async (formData: FormData) => {
            "use server"
            const email = formData.get("email") as string
            await signIn("resend", { email, redirectTo: "/pipeline" })
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="email" className="block text-label text-text-muted mb-1">
              Correo corporativo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="tu@equilatera.com.co"
              className="w-full h-10 px-3 rounded-md border border-border bg-surface text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoComplete="email"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full h-10 rounded-md bg-primary text-white font-body text-button font-semibold hover:bg-primary-hover transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Enviar enlace de acceso
          </button>
        </form>
      </div>
    </div>
  )
}

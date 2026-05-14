import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-modal p-8 w-full max-w-sm border border-border">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <polygon points="24,4 44,40 4,40" fill="none" stroke="#0057FF" strokeWidth="3" />
            <polygon points="24,14 38,38 10,38" fill="none" stroke="#A200FF" strokeWidth="2" />
            <polygon points="24,24 33,38 15,38" fill="#2ECC71" opacity="0.5" />
          </svg>
          <div>
            <p className="font-heading font-bold text-[20px] text-text-primary leading-none">EQUILATERA</p>
            <p className="text-caption text-text-muted">CRM Comercial</p>
          </div>
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

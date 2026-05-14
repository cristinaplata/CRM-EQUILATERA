import Link from "next/link"

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-modal p-8 w-full max-w-sm border border-border text-center">
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
        <h1 className="font-heading text-h2 text-text-primary mb-2">Revisa tu correo</h1>
        <p className="text-body text-text-muted mb-6">
          Enviamos un enlace de acceso. Haz clic en él para entrar al CRM.
        </p>
        <Link href="/login" className="text-label text-primary hover:underline">
          ← Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}

import { Interaction, User } from "@prisma/client"
import { AvatarChip } from "@/components/ui/AvatarChip"
import { InteractionTypeChip } from "./InteractionTypeChip"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { EmptyState } from "@/components/ui/EmptyState"

type InteractionWithAuthor = Interaction & {
  author: Pick<User, "id" | "name" | "email">
}

export function InteractionTimeline({ interactions }: { interactions: InteractionWithAuthor[] }) {
  if (interactions.length === 0) {
    return (
      <EmptyState
        title="Sin interacciones"
        description="Registra el primer contacto →"
        className="py-8"
      />
    )
  }

  return (
    <ol className="relative pl-5 border-l border-border space-y-5">
      {interactions.map((i) => (
        <li key={i.id} className="relative">
          <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-border border-2 border-surface" />
          <div className="flex items-start gap-3">
            <AvatarChip name={i.author.name ?? i.author.email} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <InteractionTypeChip type={i.type} />
                <span className="text-caption text-text-muted">
                  {format(new Date(i.interactionDate), "d MMM yyyy", { locale: es })}
                </span>
                <span className="text-caption text-text-muted">·</span>
                <span className="text-caption text-text-muted">{i.author.name ?? i.author.email}</span>
              </div>
              {i.note && <p className="text-body text-text-primary whitespace-pre-wrap">{i.note}</p>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

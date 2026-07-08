"use client";

import { toggleLinkActive, deleteLink } from "@/app/actions/links";
import { CopyLinkButton } from "@/components/copy-link-button";

export function LinkRow({
  link,
}: {
  link: {
    id: string;
    code: string;
    description: string;
    amountLabel: string;
    active: boolean;
    usedAt: string | null;
  };
}) {
  return (
    <div className="table-row p-4 flex items-center justify-between text-sm gap-3">
      <div>
        <div className="font-medium">{link.description}</div>
        <div style={{ color: "var(--text-tertiary)" }}>
          /pagar/{link.code} — {link.amountLabel}
          {link.usedAt ? " — usado" : ""}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <CopyLinkButton path={`/pagar/${link.code}`} />
        <button
          type="button"
          onClick={() => toggleLinkActive(link.id)}
          className="btn btn-secondary text-xs"
        >
          {link.active ? "Desativar" : "Ativar"}
        </button>
        <button
          type="button"
          onClick={() => deleteLink(link.id)}
          className="btn text-xs"
          style={{ color: "var(--red)" }}
        >
          Excluir
        </button>
      </div>
    </div>
  );
}

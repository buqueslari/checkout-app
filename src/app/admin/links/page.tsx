import { prisma } from "@/lib/prisma";
import { getSettings, formatMoney } from "@/lib/settings";
import { NewLinkForm } from "./new-link-form";
import { LinkRow } from "./link-row";

export default async function AdminLinksPage() {
  const [links, settings] = await Promise.all([
    prisma.paymentLink.findMany({ orderBy: { createdAt: "desc" } }),
    getSettings(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Links avulsos</h1>
      <NewLinkForm />

      <div className="glass-panel overflow-hidden max-w-2xl">
        {links.length === 0 ? (
          <div className="p-5 text-sm" style={{ color: "var(--text-tertiary)" }}>
            Nenhum link gerado ainda.
          </div>
        ) : (
          links.map((link) => (
            <LinkRow
              key={link.id}
              link={{
                id: link.id,
                code: link.code,
                description: link.description,
                amountLabel: formatMoney(link.amountCents, settings.currency),
                active: link.active,
                usedAt: link.usedAt ? link.usedAt.toISOString() : null,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

import { getClientsWithStatus } from "@/lib/data";
import { AddClientAdminForm } from "../AddClientAdminForm";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await getClientsWithStatus();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">Clients</h1>
        <p className="mt-1 text-sm text-muted">Every client account and whether their portal login is linked.</p>
      </div>

      <AddClientAdminForm />

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface px-8 py-16 text-center">
          <p className="text-sm font-medium text-foreground">No clients yet</p>
          <p className="mt-1 text-sm text-subtle">Add one above to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background text-xs font-medium uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Contact Email</th>
                  <th className="px-5 py-3 font-medium">Portal Login</th>
                  <th className="px-5 py-3 text-right font-medium">Domains</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => (
                  <tr key={client.id} className="transition-colors hover:bg-background">
                    <td className="px-5 py-3.5 font-medium text-foreground">{client.name}</td>
                    <td className="px-5 py-3.5 text-muted">{client.contactEmail ?? <span className="text-subtle">—</span>}</td>
                    <td className="px-5 py-3.5">
                      {client.isLinked ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          Linked
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          Not yet linked
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted">{client.domainCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

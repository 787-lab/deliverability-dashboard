import Link from "next/link";
import { getAllDomains, getClients } from "@/lib/data";
import { AddDomainAdminForm } from "../AddDomainAdminForm";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export default async function DomainsPage() {
  const [domains, clients] = await Promise.all([getAllDomains(), getClients()]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">Domains</h1>
        <p className="mt-1 text-sm text-muted">Every connected domain and its verification state.</p>
      </div>

      {clients.length > 0 && <AddDomainAdminForm clients={clients} />}

      {domains.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface px-8 py-16 text-center">
          <p className="text-sm font-medium text-foreground">No domains yet</p>
          <p className="mt-1 text-sm text-subtle">Add one above to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background text-xs font-medium uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Domain</th>
                  <th className="px-5 py-3 font-medium">Verified</th>
                  <th className="px-5 py-3 font-medium">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {domains.map((domain) => (
                  <tr key={domain.id} className="transition-colors hover:bg-background">
                    <td className="px-5 py-3.5 text-muted">{domain.clientName}</td>
                    <td className="px-5 py-3.5 font-medium">
                      <Link
                        href={`/admin/domains/${domain.id}`}
                        className="text-foreground hover:text-accent hover:underline underline-offset-2"
                      >
                        {domain.domainName}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      {domain.isVerified ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted">{formatDate(domain.createdAt)}</td>
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

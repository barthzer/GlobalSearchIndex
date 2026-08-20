"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ModalPortal from "@/components/ModalPortal";
import Button from "@/components/Button";
import AnalysesHealth from "@/components/AnalysesHealth";
import { apiFetch, hasStaffSession } from "@/lib/api";
import { useAccount } from "@/components/AccountProvider";

/**
 * Administration des utilisateurs (admin only).
 *
 * Garde d'accès : redirige vers /login si la session n'est pas admin (le rôle
 * vient du JWT réel via AccountProvider). Toute la communication passe par
 * apiFetch (Bearer + refresh gérés dans lib/api) — aucune logique JWT ici.
 *
 * Contrat serveur (apps/api AdminController) :
 *  - GET    /admin/users              → { data, total, page, limit }
 *  - POST   /admin/users              → { email, password, name, role? }
 *  - PUT    /admin/users/:id          → { email?, name?, role?, newPassword? }
 *  - DELETE /admin/users/:id
 *  - POST   /admin/users/:id/reset-password → { sent, error? }
 *  - GET    /admin/export-projects    → CSV (téléchargement)
 */

const inputClass =
  "h-11 w-full rounded-xl border bg-input-bg px-4 text-[14px] font-light text-text-primary placeholder:text-text-input outline-none transition-colors duration-200 border-border-subtle focus:border-accent-pink/40";

type Role = "commercial" | "admin";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

interface UsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminPage() {
  const { isAdmin, hydrated } = useAccount();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<"users" | "health">("users");

  // Modales / actions courantes.
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  // Statut du lien de réinitialisation, par utilisateur (id → statut d'envoi).
  const [resetStatus, setResetStatus] = useState<
    Record<string, { state: "sending" | "sent" | "error"; message?: string }>
  >({});

  // Garde d'accès : non-admin. STAFF non-admin (commercial) → /login ; tout le reste,
  // dont un prospect (aucun token staff, même expiré) → funnel, jamais la boucle vers
  // /connexion-admin (racine du leak Alexis/Ben 2026-08-20). On attend l'hydratation.
  useEffect(() => {
    if (!hydrated || isAdmin) return;
    router.replace(hasStaffSession() ? "/login" : "/");
  }, [hydrated, isAdmin, router]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const qs = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
      const res = await apiFetch(`/admin/users${qs}`);
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as UsersResponse;
      setUsers(body.data ?? []);
    } catch {
      setLoadError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Chargement initial + rechargement quand la session admin est confirmée.
  useEffect(() => {
    if (hydrated && isAdmin) void loadUsers();
  }, [hydrated, isAdmin, loadUsers]);

  // Envoie un lien de réinitialisation et affiche le statut { sent, error }
  // renvoyé par le serveur (le mot de passe ne transite jamais en clair).
  async function handleSendResetLink(user: AdminUser) {
    setResetStatus((s) => ({ ...s, [user.id]: { state: "sending" } }));
    try {
      const res = await apiFetch(`/admin/users/${user.id}/reset-password`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { sent: boolean; error?: string };
      setResetStatus((s) => ({
        ...s,
        [user.id]: body.sent
          ? { state: "sent" }
          : { state: "error", message: body.error ?? "Envoi impossible." },
      }));
    } catch {
      setResetStatus((s) => ({
        ...s,
        [user.id]: { state: "error", message: "Envoi impossible." },
      }));
    }
  }

  // Export CSV des projets : GET authentifié → blob → téléchargement navigateur.
  async function handleExport() {
    try {
      const res = await apiFetch("/admin/export-projects");
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gsi-projects-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setLoadError("Export impossible pour le moment.");
    }
  }

  // Session non encore restaurée ou non-admin (l'effet redirige) : rien à rendre.
  if (!hydrated || !isAdmin) return null;

  return (
    <main className="min-h-[100dvh] bg-bg-primary px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* En-tête */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-medium tracking-[-0.4px] text-text-primary">
              Utilisateurs
            </h1>
            <p className="mt-1 text-[14px] font-extralight text-text-secondary">
              Gérez les comptes commerciaux et administrateurs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="tertiary" onClick={handleExport}>
              Exporter les projets (CSV)
            </Button>
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              Nouvel utilisateur
            </Button>
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-6 flex gap-2 border-b border-border-subtle">
          {(["users", "health"] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setSection(sec)}
              className={`px-4 py-2 text-[14px] font-medium transition-colors ${
                section === sec
                  ? "border-b-2 border-accent-pink text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {sec === "users" ? "Utilisateurs" : "Santé des analyses"}
            </button>
          ))}
        </div>

        {section === "health" && <AnalysesHealth />}
        {section === "users" && (
        <>

        {/* Recherche */}
        <div className="mb-4 max-w-sm">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email…"
            className={inputClass}
          />
        </div>

        {loadError && (
          <p className="mb-4 text-[13px] font-light text-red-400">{loadError}</p>
        )}

        {/* Table des utilisateurs */}
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-border-subtle text-[12px] font-medium uppercase tracking-wide text-text-muted">
                  <th className="px-5 py-3.5">Nom</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Rôle</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-text-muted">
                      Chargement…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-text-muted">
                      Aucun utilisateur.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const status = resetStatus[user.id];
                    return (
                      <tr
                        key={user.id}
                        className="border-b border-border-subtle/60 last:border-0 transition-colors hover:bg-bg-card-hover"
                      >
                        <td className="px-5 py-4 font-light text-text-primary">{user.name}</td>
                        <td className="px-5 py-4 font-light text-text-secondary">{user.email}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${
                              user.role === "admin"
                                ? "border-accent-pink/30 bg-accent-pink/10 text-accent-pink"
                                : "border-border-subtle bg-card-inner-bg text-text-secondary"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "Commercial"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditUser(user)}
                              className="rounded-lg border border-border-subtle bg-card-inner-bg px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-border-badge hover:text-text-primary"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendResetLink(user)}
                              disabled={status?.state === "sending"}
                              className="rounded-lg border border-border-subtle bg-card-inner-bg px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-border-badge hover:text-text-primary disabled:opacity-50"
                            >
                              {status?.state === "sending" ? "Envoi…" : "Lien MDP"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteUser(user)}
                              className="rounded-lg border border-red-400/30 bg-red-500/[0.06] px-3 py-1.5 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/[0.12]"
                            >
                              Supprimer
                            </button>
                          </div>
                          {/* Statut du lien de réinitialisation (visible après envoi). */}
                          {status?.state === "sent" && (
                            <p className="mt-1.5 text-right text-[12px] font-light text-emerald-400">
                              Lien de réinitialisation envoyé.
                            </p>
                          )}
                          {status?.state === "error" && (
                            <p className="mt-1.5 text-right text-[12px] font-light text-red-400">
                              {status.message}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>

      {createOpen && (
        <UserFormModal
          mode="create"
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            void loadUsers();
          }}
        />
      )}

      {editUser && (
        <UserFormModal
          mode="edit"
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => {
            setEditUser(null);
            void loadUsers();
          }}
        />
      )}

      {deleteUser && (
        <DeleteConfirmModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={() => {
            setDeleteUser(null);
            void loadUsers();
          }}
        />
      )}
    </main>
  );
}

/* ─────────────────────────── Modale créer / éditer ─────────────────────────── */

interface UserFormModalProps {
  mode: "create" | "edit";
  user?: AdminUser;
  onClose: () => void;
  onSaved: () => void;
}

const modalShell =
  "relative w-full max-w-[440px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-2";
const modalInner =
  "relative overflow-hidden rounded-[calc(2rem-0.5rem)] border border-border-subtle bg-modal-bg p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]";

function UserFormModal({ mode, user, onClose, onSaved }: UserFormModalProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<Role>(user?.role ?? "commercial");
  const [password, setPassword] = useState(""); // création : requis ; édition : reset optionnel
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    // Validation minimale alignée sur les DTOs serveur.
    if (name.trim().length < 2) {
      setError("Le nom doit contenir au moins 2 caractères.");
      return;
    }
    if (mode === "create" && password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (mode === "edit" && password && password.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      let res: Response;
      if (mode === "create") {
        res = await apiFetch("/admin/users", {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim(),
            role,
            password,
          }),
        });
      } else {
        // Édition : on n'envoie que les champs modifiables ; newPassword seulement
        // s'il a été saisi (sinon le mot de passe reste inchangé côté serveur).
        res = await apiFetch(`/admin/users/${user!.id}`, {
          method: "PUT",
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim(),
            role,
            ...(password ? { newPassword: password } : {}),
          }),
        });
      }
      if (!res.ok) {
        // Le serveur renvoie un message métier (email déjà pris, dernier admin…)
        // que l'on affiche tel quel quand il est disponible.
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(
          body?.message ??
            (mode === "create"
              ? "Création impossible."
              : "Modification impossible."),
        );
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opération impossible.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md" onClick={onClose} />
        <div className={modalShell}>
          <div
            className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-30"
            style={{
              background:
                "conic-gradient(from 220deg, transparent 50%, rgba(95,20,251,0.2) 70%, rgba(236,77,203,0.2) 85%, transparent 100%)",
            }}
          />
          <div className={modalInner}>
            <div className="relative mb-6 text-center">
              <h2 className="text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                {mode === "create" ? "Nouvel utilisateur" : "Modifier l'utilisateur"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
                placeholder="Nom complet"
                className={inputClass}
              />
              <input
                type="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                placeholder="Email"
                className={inputClass}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className={inputClass}
              >
                <option value="commercial">Commercial</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                placeholder={
                  mode === "create"
                    ? "Mot de passe"
                    : "Nouveau mot de passe (laisser vide pour ne pas changer)"
                }
                className={inputClass}
              />

              {error && <p className="text-[12px] font-light text-red-400">{error}</p>}

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-border-subtle bg-card-inner-bg py-3 text-[13px] font-medium text-text-secondary transition-colors hover:border-border-badge hover:text-text-primary"
                >
                  Annuler
                </button>
                <div className="flex-1">
                  <Button variant="primary" fullWidth type="submit" disabled={submitting}>
                    {submitting ? "Enregistrement…" : mode === "create" ? "Créer" : "Enregistrer"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ─────────────────────────── Modale confirmation suppression ─────────────────────────── */

interface DeleteConfirmModalProps {
  user: AdminUser;
  onClose: () => void;
  onDeleted: () => void;
}

function DeleteConfirmModal({ user, onClose, onDeleted }: DeleteConfirmModalProps) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await apiFetch(`/admin/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        // Le serveur bloque avec un message (compte possédant des projets,
        // suppression de soi-même…) que l'on affiche tel quel.
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "Suppression impossible.");
      }
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
      setSubmitting(false);
    }
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md" onClick={onClose} />
        <div className={modalShell}>
          <div className={modalInner}>
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-400/30 bg-red-500/[0.08]">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h2 className="text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                Supprimer l&apos;utilisateur
              </h2>
              <p className="mt-2 text-[14px] font-light leading-relaxed text-text-secondary">
                Supprimer définitivement <span className="text-text-primary">{user.name}</span>{" "}
                ({user.email}) ? Cette action est irréversible.
              </p>

              {error && <p className="mt-3 text-[12px] font-light text-red-400">{error}</p>}

              <div className="mt-6 flex w-full gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-border-subtle bg-card-inner-bg py-3 text-[13px] font-medium text-text-secondary transition-colors hover:border-border-badge hover:text-text-primary"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 rounded-full border border-red-400/40 bg-red-500/[0.12] py-3 text-[13px] font-medium text-red-300 transition-colors hover:bg-red-500/[0.2] disabled:opacity-50"
                >
                  {submitting ? "Suppression…" : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

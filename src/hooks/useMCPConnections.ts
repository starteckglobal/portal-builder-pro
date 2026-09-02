import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AuthType } from "@/lib/composioCatalog";

export interface MCPConnection {
  id: string;
  toolkit_slug: string;
  toolkit_name: string;
  auth_type: AuthType | string;
  label: string | null;
  status: string;
  credential_hint: string | null;
  created_at: string;
}

const LS_KEY = "abm.mcp.connections";

const readLocal = (): MCPConnection[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as MCPConnection[]) : [];
  } catch {
    return [];
  }
};
const writeLocal = (rows: MCPConnection[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
  } catch {}
};

/**
 * Connections persist to the backend `mcp_connections` table when it exists,
 * and fall back to this browser for local persistence otherwise.
 */
export function useMCPConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<MCPConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [localOnly, setLocalOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("mcp_connections")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setLocalOnly(true);
      setConnections(readLocal());
    } else {
      setLocalOnly(false);
      setConnections((data ?? []) as MCPConnection[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const connect = useCallback(
    async (input: {
      toolkit_slug: string;
      toolkit_name: string;
      auth_type: string;
      label?: string;
      secret?: string;
    }) => {
      const hint = input.secret
        ? `${"•".repeat(Math.max(0, Math.min(12, input.secret.length - 4)))}${input.secret.slice(-4)}`
        : null;
      const row: MCPConnection = {
        id: crypto.randomUUID(),
        toolkit_slug: input.toolkit_slug,
        toolkit_name: input.toolkit_name,
        auth_type: input.auth_type,
        label: input.label || null,
        status: "connected",
        credential_hint: hint,
        created_at: new Date().toISOString(),
      };
      if (!localOnly && user) {
        const { error } = await (supabase as any).from("mcp_connections").upsert(
          {
            user_id: user.id,
            toolkit_slug: row.toolkit_slug,
            toolkit_name: row.toolkit_name,
            auth_type: row.auth_type,
            label: row.label,
            status: row.status,
            credential_hint: row.credential_hint,
          },
          { onConflict: "user_id,toolkit_slug" },
        );
        if (!error) {
          await load();
          return { ok: true as const };
        }
        setLocalOnly(true);
      }
      const next = [row, ...readLocal().filter((c) => c.toolkit_slug !== row.toolkit_slug)];
      writeLocal(next);
      setConnections(next);
      return { ok: true as const };
    },
    [load, localOnly, user],
  );

  const disconnect = useCallback(
    async (slug: string) => {
      if (!localOnly && user) {
        const { error } = await (supabase as any)
          .from("mcp_connections")
          .delete()
          .eq("user_id", user.id)
          .eq("toolkit_slug", slug);
        if (!error) {
          await load();
          return;
        }
        setLocalOnly(true);
      }
      const next = readLocal().filter((c) => c.toolkit_slug !== slug);
      writeLocal(next);
      setConnections(next);
    },
    [load, localOnly, user],
  );

  return { connections, loading, localOnly, connect, disconnect, reload: load };
}

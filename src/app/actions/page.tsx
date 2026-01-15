"use client";

import { useState } from "react";

type SyncResult = {
  success: boolean;
  fetched?: number;
  inserted?: number;
  error?: string;
};

export default function ActionsPage() {
  const [loading, setLoading] = useState<null | "contacts" | "tasks" | "all">(
    null
  );
  const [result, setResult] = useState<SyncResult | null>(null);

  async function run(action: "contacts" | "tasks" | "all") {
    try {
      setLoading(action);
      setResult(null);

      let response: Response | null = null;
      let data: any = null;

      if (action === "contacts") {
        response = await fetch("/api/ghl/sync-contacts", {
          method: "POST",
        });
        data = await response.json();
      }

      if (action === "tasks") {
        response = await fetch("/api/ghl/sync-tasks", {
          method: "POST",
        });
        data = await response.json();
      }

      if (action === "all") {
        const contactsRes = await fetch("/api/ghl/sync-contacts", {
          method: "POST",
        });
        const contactsData = await contactsRes.json();

        const tasksRes = await fetch("/api/ghl/sync-tasks", {
          method: "POST",
        });
        const tasksData = await tasksRes.json();

        data = {
          success: true,
          contacts: contactsData,
          tasks: tasksData,
        };
      }

      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 800 }}>
      <h1>Actions</h1>
      <p>Manual sync controls for GoHighLevel</p>

      {/* BOTONES */}
      <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
        <button onClick={() => run("contacts")} disabled={!!loading}>
          {loading === "contacts" ? "Syncing contacts..." : "Sync Contacts"}
        </button>

        <button onClick={() => run("tasks")} disabled={!!loading}>
          {loading === "tasks" ? "Syncing tasks..." : "Sync Tasks"}
        </button>

        <button onClick={() => run("all")} disabled={!!loading}>
          {loading === "all" ? "Syncing all..." : "Sync All"}
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ marginTop: 24 }}>
          <p>⏳ Sync in progress… this may take a few minutes.</p>
          <progress style={{ width: "100%" }} />
        </div>
      )}

      {/* RESULTADO */}
      {result && (
        <div style={{ marginTop: 24 }}>
          <h3>Result</h3>
          <pre
            style={{
              background: "#111",
              color: "#0f0",
              padding: 16,
              borderRadius: 6,
              overflow: "auto",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

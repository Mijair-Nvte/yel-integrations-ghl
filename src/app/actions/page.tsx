"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type SyncResult = {
  success: boolean;
  fetched?: number;
  inserted?: number;
  error?: string;
  contacts?: any;
  tasks?: any;
};

export default function ActionsPage() {
  const [loading, setLoading] = useState<null | "contacts" | "tasks" | "all">(null);
  const [result, setResult] = useState<SyncResult | null>(null);

  async function run(action: "contacts" | "tasks" | "all") {
    try {
      setLoading(action);
      setResult(null);

      let data: any = null;

      if (action === "contacts") {
        const res = await fetch("/api/ghl/sync-contacts", { method: "POST" });
        data = await res.json();
      }

      if (action === "tasks") {
        const res = await fetch("/api/ghl/sync-tasks", { method: "POST" });
        data = await res.json();
      }

      if (action === "all") {
        const contactsRes = await fetch("/api/ghl/sync-contacts", { method: "POST" });
        const tasksRes = await fetch("/api/ghl/sync-tasks", { method: "POST" });

        data = {
          success: true,
          contacts: await contactsRes.json(),
          tasks: await tasksRes.json(),
        };
      }

      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* HEADER */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Acciones de Sincronización</CardTitle>
          <CardDescription>
            Controles manuales para sincronizar contactos y tareas desde GoHighLevel
          </CardDescription>
        </CardHeader>
      </Card>

      {/* ACTIONS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ejecutar sincronización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => run("contacts")}
              disabled={!!loading}
              variant="secondary"
            >
              {loading === "contacts" ? "Sincronizando contactos…" : "Sync Contacts"}
            </Button>

            <Button
              onClick={() => run("tasks")}
              disabled={!!loading}
              variant="secondary"
            >
              {loading === "tasks" ? "Sincronizando tareas…" : "Sync Tasks"}
            </Button>

            <Button
              onClick={() => run("all")}
              disabled={!!loading}
            >
              {loading === "all" ? "Sincronizando todo…" : "Sync All"}
            </Button>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">En progreso</Badge>
                Esto puede tardar unos minutos
              </div>
              <Progress value={70} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* RESULT */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.success ? (
              <Alert>
                <AlertTitle>✅ Sincronización completada</AlertTitle>
                <AlertDescription>
                  El proceso terminó correctamente.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>❌ Error</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}

            <Separator />

            <pre className="bg-muted rounded-md p-4 text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

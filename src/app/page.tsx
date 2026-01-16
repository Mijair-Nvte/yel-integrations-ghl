"use client";

import * as React from "react";
import { Pie, PieChart, Label, Cell } from "recharts";
import { createClient } from "@supabase/supabase-js";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* =========================
   Supabase
========================= */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* =========================
   Chart Config (Donut)
========================= */
const chartConfig = {
  total: {
    label: "Leads",
  },
  sin_tareas: {
    label: "Sin tareas",
    color: "var(--chart-3)",
  },
  con_tareas: {
    label: "Con tareas",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type SummaryRow = {
  status: "Con tareas" | "Sin tareas";
  total: number;
};

type DonutItem = {
  key: "con_tareas" | "sin_tareas";
  label: string;
  value: number;
};

export default function Page() {
  const [chartData, setChartData] = React.useState<DonutItem[]>([]);
  const [noTasks, setNoTasks] = React.useState<any[]>([]);
  const [withTasks, setWithTasks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  /* =========================
     Load data
  ========================= */
  React.useEffect(() => {
    async function load() {
      setLoading(true);

      // 📊 Summary
      const { data: summary } = await supabase
        .from("vw_tasks_summary_tx_214")
        .select("*");

      const formatted: DonutItem[] =
        summary?.map((s: SummaryRow) => ({
          key: s.status === "Con tareas" ? "con_tareas" : "sin_tareas",
          label: s.status,
          value: Number(s.total),
        })) ?? [];

      setChartData(formatted);

      // 📋 Tables
      const { data: noTasksData } = await supabase
        .from("vw_contacts_no_tasks_tx_214")
        .select("*")
        .limit(50);

      const { data: withTasksData } = await supabase
        .from("vw_contacts_with_tasks_tx_214")
        .select("*")
        .limit(50);

      setNoTasks(noTasksData ?? []);
      setWithTasks(withTasksData ?? []);
      setLoading(false);
    }

    load();
  }, []);

  /* =========================
     Derived values (FIX)
  ========================= */
  const total = chartData.reduce((acc, c) => acc + c.value, 0);

  const sinTareas = chartData.find((c) => c.key === "sin_tareas")?.value ?? 0;

  const conTareas = chartData.find((c) => c.key === "con_tareas")?.value ?? 0;

  if (loading) {
    return <div className="p-8 text-muted-foreground">Cargando dashboard…</div>;
  }

  return (
    <div className="p-6 space-y-10">
      {/* =====================
          📊 KPIs
      ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-3xl">{total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Sin tareas</CardDescription>
            <CardTitle className="text-3xl text-[var(--chart-3)]">
              {sinTareas}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Con tareas</CardDescription>
            <CardTitle className="text-3xl text-[var(--chart-1)]">
              {conTareas}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* =====================
          🍩 DONUT
      ===================== */}
      <Card>
        <CardHeader className="items-center">
          <CardTitle>Seguimiento de Leads</CardTitle>
          <CardDescription>Texas · Área 214</CardDescription>
        </CardHeader>

        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[260px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                innerRadius={70}
                strokeWidth={5}
              >
                {/* 🔥 AQUÍ ESTÁ LA MAGIA */}
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={chartConfig[entry.key].color} />
                ))}

                <Label
                  content={({ viewBox }) => {
                    if (!viewBox) return null;
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan className="fill-foreground text-3xl font-bold">
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy + 22}
                          className="fill-muted-foreground text-sm"
                        >
                          Leads
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
      {/* =====================
          📋 TABLES
      ===================== */}
      <div className="grid grid-cols-2 xl:grid-cols-2 gap-6">
        {/* SIN TAREAS */}
        <Card>
          <CardHeader>
            <CardTitle>Leads sin tareas</CardTitle>
            <CardDescription>Requieren seguimiento</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {noTasks.map((c) => (
                  <TableRow key={c.ghl_contact_id}>
                    <TableCell className="font-medium">
                      {c.contact_name}
                    </TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.state}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* CON TAREAS */}
        <Card>
          <CardHeader>
            <CardTitle>Leads con tareas</CardTitle>
            <CardDescription>Seguimiento activo</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Tareas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withTasks.map((c) => (
                  <TableRow key={c.ghl_contact_id}>
                    <TableCell className="font-medium">
                      {c.contact_name}
                    </TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>
                      <Badge>{c.task_count}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

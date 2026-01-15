import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { ghlFetch } from "@/app/lib/ghl";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST() {
  try {
    console.log("🚀 TASK SYNC STARTED");

    // 1️⃣ Traemos contactos desde Supabase
    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("ghl_contact_id");

    if (error) throw error;
    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ success: true, inserted: 0 });
    }

    let totalTasksInserted = 0;
    let contactIndex = 1;

    for (const contact of contacts) {
      const contactId = contact.ghl_contact_id;

      console.log(
        `📞 Contact ${contactIndex}/${contacts.length} → ${contactId}`
      );

      try {
        const data = await ghlFetch(`/contacts/${contactId}/tasks`);
        const tasks = data.tasks ?? [];

        if (tasks.length === 0) {
          contactIndex++;
          continue;
        }

        const payload = tasks.map((t: any) => ({
          ghl_task_id: t.id,
          ghl_contact_id: t.contactId,
          title: t.title,
          body: t.body,
          assigned_to: t.assignedTo,
          due_date: t.dueDate,
          completed: t.completed,
        }));

        const { error: insertError } = await supabase
          .from("tasks")
          .upsert(payload, { onConflict: "ghl_task_id" });

        if (insertError) throw insertError;

        totalTasksInserted += payload.length;
        console.log(
          `✅ Tasks inserted: ${payload.length} | Total: ${totalTasksInserted}`
        );
      } catch (taskError) {
        console.error(
          `⚠️ Failed tasks for contact ${contactId}`,
          taskError
        );
      }

      // 🧊 Pausa cada contacto (muy importante)
      await sleep(300);

      // 🧊 Pausa más grande cada 20 contactos
      if (contactIndex % 20 === 0) {
        console.log("⏸️ Cooling down (1s)");
        await sleep(1000);
      }

      contactIndex++;
    }

    console.log("🎉 TASK SYNC FINISHED");

    return NextResponse.json({
      success: true,
      inserted: totalTasksInserted,
    });
  } catch (error: any) {
    console.error("❌ TASK SYNC FAILED:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

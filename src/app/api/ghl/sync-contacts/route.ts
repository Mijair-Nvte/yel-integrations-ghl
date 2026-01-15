import { NextResponse } from "next/server";
import { ghlFetch } from "@/app/lib/ghl";
import { supabase } from "@/app/lib/supabase";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST() {
  try {
    let startAfter: number | null = null;
    let startAfterId: string | null = null;
    let totalFetched = 0;
    let totalInserted = 0;
    let page = 1;

    do {
      const query = new URLSearchParams({
        locationId: process.env.GHL_LOCATION_ID!,
        limit: "100",
      });

      if (startAfter && startAfterId) {
        query.append("startAfter", String(startAfter));
        query.append("startAfterId", startAfterId);
      }

      const data = await ghlFetch(`/contacts?${query.toString()}`);
      const contacts = data.contacts ?? [];

      console.log(`📄 Page ${page} | Fetched: ${contacts.length}`);

      if (contacts.length === 0) break;

      const payload = contacts.map((c: any) => ({
        ghl_contact_id: c.id,
        location_id: c.locationId,
        contact_name: c.contactName,
        first_name: c.firstName,
        last_name: c.lastName,
        email: c.email,
        phone: c.phone,
        city: c.city,
        state: c.state,
        country: c.country,
        source: c.source,
        assigned_to: c.assignedTo,
        contact_type: c.type,
        dnd: c.dnd,
        ghl_date_added: c.dateAdded,
        ghl_date_updated: c.dateUpdated,
      }));

      const { error } = await supabase
        .from("contacts")
        .upsert(payload, { onConflict: "ghl_contact_id" });

      if (error) throw error;

      totalFetched += contacts.length;
      totalInserted += payload.length;

      console.log(`✅ Inserted | Total: ${totalInserted}`);

      startAfter = data.meta?.startAfter ?? null;
      startAfterId = data.meta?.startAfterId ?? null;

      // 🧊 PAUSA CADA 5 PÁGINAS
      if (page % 5 === 0) {
        console.log("⏸️ Cooling down (1s)");
        await sleep(1000);
      }

      page++;
    } while (startAfter && startAfterId);

    console.log("🎉 SYNC FINISHED");
    return NextResponse.json({
      success: true,
      fetched: totalFetched,
      inserted: totalInserted,
    });
  } catch (error: any) {
    console.error("❌ SYNC FAILED:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

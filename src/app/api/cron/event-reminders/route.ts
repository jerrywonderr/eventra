import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEventReminderEmail } from "@/libs/email/resend";

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find events happening in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(threeDaysFromNow.setHours(23, 59, 59, 999));

    const { data: upcomingEvents } = await supabase
      .from("events")
      .select("id, title, event_date, location")
      .gte("event_date", startOfDay.toISOString())
      .lte("event_date", endOfDay.toISOString());

    if (!upcomingEvents || upcomingEvents.length === 0) {
      return NextResponse.json({ message: "No events in 3 days" });
    }

    let emailsSent = 0;

    for (const event of upcomingEvents) {
      // Get all ticket holders for this event
      const { data: tickets } = await supabase
        .from("tickets")
        .select("buyer:profiles(email, full_name)")
        .eq("event_id", event.id);

      if (!tickets) continue;

      // Get unique buyers
      interface Buyer {
        email: string;
        full_name: string;
      }

      const uniqueBuyers = Array.from(
        new Map(
          tickets.map((t: { buyer: Buyer | Buyer[] }) => {
            const buyer = Array.isArray(t.buyer) ? t.buyer[0] : t.buyer;
            return [buyer?.email, buyer];
          })
        ).values()
      ) as Buyer[];

      // Send reminder emails
      for (const buyer of uniqueBuyers) {
        if (!buyer?.email) continue;

        try {
          await sendEventReminderEmail(buyer.email, {
            userName: buyer.full_name || buyer.email.split("@")[0],
            eventTitle: event.title,
            eventDate: new Date(event.event_date).toLocaleDateString(),
            eventLocation: event.location,
            daysUntil: 3,
          });
          emailsSent++;
        } catch (error) {
          console.error(`Failed to send reminder to ${buyer.email}:`, error);
        }
      }
    }

    return NextResponse.json({
      message: `Sent ${emailsSent} reminder emails for ${upcomingEvents.length} events`,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}

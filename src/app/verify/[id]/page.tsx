import { createClient } from "@/libs/supabase/server";

interface VerifyPageProps {
  params: { id: string };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = params;
  const supabase = await createClient();

  // Fetch ticket and related data
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(
      `
      *,
      event:events(title, event_date, location),
      tier:ticket_tiers(tier_name)
    `
    )
    .eq("id", id)
    .single();

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-2">❌ Ticket Not Found</h1>
        <p className="text-slate-500">
          This ticket may be invalid or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center text-green-600">
          ✅ Ticket Verified
        </h1>

        <div className="space-y-2 text-center">
          <p className="font-semibold text-lg text-slate-900 dark:text-white">
            {ticket.event?.title}
          </p>
          <p className="text-sm text-slate-500">
            {new Date(ticket.event?.event_date).toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">{ticket.event?.location}</p>
          <p className="text-sm text-slate-500">
            🎟️ {ticket.tier?.tier_name || "Standard"}
          </p>
          <p className="text-sm font-mono text-slate-500 mt-4">
            Ticket ID: {ticket.id}
          </p>
        </div>
      </div>
    </div>
  );
}

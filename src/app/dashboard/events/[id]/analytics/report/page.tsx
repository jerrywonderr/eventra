// src/app/dashboard/events/[id]/analytics/report/page.tsx
import { createClient } from '@/libs/supabase/server';
import { notFound } from 'next/navigation';

export default async function AnalyticsReportPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  // Fetch event + ticket data again (similar to analytics page)
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (!event) notFound();

  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
    .eq('event_id', id);

  const totalRevenue = tickets?.reduce((sum, t) => sum + t.purchase_price, 0) || 0;
  const totalTickets = tickets?.length || 0;

  return (
    <html>
      <head>
        <title>{event.title} Report</title>
        <style>{`
          @media print {
            @page { margin: 1in; }
            body { font-family: sans-serif; color: #222; }
          }
        `}</style>
      </head>
      <body>
        <h1 style={{ fontSize: '2em', marginBottom: '0.5em' }}>{event.title}</h1>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
        <hr style={{ margin: '1em 0' }} />
        <h2>Summary</h2>
        <p><strong>Tickets Sold:</strong> {totalTickets}</p>
        <p><strong>Total Revenue:</strong> ${totalRevenue.toFixed(2)}</p>
        <p><strong>Average Ticket:</strong> ${(totalRevenue / (totalTickets || 1)).toFixed(2)}</p>

        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', () => {
              window.print();
            });
          `
        }} />
      </body>
    </html>
  );
}

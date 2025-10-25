// src/app/resale/new/page.tsx

import ResaleForm from './ResaleForm';
import Link from 'next/link';

export default function ResaleNewPage({ searchParams }: { searchParams?: { ticketId?: string; price?: string } }) {
  const ticketId = searchParams?.ticketId;
  const price = searchParams?.price ? Number(searchParams.price) : undefined;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">List Ticket for Resale</h1>
      {!ticketId ? (
        <div>
          <p className="mb-4">Missing ticketId in query params.</p>
          <Link href="/my-tickets" className="text-blue-600 hover:underline">Back to My Tickets</Link>
        </div>
      ) : (
        <ResaleForm ticketId={ticketId} initialPrice={price} />
      )}
    </div>
  );
}

// src/app/resale/new/page.tsx

import ResaleForm from "./ResaleForm";
import Link from "next/link";

export default async function ResaleNewPage({
  searchParams,
}: {
  searchParams: Promise<{ ticketId?: string; price?: string }>;
}) {
  const params = await searchParams;
  const ticketId = params?.ticketId;
  const price = params?.price ? Number(params.price) : undefined;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">List Ticket for Resale</h1>
      {!ticketId ? (
        <div>
          <p className="mb-4">Missing ticketId in query params.</p>
          <Link href="/my-tickets" className="text-blue-600 hover:underline">
            Back to My Tickets
          </Link>
        </div>
      ) : (
        <ResaleForm ticketId={ticketId} initialPrice={price} />
      )}
    </div>
  );
}

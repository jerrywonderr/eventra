import { createClient } from "@/libs/supabase/server";
import { notFound, redirect } from "next/navigation";
import BatchMintButton from "./BatchMintButton";
import MintCertificateButton from "./MintCertificateButton";
import CreateCollectionButton from "./CreateCollectionButton";

export default async function EventCertificatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id: eventId } = await params;

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get event details
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    notFound();
  }

  // Verify user is the organizer
  if (event.organizer_id !== user.id) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-red-600 text-lg"> Access Denied</p>
        <p className="text-slate-600 mt-2">
          Only event organizers can manage certificates
        </p>
      </div>
    );
  }

  // Get all ticket holders
  const { data: tickets } = await supabase
    .from("tickets")
    .select(
      `
      buyer_id,
      purchase_date,
      buyer:profiles!tickets_buyer_id_fkey(
        id,
        full_name,
        email
      )
    `
    )
    .eq("event_id", eventId);

  type TicketWithBuyer = {
    buyer_id: string;
    purchase_date: string;
    buyer:
      | {
          id: string;
          full_name: string | null;
          email: string | null;
        }
      | {
          id: string;
          full_name: string | null;
          email: string | null;
        }[];
  };

  const attendees = tickets
    ? Array.from(
        new Map(
          (tickets as TicketWithBuyer[]).map((t) => {
            const buyer = Array.isArray(t.buyer) ? t.buyer[0] : t.buyer;
            return [
              t.buyer_id,
              {
                id: t.buyer_id,
                full_name: buyer?.full_name,
                email: buyer?.email,
                purchase_date: t.purchase_date,
              },
            ];
          })
        ).values()
      )
    : [];
  // Get existing certificates
  const { data: certificates } = await supabase
    .from("certificates")
    .select(
      "*, recipient:profiles!certificates_recipient_id_fkey(full_name, email)"
    )
    .eq("event_id", eventId);

  const certificatesByRecipient = new Map(
    certificates?.map((c) => [c.recipient_id, c]) || []
  );

  const hasCollection = !!event.certificate_token_id;
  const totalAttendees = attendees.length;
  const totalCertificates = certificates?.length || 0;
  const remaining = totalAttendees - totalCertificates;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Certificate Management</h1>
        <p className="text-slate-600 dark:text-slate-400">{event.title}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Total Attendees
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {totalAttendees}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Certificates Minted
          </p>
          <p className="text-3xl font-bold text-green-600">
            {totalCertificates}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Remaining
          </p>
          <p className="text-3xl font-bold text-orange-600">{remaining}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Collection Status
          </p>
          <p className="text-sm font-semibold">
            {hasCollection ? (
              <span className="text-green-600">✓ Created</span>
            ) : (
              <span className="text-orange-600">Not Created</span>
            )}
          </p>
        </div>
      </div>

      {/* Collection Setup */}
      {!hasCollection ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎓</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                Create Certificate Collection
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Before minting certificates, you need to create an NFT
                collection on Hedera blockchain. This is a one-time setup for
                this event.
              </p>
              <CreateCollectionButton
                eventId={eventId}
                eventName={event.title}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200 mb-1">
                ✓ Certificate Collection Created
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 font-mono">
                Token ID: {event.certificate_token_id}
              </p>
            </div>
            {remaining > 0 && (
              <BatchMintButton eventId={eventId} remainingCount={remaining} />
            )}
          </div>
        </div>
      )}

      {/* Attendees List */}
      {hasCollection && totalAttendees > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold">Attendees</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Mint certificates for attendees individually or in batch
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Attendee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Purchase Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Certificate Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {attendees.map((attendee) => {
                  const certificate = certificatesByRecipient.get(attendee.id);
                  const hasCertificate = !!certificate;

                  return (
                    <tr
                      key={attendee.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {(
                              attendee.full_name?.[0] ||
                              attendee.email?.[0] ||
                              "U"
                            ).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {attendee.full_name || attendee.email}
                            </div>
                            {attendee.full_name && (
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {attendee.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {new Date(attendee.purchase_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasCertificate ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                            ✓ Minted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                            Not Minted
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {hasCertificate ? (
                          <a
                            href={`https://hashscan.io/${
                              process.env.NEXT_PUBLIC_HEDERA_NETWORK ||
                              "testnet"
                            }/token/${event.certificate_token_id}?p=1&k=${
                              certificate.nft_serial_number
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View on Hedera →
                          </a>
                        ) : (
                          <MintCertificateButton
                            eventId={eventId}
                            attendeeId={attendee.id}
                            attendeeName={
                              attendee.full_name || attendee.email || "Attendee"
                            }
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Attendees Yet */}
      {totalAttendees === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            No attendees yet
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            Certificates can be minted after tickets are purchased
          </p>
        </div>
      )}
    </div>
  );
}

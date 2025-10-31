// src/app/my-certificates/page.tsx

import { createClient } from "@/libs/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

type CertificateWithEvent = {
  id: string;
  event_id: string;
  recipient_id: string;
  nft_token_id: string;
  nft_serial_number: string;
  metadata: {
    eventName?: string;
    recipientName?: string;
    role?: string;
    date?: string;
    eventId?: string;
  } | null;
  issued_at: string;
  role: string;
  token_id?: string;
  event?: {
    id: string;
    title: string;
    event_date: string;
    location: string;
    image_url: string;
    certificate_token_id: string;
  };
};

export default async function MyCertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user's certificates
  const { data: certificates, error } = await supabase
    .from("certificates")
    .select(
      "id, event_id, recipient_id, nft_token_id, nft_serial_number, metadata, issued_at, role"
    )
    .eq("recipient_id", user.id)
    .order("issued_at", { ascending: false });

  let certificatesWithEvents: CertificateWithEvent[] = [];
  if (certificates && certificates.length > 0) {
    const eventIds = [...new Set(certificates.map((c) => c.event_id))];
    const { data: events } = await supabase
      .from("events")
      .select(
        "id, title, event_date, location, image_url, certificate_token_id"
      )
      .in("id", eventIds);

    certificatesWithEvents = certificates.map((cert) => ({
      ...cert,
      event: events?.find((e) => e.id === cert.event_id),
    }));
  }

  const totalCertificates = certificates?.length || 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Certificates</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Your blockchain-verified participation certificates
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Total Certificates</p>
          <p className="text-4xl font-bold">{totalCertificates}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Blockchain</p>
          <p className="text-xl font-bold">Hedera Hashgraph</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Status</p>
          <p className="text-xl font-bold">Verified ✓</p>
        </div>
      </div>

      {/* Certificates Grid */}
      {!certificatesWithEvents || certificatesWithEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-4">🎓</div>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
            No certificates yet
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            Attend events to earn blockchain-verified certificates
          </p>
          <Link
            href="/events"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certificatesWithEvents.map((cert) => {
            const event = Array.isArray(cert.event)
              ? cert.event[0]
              : cert.event;
            const metadata = cert.metadata as {
              eventName?: string;
              recipientName?: string;
              role?: string;
              date?: string;
            } | null;

            const explorerUrl = `https://hashscan.io/${
              process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet"
            }/token/${event?.certificate_token_id || cert.token_id}?p=1&k=${
              cert.nft_serial_number
            }`;

            return (
              <div
                key={cert.id}
                className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition group"
              >
                {/* Certificate Header */}
                <div className="h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
                  {/* Event Image as Background */}
                  {event?.image_url && (
                    <Image
                      src={event.image_url}
                      alt={event.title || "Event"}
                      fill
                      className="object-cover opacity-30"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/20"></div>

                  {/* Certificate Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-6 relative z-10">
                      <div className="text-6xl mb-3">🎓</div>
                      <h3 className="text-2xl font-bold drop-shadow-lg">
                        Certificate of {metadata?.role || "Participation"}
                      </h3>
                    </div>
                  </div>

                  {/* Verified Badge */}
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-20">
                    ✓ Verified
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="p-6">
                  {/* Event Info */}
                  <h4 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">
                    {event?.title || metadata?.eventName || "Event"}
                  </h4>

                  <div className="space-y-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">
                        👤 Recipient:
                      </span>
                      {metadata?.recipientName || user.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">
                        🏷️ Role:
                      </span>
                      <span className="capitalize">
                        {cert.role || metadata?.role || "Attendee"}
                      </span>
                    </p>
                    {event?.event_date && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          📅 Date:
                        </span>
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                    )}
                    {event?.location && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          📍 Location:
                        </span>
                        {event.location}
                      </p>
                    )}
                  </div>

                  {/* Blockchain Info */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                      Blockchain Verification
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          Token ID:
                        </span>
                        <span className="font-mono text-slate-900 dark:text-white">
                          {event?.certificate_token_id ||
                            cert.token_id ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          Serial #:
                        </span>
                        <span className="font-mono text-slate-900 dark:text-white">
                          {cert.nft_serial_number}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          Network:
                        </span>
                        <span className="font-mono text-slate-900 dark:text-white">
                          Hedera{" "}
                          {process.env.NEXT_PUBLIC_HEDERA_NETWORK || "Testnet"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center text-sm font-semibold"
                    >
                      View on Hedera →
                    </a>
                    {event?.id && (
                      <Link
                        href={`/events/${event.id}`}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition text-center text-sm font-semibold"
                      >
                        Event
                      </Link>
                    )}
                  </div>

                  {/* Issue Date */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                    Issued on {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      {totalCertificates > 0 && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
            About Your Certificates
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>✓ Each certificate is a unique NFT on Hedera blockchain</li>
            <li>
              ✓ Certificates are permanently verifiable and cannot be faked
            </li>
            <li>✓ Click `View on Hedera` to see blockchain proof</li>
            <li>✓ You can share these certificates to prove your attendance</li>
          </ul>
        </div>
      )}
    </div>
  );
}

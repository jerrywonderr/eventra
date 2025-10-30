"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mintCertificateForAttendee } from "@/app/actions/events";

interface Props {
  eventId: string;
  attendeeId: string;
  attendeeName: string;
}

export default function MintCertificateButton({
  eventId,
  attendeeId,
  attendeeName,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const router = useRouter();

  async function handleMint(
    role: "attendee" | "speaker" | "volunteer" | "organizer" = "attendee"
  ) {
    setLoading(true);

    try {
      const result = await mintCertificateForAttendee(
        eventId,
        attendeeId,
        role
      );

      if (result.error) {
        alert(" Failed\n\n" + result.error);
        return;
      }

      alert(
        ` Certificate Minted!\n\n` +
          `Recipient: ${attendeeName}\n` +
          `Role: ${role}\n` +
          `Serial Number: ${result.serialNumber}\n\n` +
          "Certificate recorded on Hedera blockchain."
      );

      setShowRoleSelect(false);
      router.refresh();
    } catch (error) {
      alert("Failed to mint certificate: " + (error as Error).message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (showRoleSelect) {
    return (
      <div className="inline-flex gap-2">
        <select
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            e.target.value &&
            handleMint(
              e.target.value as
                | "attendee"
                | "speaker"
                | "volunteer"
                | "organizer"
            )
          }
          disabled={loading}
          className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 disabled:opacity-50"
        >
          <option value="">Select Role...</option>
          <option value="attendee">Attendee</option>
          <option value="speaker">Speaker</option>
          <option value="volunteer">Volunteer</option>
          <option value="organizer">Organizer</option>
        </select>
        <button
          onClick={() => setShowRoleSelect(false)}
          disabled={loading}
          className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowRoleSelect(true)}
      disabled={loading}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition text-sm font-semibold"
    >
      {loading ? "Minting..." : "Mint Certificate"}
    </button>
  );
}

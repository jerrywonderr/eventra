"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEventCertificateCollection } from "@/app/actions/events";

interface Props {
  eventId: string;
  eventName: string;
}

export default function CreateCollectionButton({ eventId, eventName }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    if (
      !confirm(
        `Create NFT certificate collection for "${eventName}"?\n\n` +
          "This will create a token on Hedera blockchain (costs ~$0.50)."
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const result = await createEventCertificateCollection(eventId);

      if (result.error) {
        alert("❌ Failed\n\n" + result.error);
        return;
      }

      alert(
        "✅ Certificate Collection Created!\n\n" +
          `Token ID: ${result.tokenId}\n\n` +
          "You can now mint certificates for attendees."
      );

      router.refresh();
    } catch (error) {
      alert("Failed to create collection: " + (error as Error).message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold inline-flex items-center gap-2"
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          Creating on Hedera...
        </>
      ) : (
        <>🎓 Create Certificate Collection</>
      )}
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { batchMintCertificates } from "@/app/actions/events";

interface Props {
  eventId: string;
  remainingCount: number;
}

export default function BatchMintButton({ eventId, remainingCount }: Props) {
  const [loading, setLoading] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const router = useRouter();

  async function handleBatchMint(
    role: "attendee" | "speaker" | "volunteer" = "attendee"
  ) {
    if (
      !confirm(
        `Mint certificates for ${remainingCount} attendee(s)?\n\n` +
          `Role: ${role}\n` +
          "This may take a few moments."
      )
    ) {
      return;
    }

    setLoading(true);
    type BatchMintResult = {
      error?: string;
      results?: {
        success: number;
        failed: number;
        errors: string[];
      };
    };

    try {
      const result = (await batchMintCertificates(
        eventId,
        role
      )) as BatchMintResult;

      if (result.error) {
        alert("Failed\n\n" + result.error);
        return;
      }
      if (!result.results) {
        alert("No results returned from batch minting.");
        return;
      }

      const results = result.results;
      let message =
        `Batch Minting Complete!\n\n` +
        `Successfully minted: ${results.success}\n` +
        `Failed: ${results.failed}`;

      if (results.errors.length > 0) {
        message += `\n\nErrors:\n${results.errors.slice(0, 5).join("\n")}`;
        if (results.errors.length > 5) {
          message += `\n... and ${results.errors.length - 5} more`;
        }
      }

      alert(message);

      setShowRoleSelect(false);
      router.refresh();
    } catch (error) {
      alert("Batch minting failed: " + (error as Error).message);
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
            handleBatchMint(
              e.target.value as "attendee" | "speaker" | "volunteer"
            )
          }
          disabled={loading}
          className="px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg text-sm bg-white dark:bg-slate-700 disabled:opacity-50"
        >
          <option value="">Select Role for All...</option>
          <option value="attendee">Attendee</option>
          <option value="speaker">Speaker</option>
          <option value="volunteer">Volunteer</option>
        </select>
        <button
          onClick={() => setShowRoleSelect(false)}
          disabled={loading}
          className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-semibold inline-flex items-center gap-2"
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          Minting {remainingCount}...
        </>
      ) : (
        <>Mint All ({remainingCount})</>
      )}
    </button>
  );
}

"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";

interface Ticket {
  id: string | number;
  event?: {
    title?: string;
  };
  buyer_id?: string;
}

export default function TicketQRCode({ ticket }: { ticket: Ticket }) {
  const qrRef = useRef<HTMLDivElement>(null);

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${ticket.id}`
      : "";

  const qrValue = JSON.stringify({
    ticketId: ticket.id,
    verifyUrl,
  });

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const a = document.createElement("a");
      a.download = `ticket-${ticket.id}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };

    img.src = url;
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={qrRef} className="p-4 bg-white rounded-lg shadow">
        <QRCode value={qrValue} size={180} />
      </div>
      <button
        onClick={downloadQR}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Download QR
      </button>
    </div>
  );
}

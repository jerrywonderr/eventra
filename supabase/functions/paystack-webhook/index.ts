// supabase/functions/paystack-webhook/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// 🔐 Your Paystack secret key (should come from environment variables)
const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY");

serve(async (req) => {
  try {
    const body = await req.json();

    // ✅ Verify signature
    const signature = req.headers.get("x-paystack-signature");
    const crypto = await import("https://deno.land/std@0.177.0/node/crypto.ts");
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET!).update(JSON.stringify(body)).digest("hex");

    if (hash !== signature) {
      return new Response("Invalid signature", { status: 401 });
    }

    // 🎯 Handle event types
    switch (body.event) {
      case "charge.success":
        console.log("✅ Payment success:", body.data.reference);
        break;
      default:
        console.log("Unhandled event:", body.event);
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error processing webhook", { status: 500 });
  }
});

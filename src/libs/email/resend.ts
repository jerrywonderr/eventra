// src/libs/email/resend.ts

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTicketPurchaseEmail(
  to: string,
  data: {
    userName: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    ticketCount: number;
    totalPrice: number;
    transactionId: string;
    explorerUrl: string;
  }
) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: "eventraapp@outlook.com",
      to: [to],
      subject: ` Your Ticket for ${data.eventTitle}`,
      html: ticketPurchaseTemplate(data),
    });

    if (error) {
      console.error("Email send error:", error);
      return { error };
    }

    console.log("✅ Ticket purchase email sent:", emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error("Email error:", error);
    return { error };
  }
}

export async function sendEventReminderEmail(
  to: string,
  data: {
    userName: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    daysUntil: number;
  }
) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: "eventraapp@outlook.com",
      to: [to],
      subject: `📅 Reminder: ${data.eventTitle} in ${data.daysUntil} days`,
      html: eventReminderTemplate(data),
    });

    if (error) {
      console.error("Email send error:", error);
      return { error };
    }

    console.log("✅ Event reminder email sent:", emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error("Email error:", error);
    return { error };
  }
}

export async function sendCertificateMintedEmail(
  to: string,
  data: {
    userName: string;
    eventTitle: string;
    role: string;
    certificateUrl: string;
  }
) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: "eventraapp@outlook.com",
      to: [to],
      subject: `🎓 Your Certificate for ${data.eventTitle}`,
      html: certificateMintedTemplate(data),
    });

    if (error) {
      console.error("Email send error:", error);
      return { error };
    }

    console.log("✅ Certificate minted email sent:", emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error("Email error:", error);
    return { error };
  }
}

export async function sendWelcomeEmail(
  to: string,
  data: {
    userName: string;
  }
) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: "eventraapp@outlook.com",
      to: [to],
      subject: "🎉 Welcome to Eventra!",
      html: welcomeEmailTemplate(data),
    });

    if (error) {
      console.error("Email send error:", error);
      return { error };
    }

    console.log("✅ Welcome email sent:", emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error("Email error:", error);
    return { error };
  }
}

// Email Templates

function ticketPurchaseTemplate(data: {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketCount: number;
  totalPrice: number;
  transactionId: string;
  explorerUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎫 Ticket Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p><strong>Great news!</strong> Your ticket purchase is confirmed and verified on the blockchain.</p>
      
      <div class="ticket-info">
        <h2>${data.eventTitle}</h2>
        <p><strong>📅 Date:</strong> ${data.eventDate}</p>
        <p><strong>📍 Location:</strong> ${data.eventLocation}</p>
        <p><strong>🎫 Tickets:</strong> ${data.ticketCount}</p>
        <p><strong>💰 Total:</strong> $${data.totalPrice}</p>
      </div>

      <p><strong>Blockchain Verification:</strong></p>
      <p style="font-family: monospace; font-size: 12px; background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all;">
        ${data.transactionId}
      </p>

      <a href="${data.explorerUrl}" class="button">View on Hedera Explorer</a>
      <a href="${
        process.env.NEXT_PUBLIC_APP_URL || "https://eventra-delta.vercel.app/"
      }/my-tickets" class="button" style="background: #10b981;">View My Tickets</a>

      <p style="margin-top: 20px;"><strong>What's Next?</strong></p>
      <ul>
        <li>Your ticket is safely stored in your account</li>
        <li>Show your QR code at the event entrance</li>
        <li>You'll receive a reminder before the event</li>
      </ul>

      <p>See you at the event! 🎉</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Eventra. All rights reserved.</p>
      <p>Blockchain-verified ticketing on Hedera Hashgraph</p>
    </div>
  </div>
</body>
</html>
  `;
}

function eventReminderTemplate(data: {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  daysUntil: number;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .countdown { background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .days { font-size: 48px; font-weight: bold; color: #ef4444; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Event Reminder</h1>
    </div>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p><strong>Don't forget!</strong> Your event is coming up soon.</p>
      
      <div class="countdown">
        <div class="days">${data.daysUntil}</div>
        <p style="font-size: 18px; color: #6b7280;">days until</p>
        <h2 style="margin: 10px 0;">${data.eventTitle}</h2>
        <p><strong>📅</strong> ${data.eventDate}</p>
        <p><strong>📍</strong> ${data.eventLocation}</p>
      </div>

      <a href="${
        process.env.NEXT_PUBLIC_APP_URL || "https://eventra-delta.vercel.app/"
      }/my-tickets" class="button">View My Ticket</a>

      <p style="margin-top: 20px;"><strong>Reminders:</strong></p>
      <ul>
        <li>✓ Check your ticket in "My Tickets"</li>
        <li>✓ Plan your travel and arrival time</li>
        <li>✓ Have your QR code ready at the entrance</li>
      </ul>

      <p>See you soon! 🎉</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Eventra. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function certificateMintedTemplate(data: {
  userName: string;
  eventTitle: string;
  role: string;
  certificateUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .certificate { background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; border: 3px solid #8b5cf6; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Certificate Issued!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p><strong>Congratulations!</strong> Your participation certificate has been minted as an NFT on the blockchain.</p>
      
      <div class="certificate">
        <div style="font-size: 64px; margin-bottom: 20px;">🎓</div>
        <h2>Certificate of ${data.role}</h2>
        <h3>${data.eventTitle}</h3>
        <p style="color: #10b981; font-weight: bold; margin-top: 20px;">✓ Verified on Hedera Blockchain</p>
      </div>

      <a href="${data.certificateUrl}" class="button">View Certificate</a>
      <a href="${
        process.env.NEXT_PUBLIC_APP_URL || "https://eventra-delta.vercel.app/"
      }/my-certificates" class="button" style="background: #10b981;">View All Certificates</a>

      <p style="margin-top: 20px;"><strong>What makes this special?</strong></p>
      <ul>
        <li>🔒 Permanently stored on blockchain</li>
        <li>✓ Cannot be faked or duplicated</li>
        <li>🌐 Verifiable by anyone, anywhere</li>
        <li>💼 Perfect for your professional portfolio</li>
      </ul>

      <p>Share your achievement! 🎉</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Eventra. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function welcomeEmailTemplate(data: { userName: string }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .feature { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Eventra!</h1>
      <p style="font-size: 18px; margin-top: 10px;">Your gateway to blockchain-verified events</p>
    </div>
    <div class="content">
      <p>Hi ${data.userName},</p>
      <p>Welcome to <strong>Eventra</strong> - where every ticket is fraud-proof and every event is unforgettable!</p>
      
      <h3>What you can do with Eventra:</h3>

      <div class="feature">
        <strong>🎫 Browse Events</strong><br>
        Discover amazing events across multiple categories
      </div>

      <div class="feature">
        <strong>🔒 Secure Tickets</strong><br>
        Every ticket is verified on Hedera blockchain
      </div>

      <div class="feature">
        <strong>⭐ Earn Rewards</strong><br>
        Get 10 points per $1 spent + 50 bonus points on first purchase!
      </div>

      <div class="feature">
        <strong>🎓 NFT Certificates</strong><br>
        Receive blockchain certificates for events you attend
      </div>

      <a href="${
        process.env.NEXT_PUBLIC_APP_URL || "https://eventra-delta.vercel.app/"
      }/events" class="button">Browse Events</a>

      <p style="margin-top: 30px;">Questions? We're here to help! Just reply to this email.</p>
      
      <p>Happy eventing! 🎊</p>
      <p><strong>The Eventra Team</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Eventra. All rights reserved.</p>
      <p>Blockchain-verified ticketing on Hedera Hashgraph</p>
    </div>
  </div>
</body>
</html>
  `;
}

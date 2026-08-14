# Eventra — Event Ticketing Platform

A full-stack event ticketing system built for the Hedera Hackathon 2025.

## What it does

- Event creation with tiered ticket types (VIP, Regular, Early Bird)
- Dual payment flow: Paystack (fiat) and Hedera (crypto)
- Resale marketplace with automatic royalty distribution
- NFT certificates of participation
- Real-time analytics dashboard for organizers
- Automated email notifications

## Engineering decisions

- Chose Hedera over Ethereum for transaction cost ($0.0001 vs $5–50) and speed
- Used Supabase for managed PostgreSQL, auth, and real-time subscriptions
- Implemented row-level security policies
- Built server-side payment verification via webhooks

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Server Actions, Supabase (PostgreSQL)
- **Payments:** Paystack (fiat), Hedera (crypto)
- **Blockchain:** Hedera Token Service for NFT tickets and certificates

## Status

The Supabase free-tier project has expired, so the backend is currently non-functional. The frontend remains deployed on Vercel.

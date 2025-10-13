# Eventra

A decentralized event management platform built on the Hedera blockchain. Eventra provides a seamless experience for discovering, booking, and managing events with the security and transparency of blockchain technology.

## About

Eventra is a next-generation event booking platform that leverages the Hedera Hashgraph distributed ledger technology to provide:

- **Secure Ticketing**: NFT-based tickets stored on the Hedera blockchain, preventing fraud and counterfeiting
- **Transparent Transactions**: All ticket sales and transfers are recorded on the blockchain for complete transparency
- **Smart Contracts**: Automated event management and ticketing logic using Hedera Smart Contracts
- **Fast & Low-Cost**: Leverage Hedera's high throughput and low transaction fees for instant bookings
- **Decentralized**: No single point of failure, ensuring reliability and trust

## Features

- 🎫 Browse and discover events across multiple categories
- ⚡ Instant ticket booking with secure blockchain verification
- 🔒 NFT-based tickets with proof of ownership
- 📱 Mobile-friendly responsive design
- 🌙 Dark mode support
- 💳 Cryptocurrency payment integration
- 🎯 Smart event recommendations
- 📊 Event organizer dashboard

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Blockchain**: Hedera Hashgraph
- **Smart Contracts**: Hedera Token Service (HTS), Hedera Smart Contract Service
- **Authentication**: Hedera wallet integration

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager
- A Hedera testnet account (for development)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/eventra.git
cd eventra
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Add your Hedera credentials and configuration to `.env.local`:

```
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_ACCOUNT_ID=your_account_id
HEDERA_PRIVATE_KEY=your_private_key
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
eventra/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── libs/             # Shared libraries and utilities
│   │   └── components/   # Reusable React components
│   └── ...
├── public/               # Static assets
├── package.json          # Project dependencies
└── README.md            # This file
```

## Development

- The landing page is located at `src/app/page.tsx`
- Global styles are in `src/app/globals.css`
- Tailwind CSS is configured for styling
- Reusable components are in `src/libs/components/`
- Utility functions are in `src/libs/utils/`
- Type definitions are in `src/libs/types/`

## Documentation

Comprehensive guides are available in the `/docs` folder:

- **[Quick Start Guide](./docs/QUICK_START.md)** - Get started in 5 minutes
- **[Environment Setup](./docs/ENVIRONMENT_SETUP.md)** - Detailed Hedera configuration guide
- **[Project Structure](./docs/PROJECT_STRUCTURE.md)** - Complete codebase overview
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project

## Available Components

Eventra includes pre-built, reusable components:

- **`Button`** - Customizable button with variants and sizes
- **`EventCard`** - Card component for displaying events

Example usage:

```typescript
import { Button, EventCard } from "@/libs/components";

<Button variant="primary" size="lg">
  Book Now
</Button>;
```

## Utility Functions

Helper functions for common tasks:

- **Hedera Utilities** - Account formatting, HBAR conversion, explorer URLs
- **Format Utilities** - Currency, dates, wallet addresses, text truncation

Example usage:

```typescript
import { formatCurrency, formatDate } from "@/libs/utils";

formatCurrency(99.99); // "$99.99"
formatDate(new Date()); // "Oct 13, 2025"
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) to learn about our development process, coding standards, and how to submit pull requests.

## License

This project is licensed under the MIT License.

## Learn More

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)

### Hedera Resources

- [Hedera Documentation](https://docs.hedera.com)
- [Hedera SDK](https://docs.hedera.com/hedera/sdks-and-apis)
- [Hedera Token Service](https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service)
- [Hedera Smart Contracts](https://docs.hedera.com/hedera/core-concepts/smart-contracts)
- [Hedera Portal](https://portal.hedera.com/)
- [HashScan Explorer](https://hashscan.io/)

### Community

- [Hedera Discord](https://hedera.com/discord)
- [Hedera GitHub](https://github.com/hashgraph)

## Support

Need help? Check out our documentation or reach out:

- 📖 Read the [docs](./docs/)
- 🐛 [Report bugs](https://github.com/yourusername/eventra/issues)
- 💬 Join the community discussions

# Quick Start Guide

Get up and running with Eventra in 5 minutes!

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18+ installed
- ✅ npm, yarn, pnpm, or bun package manager
- ✅ A code editor (VS Code recommended)
- ✅ Git installed

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/eventra.git
cd eventra

# Install dependencies
npm install
```

## Step 2: Environment Setup (2 minutes)

### Create Environment File

```bash
# Create .env.local file
touch .env.local
```

### Add Configuration

Open `.env.local` and add:

```bash
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_HEDERA_MIRROR_NODE=https://testnet.mirrornode.hedera.com
```

**Don't have Hedera credentials yet?**
👉 See [Environment Setup Guide](./ENVIRONMENT_SETUP.md) for detailed instructions.

**For testing without Hedera:**
You can skip this step initially and explore the UI. Blockchain features will be unavailable until configured.

## Step 3: Run the Application (1 minute)

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the Eventra landing page! 🎉

## What's Next?

### Explore the Application

- Browse the landing page
- Check out the features section
- View sample events
- Explore the UI components

### Start Developing

- **Add a new page**: Create a file in `src/app/`
- **Create a component**: Add to `src/libs/components/`
- **Add utilities**: Extend `src/libs/utils/`

### Learn More

- 📖 [Project Structure](./PROJECT_STRUCTURE.md) - Understand the codebase
- 🔧 [Environment Setup](./ENVIRONMENT_SETUP.md) - Configure Hedera credentials
- 🤝 [Contributing](../CONTRIBUTING.md) - Learn how to contribute

## Common Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint

# Git
git status               # Check your changes
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push                 # Push to remote
```

## Project Structure Overview

```
eventra/
├── src/
│   ├── app/              # Pages and routes
│   │   ├── page.tsx      # Landing page (start here!)
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Global styles
│   └── libs/             # Shared code
│       ├── components/   # Reusable UI components
│       ├── constants/    # App constants
│       ├── types/        # TypeScript types
│       └── utils/        # Helper functions
├── public/               # Static assets
└── docs/                 # Documentation
```

## Your First Change

Let's make a simple change to verify everything works:

1. Open `src/app/page.tsx`
2. Find the hero section (around line 30)
3. Change the tagline text
4. Save the file
5. See the change in your browser instantly! ⚡

## Using Components

Eventra includes pre-built components. Try using them:

```typescript
import { Button, EventCard } from '@/libs/components';

// Use the Button
<Button variant="primary" size="lg">
  Click Me
</Button>

// Use the EventCard
<EventCard
  title="Summer Concert"
  date="Jul 15, 2025"
  location="Central Park"
  price="$99"
  category="Music"
  onBook={() => console.log('Booked!')}
/>
```

## Styling with Tailwind

Eventra uses Tailwind CSS for styling:

```typescript
<div className="bg-blue-600 text-white p-4 rounded-lg">
  Beautiful styled component
</div>
```

Color scheme:

- Primary: `blue-600` to `purple-600` (gradient)
- Background: `slate-50` (light) / `slate-950` (dark)
- Text: `slate-900` (light) / `white` (dark)

## TypeScript Types

Use the provided types for type safety:

```typescript
import { Event, Ticket, User } from "@/libs/types";

const event: Event = {
  id: "1",
  title: "Tech Conference",
  // ... other properties
};
```

## Utilities

Helpful utility functions are available:

```typescript
import { formatCurrency, formatDate, formatWalletAddress } from "@/libs/utils";

formatCurrency(99.99); // "$99.99"
formatDate(new Date()); // "Oct 13, 2025"
formatWalletAddress("0x1234..."); // "0x1234...5678"
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Changes Not Showing

- Hard refresh: `Cmd/Ctrl + Shift + R`
- Clear browser cache
- Restart dev server

### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit
```

## Getting Help

- 📖 Read the [full documentation](./PROJECT_STRUCTURE.md)
- 🐛 Found a bug? [Create an issue](https://github.com/yourusername/eventra/issues)
- 💬 Questions? Join our Discord
- 🤝 Want to contribute? See [CONTRIBUTING.md](../CONTRIBUTING.md)

## Next Steps

### For Beginners

1. Explore the landing page code in `src/app/page.tsx`
2. Try modifying text and colors
3. Add a new section to the landing page
4. Create your first component

### For Experienced Developers

1. Set up Hedera integration
2. Create event listing pages
3. Implement ticket booking flow
4. Add wallet connection
5. Deploy to production

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Hedera Docs](https://docs.hedera.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Success! 🎉

You're now ready to build with Eventra. Happy coding!

---

**Need more detailed information?** Check out the comprehensive guides in the `/docs` folder.

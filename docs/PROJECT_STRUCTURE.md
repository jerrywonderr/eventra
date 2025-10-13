# Project Structure

This document outlines the structure and organization of the Eventra project.

## Directory Overview

```
eventra/
├── docs/                      # Documentation files
├── public/                    # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/                       # Source code
│   ├── app/                   # Next.js app directory
│   │   ├── favicon.ico
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout component
│   │   └── page.tsx          # Landing page
│   └── libs/                  # Shared libraries
│       ├── components/        # Reusable React components
│       │   ├── Button.tsx
│       │   ├── EventCard.tsx
│       │   └── index.ts
│       ├── constants/         # Application constants
│       │   └── index.ts
│       ├── types/            # TypeScript type definitions
│       │   └── index.ts
│       └── utils/            # Utility functions
│           ├── format.ts
│           ├── hedera.ts
│           └── index.ts
├── .gitignore                # Git ignore rules
├── CONTRIBUTING.md           # Contribution guidelines
├── eslint.config.mjs         # ESLint configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Project dependencies
├── postcss.config.mjs        # PostCSS configuration
├── README.md                 # Project documentation
└── tsconfig.json             # TypeScript configuration
```

## Source Code Organization

### `/src/app/`

Next.js 15 App Router directory. Contains pages, layouts, and route handlers.

- **`layout.tsx`**: Root layout component with metadata and font configuration
- **`page.tsx`**: Landing page component
- **`globals.css`**: Global styles, CSS variables, and custom scrollbar styling

### `/src/libs/components/`

Reusable React components used throughout the application.

#### Current Components:

- **`Button.tsx`**: Customizable button component with variants (primary, secondary, outline) and sizes
- **`EventCard.tsx`**: Event card component for displaying event information

#### Component Guidelines:

- One component per file
- Use TypeScript interfaces for props
- Export components from `index.ts`
- Include proper typing and documentation

### `/src/libs/constants/`

Application-wide constants and configuration values.

#### Files:

- **`index.ts`**: Contains:
  - `HEDERA_CONFIG`: Hedera network configuration
  - `EVENT_CATEGORIES`: Available event categories
  - `APP_CONFIG`: Application metadata

### `/src/libs/types/`

TypeScript type definitions and interfaces.

#### Defined Types:

- **`Event`**: Event data structure
- **`Ticket`**: NFT ticket information
- **`User`**: User profile data
- **`Transaction`**: Blockchain transaction details

### `/src/libs/utils/`

Utility functions and helper methods.

#### Files:

- **`hedera.ts`**: Hedera-specific utilities
  - Account ID formatting and validation
  - HBAR/Tinybar conversion
  - Explorer URL generation
  - Network configuration
- **`format.ts`**: Formatting utilities
  - Currency formatting
  - Date formatting (short, long, relative)
  - Text truncation
  - Wallet address formatting

## Configuration Files

### `next.config.ts`

Next.js configuration. Currently using default settings with Turbopack enabled.

### `tsconfig.json`

TypeScript compiler configuration. Configured for Next.js with:

- Strict mode enabled
- Path aliases configured
- Module resolution set to bundler

### `eslint.config.mjs`

ESLint configuration using the Next.js recommended preset.

### `postcss.config.mjs`

PostCSS configuration for Tailwind CSS processing.

### `package.json`

Project dependencies and scripts:

- **`dev`**: Start development server with Turbopack
- **`build`**: Build production bundle
- **`start`**: Start production server
- **`lint`**: Run ESLint

## Adding New Features

### Adding a New Component

1. Create the component file in `src/libs/components/`
2. Define TypeScript interfaces for props
3. Implement the component
4. Export it from `src/libs/components/index.ts`
5. Document usage in component file

Example:

```typescript
// src/libs/components/MyComponent.tsx
import React from "react";

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return <div>{title}</div>;
};
```

### Adding New Routes

Create new directories and files in `src/app/` following Next.js App Router conventions:

- `page.tsx` for routes
- `layout.tsx` for layouts
- `loading.tsx` for loading states
- `error.tsx` for error boundaries

### Adding Utility Functions

1. Add functions to appropriate file in `src/libs/utils/`
2. Include JSDoc comments
3. Export from `src/libs/utils/index.ts`

## Best Practices

### File Naming

- Components: PascalCase (e.g., `EventCard.tsx`)
- Utilities: camelCase (e.g., `format.ts`)
- Types: PascalCase (e.g., `Event`, `Ticket`)

### Code Organization

- Keep files small and focused
- One component/class per file
- Group related functionality
- Use barrel exports (index.ts files)

### Styling

- Use Tailwind CSS utility classes
- Define custom CSS variables in `globals.css`
- Follow the existing color scheme (blue-purple gradient)

### State Management

- Keep state as local as possible
- Use React hooks for component state
- Consider Context API for global state

### TypeScript

- Always define types/interfaces
- Avoid `any` type
- Use proper typing for props and return values
- Leverage type inference where appropriate

## Environment Variables

Store sensitive configuration in environment variables:

- `NEXT_PUBLIC_*`: Client-side accessible
- Without prefix: Server-side only

See README.md for required environment variables.

## Future Structure

As the project grows, consider adding:

- `/src/libs/hooks/` - Custom React hooks
- `/src/libs/contexts/` - React contexts
- `/src/libs/services/` - API and blockchain service layers
- `/src/app/api/` - API routes
- `/src/app/(auth)/` - Authentication pages
- `/src/app/(dashboard)/` - Dashboard pages
- `/tests/` - Test files

## Questions?

Refer to the main README.md or CONTRIBUTING.md for more information.

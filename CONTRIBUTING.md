# Contributing to Eventra

Thank you for your interest in contributing to Eventra! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/jerrywonderr/eventra.git
   cd eventra
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables** (see README.md for details)
5. **Run the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Creating a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### Making Changes

1. Make your changes in your feature branch
2. Follow the code style guidelines (see below)
3. Test your changes thoroughly
4. Commit your changes with clear, descriptive messages

### Commit Messages

Follow the conventional commits format:

```
type(scope): brief description

Detailed description if needed

Fixes #issue-number
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(events): add event filtering by category
fix(booking): resolve ticket purchase error
docs(readme): update installation instructions
```

### Code Style Guidelines

- **TypeScript**: Use TypeScript for all new code
- **Naming Conventions**:
  - Components: PascalCase (e.g., `EventCard.tsx`)
  - Functions/Variables: camelCase (e.g., `formatDate`)
  - Constants: UPPER_SNAKE_CASE (e.g., `HEDERA_CONFIG`)
- **File Organization**:
  - One component per file
  - Export components from index files
  - Keep files focused and small
- **Styling**: Use Tailwind CSS utility classes
- **Comments**: Add JSDoc comments for functions and complex logic

### Testing

Before submitting a PR:

1. Run the linter: `npm run lint`
2. Test your changes manually
3. Ensure the build succeeds: `npm run build`

## Submitting a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Create a Pull Request** on GitHub
3. **Fill out the PR template** with:
   - Description of changes
   - Related issue numbers
   - Screenshots (if applicable)
   - Testing instructions
4. **Wait for review** and address any feedback

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update documentation as needed
- Add comments for complex logic
- Ensure all checks pass
- Request review from maintainers

## Code Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in the release notes

## Development Guidelines

### Working with Hedera

- Always use testnet for development
- Never commit private keys or sensitive data
- Use environment variables for configuration
- Test transactions thoroughly before deploying

### Component Development

- Create reusable components in `src/libs/components/`
- Use TypeScript interfaces for props
- Follow the existing component patterns
- Ensure components are accessible (ARIA labels, keyboard navigation)

### State Management

- Keep state as local as possible
- Use React hooks for state management
- Consider context for global state

## Need Help?

- Check existing issues and discussions
- Join our community chat
- Read the documentation
- Ask questions in your PR

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## License

By contributing to Eventra, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Eventra! 🎉

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npm test` - Run Jest tests

## Architecture Overview

This is a Next.js application with a Pages Router structure that has undergone a complete refactoring to implement feature-based organization and eliminate code duplication.

### Project Structure

The codebase follows a hybrid structure during migration:

#### Current Architecture (Post-Refactoring)
- `src/` - New organized structure with feature-based modules
  - `features/` - Feature-specific components organized by domain (sanctions, tasks, mood, etc.)
  - `components/` - Shared UI components (common utilities, layout, ui primitives)
  - `shared/` - Cross-cutting concerns (hooks, utils, types, constants)
  - `pages/` - Next.js pages with cleaner imports

#### Legacy Structure (Being Migrated)
- Root-level directories (`components/`, `lib/`, `models/`, `hooks/`, etc.) are being gradually migrated to the new `src/` structure

### Key Architectural Patterns

#### API Client Architecture
- Centralized API client in `lib/api/` with typed modules for each domain
- `ApiClient` class provides standardized HTTP operations with error handling
- Each API module exports domain-specific functions (e.g., `profileApi`, `sanctionsApi`)
- Unified `ApiResponse<T>` interface for consistent response handling

#### State Management
- **Zustand stores**: Global state management for app, profile, sanctions, events, and tasks
- **React hooks**: Domain-specific hooks (useProfile, useSanctions, useTasks) that wrap API calls
- **Form state**: Centralized form state management with `useFormState` hook

#### Feature Organization
Features are organized by domain with their own components:
- `sanctions/` - Complete sanctions management system
- `tasks/` - Daily tasks and quick task management  
- `mood/` - Mood tracking and health questionnaires
- `warnings/` - Warning system
- `admin/` - Admin dashboard and health reports
- `coins/` - Reward and coin book system

### Import System

The project uses TypeScript path mapping for clean imports:

```typescript
"@/*": ["./*"]              // Root level access
"@src/*": ["src/*"]         // New src structure
"@features/*": ["src/features/*"]  // Feature modules
"@components/*": ["src/components/*"]  // Shared components  
"@shared/*": ["src/shared/*"]  // Shared utilities
"@models/*": ["models/*"]    // Database models
```

Always use path aliases instead of relative imports when possible.

### Database Models

MongoDB models are defined in the `models/` directory using Mongoose. Key models include:
- Profile, Event, Sanction, QuickTask, DailyTask
- Mood tracking (Mood, MoodBaseDate, MoodOverride)
- Content system (News, WikiPage, Survey)

### Testing Setup

- Jest with TypeScript support (`ts-jest`)
- jsdom environment for React component testing
- Test files in `__tests__/` directory
- Run individual tests: `npm test -- --testNamePattern="testName"`

### Deployment

- Configured for Netlify deployment with `@netlify/plugin-nextjs`
- Build command: `npm run build`
- Functions use esbuild bundler

### Technology Stack

- **Framework**: Next.js 15 with Pages Router
- **UI Libraries**: 
  - Material-UI (MUI) for complex components
  - Radix UI primitives for accessibility
  - Tailwind CSS for styling
- **State Management**: Zustand with subscriptions
- **Animation**: Framer Motion, GSAP
- **Data Fetching**: Custom API client with Axios
- **Forms**: Custom form state management
- **Database**: MongoDB with Mongoose

### Development Guidelines

#### Working with Features
When adding new functionality:
1. Check if it belongs to an existing feature domain
2. Use the established patterns in `src/features/`
3. Create reusable components in `src/components/common/`
4. Add shared utilities to `src/shared/utils/`

#### API Integration
- Use existing API modules in `lib/api/` 
- Follow the `ApiResponse<T>` pattern for new endpoints
- Implement error handling with the `ApiError` class
- Use domain-specific hooks for React components

#### Component Development
- Follow the established component patterns in each feature
- Use `useFormState` for form state management
- Implement proper TypeScript typing
- Add barrel exports (`index.ts`) for clean imports

#### Code Migration
Legacy code is preserved during migration:
- Legacy utilities in `src/shared/utils/legacy/`
- Legacy types in `src/shared/types/legacy/`
- Original hooks in `src/shared/hooks/legacy/`

Always check both old and new structures when working with existing functionality.
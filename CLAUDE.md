# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository consists of two main components:

1. Web Application:
    - A full-stack web application built with Next.js
    - `src/app/`
2. Jetstream Listener:
    - A backend service that listens to the Bluesky Jetstream firehose and saves posts to the database
    - `src/firehose/`

## Development Commands

- `deno task dev:next` - Start Next.js development server with Turbopack
- `deno task dev:firehose` - Start the firehose listener in development mode
- `deno task build` - Build the Next.js application
- `deno task start:next` - Start the production Next.js server
- `deno task start:firehose` - Start the firehose listener with watch mode
- `deno task db:generate --config ${file}` - Generate database migrations with Drizzle
- `deno task db:migrate --config ${file}` - Run database migrations
- `deno task lint` - Run Biome linter
- `deno task lint:fix` - Run Biome linter with auto-fix
- `deno task format` - Format code with Biome
- `deno test` - Run unit tests

## Backend Architecture

Hexagonal architecture with domain-driven design principles.

- Domain Layer (`src/core/domain/`):
    - Contains business logic, types, and port interfaces
    - `src/core/domain/${domain}/types.ts`: Domain entities, value objects, and DTOs
    - `src/core/domain/${domain}/ports/**.ts`: Port interfaces for external services (repositories, exteranl APIs, etc.)
- Adapter Layer (`src/core/adapters/`):
    - Contains concrete implementations for external services
    - `src/core/adapters/${externalService}/**.ts`: Adapters for external services like databases, APIs, etc.
- Application Layer (`src/core/application/`):
    - Contains use cases and application services
    - `src/core/application/context.ts`: Context type for dependency injection
    - `src/core/application/${domain}/${usecase}.ts`: Application services that orchestrate domain logic. Each service is a function that takes a context object.

### Ports example

```typescript
// src/core/domain/post/ports/postRepository.ts

export interface PostRepository {
  create(post: CreatePostParams): Promise<Result<Post, RepositoryError>>;
  getById(id: string): Promise<Result<Post, RepositoryError>>;
  // Other repository methods...
}
```

### Adapters example

```typescript
// src/core/adapters/drizzleSqlite/postRepository.ts

import type { Result } from "neverthrow";
import type { PostRepository } from "@/domain/post/ports/postRepository";
import type { CreatePostParams, Post } from "@/domain/post/types";
import type { Database } from "./database";

export class DrizzleSqlitePostRepository implements PostRepository {
  constructor(private readonly db: Database) {}

  async getById(id: string): Promise<Result<Post, RepositoryError>> {
    // Implementation using Drizzle ORM
  }

  async update(post: UpdatePostParams): Promise<Result<Post, RepositoryError>> {
    // Implementation using Drizzle ORM
  }
}
```

### Application Service example

```typescript
// src/core/application/post/updatePost.ts

import type { Context } from "../context";
import type { PostRepository } from "@/domain/post/ports/postRepository";
import { Result } from "neverthrow";

export async function editPost(
  context: Context,
  params: EditPostInput
): Promise<Result<Post, RepositoryError>> {
  return context.postRepository.update(params).mapErr(error => new ApplicationError("Failed to update post", error));
}
```

## Frontend Architecture

Next.js 15.2.1 application code using App Router, React 19, Tailwind CSS v4, and shadcn/ui.

- UI Components
    - `src/app/components/ui/`: Reusable UI components using shadcn/ui
    - `src/app/components/${domain}/`: Domain-specific components
    - `src/app/components/**/*`: Other reusable components
- Pages and Routes
    - Follows Next.js App Router conventions
- Styles
    - `src/app/styles/index.css`: Entry point for global styles
- Server Actions
    - `src/actions/${domain}.ts`: Server actions for handling application services

## Tech Stack

- Runtime
    -Deno
- Frontend:
    - Next.js 1
    - React 19
    - Tailwind CSS
    - shadcn/ui
- Database:
    - SQLite(Turso) with Drizzle ORM
    - PGlite for testing
- Validation:
    - Zod schemas with branded types
- Error Handling:
    - neverthrow for Result types

## Environment Variables

Environment variables (see `.env.example`):

- `JETSTREAM_HOST`: Bluesky Jetstream WebSocket URL
- `DID`: Bluesky DID to filter posts for
- `TURSO_DATABASE_URL`: Turso database URL
- `TURSO_AUTH_TOKEN`: Turso authentication token
- `PGLITE_DATABASE_URL`: PGlite database URL (for testing, leave empty to use in-memory database)

## Error Handling

- All backend functions return `Result<T, E>` or `Promise<Result<T, E>>` types using `neverthrow`
- Each modules has its own error types, e.g. `RepositoryError`, `ApplicationError`. Error types should extend a base `AnyError` class (`src/lib/error.ts`)

## Testing

- Use `deno test` for unit tests
- Use `src/core/adapters/drizzlePglite/${adapter}.ts` to create PGlite implementations of external services for testing
- Close database connections after tests to avoid memory leaks and ensure proper cleanup
- Use `src/core/adapters/mock/${adapter}.ts` to create mock implementations of external services for testing

### Application Service Tests

- Use `src/core/application/${domain}/${usecase}.test.ts` for unit tests of application services

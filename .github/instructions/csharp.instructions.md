---
applyTo: "backend/**/*.cs"
---

# C# Instructions for Gifty Backend

These rules apply to the ASP.NET Core backend in this repository.

## Architecture and layering

- Follow the existing layered structure:
  - `Gifty.Api`: transport concerns (controllers, middleware, auth wiring).
  - `Gifty.Application`: use cases (commands/queries/handlers, validators, event handlers).
  - `Gifty.Domain`: entities, domain events, interfaces, business invariants.
  - `Gifty.Infrastructure`: persistence and external integrations.
- Keep changes small and feature-scoped; prefer extending existing feature folders over broad refactors.
- Do not move transport formatting concerns (date/string formatting, HTTP shape logic) into domain entities.

## CQRS and handlers

- Implement new write paths as commands and read paths as queries through MediatR.
- Keep handlers focused on one use case.
- Validate inputs with FluentValidation in the application layer.
- Do not call `IMediator.Send` or `IMediator.Publish` from inside another handler unless explicitly required by an existing pattern.

## Error handling and logging

- Let failures surface to centralized middleware unless the flow is intentionally best-effort.
- Use explicit exceptions for invalid state and unexpected conditions.
- Use `ILogger<T>` in application/infrastructure services; keep logs structured and avoid sensitive data.

## Data and persistence

- Use existing repository/DbContext patterns already present in the touched feature.
- Keep migrations intentional and minimal; avoid unrelated schema churn.
- Respect nullability (`#nullable`) and avoid null-forgiveness (`!`) unless unavoidable.

## Testing expectations

- Add or update tests when behavior changes.
- Prefer unit tests for business logic and integration tests for API + persistence behavior.
- Keep assertions behavior-focused (inputs/outputs, state transitions) rather than implementation details.

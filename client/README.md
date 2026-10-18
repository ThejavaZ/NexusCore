# NexusCore Client

Frontend de NexusCore — plataforma de comercio y operaciones.

## Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TypeScript strict
- **Estilos:** Tailwind CSS 4
- **Estado:** Zustand (client) · TanStack Query (server, por implementar)
- **Formularios:** React Hook Form + Zod (por implementar)

## Desarrollo

```bash
pnpm install
cp .env.example .env.local
pnpm dev  # http://localhost:3000
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Verificación de tipos TypeScript |

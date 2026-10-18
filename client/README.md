# NexusCore Client

Frontend de NexusCore — plataforma de comercio y operaciones.

## Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TypeScript strict
- **Estilos:** Tailwind CSS 4
- **Estado:** Zustand (auth, carrito, tema)
- **Gráficas:** Recharts
- **Toasts:** Sonner

## Desarrollo

```bash
npm install
cp .env.example .env.local
npm run dev  # http://localhost:3000
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm test` | Tests con Vitest |

# NexusCore

> **Plataforma de Comercio y Operaciones** — catálogo, inventario, ventas, reparaciones y gestión administrativa en una sola plataforma.

[![CI](https://github.com/ThejavaZ/NexusCore/actions/workflows/ci.yml/badge.svg)](https://github.com/ThejavaZ/NexusCore/actions/workflows/ci.yml)
![PHP](https://img.shields.io/badge/PHP-8.4-777BB4?logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-87%20Pest%20%2B%2013%20Vitest-fd4a5a?logo=pestphp&logoColor=white)

---

## Qué es

NexusCore es una plataforma full-stack que combina un **e-commerce** público con un **ERP interno**:

- **Storefront**: catálogo con búsqueda y filtros, carrito, registro de clientes.
- **ERP**: dashboard con KPIs, CRUD de productos/categorías, ventas con control de stock, reparaciones con historial de estados, gestión de usuarios.
- **API**: REST versionada (`/api/v1`), autenticación Bearer con Sanctum, autorización por roles.

> **Historia**: comenzó como proyecto académico multi-equipo (*AriaTechShop-ERP*). La auditoría inicial reveló auth decorativa, dominio duplicado y 0 tests. Este repo documenta el refactor completo bajo dirección técnica única.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| **Backend** | Laravel 12 · PHP 8.4 · Sanctum · Pest |
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 |
| **Estado** | Zustand |
| **Testing** | Pest (87) · Vitest (13) |
| **CI** | GitHub Actions · Pint · PHPStan (nivel 5) · ESLint |
| **DB** | MySQL 8 / SQLite (dev + CI) |

---

## Estructura

```
nexuscore/
├── server/                  # API Laravel (100% API, sin Blade/Livewire)
│   ├── app/
│   │   ├── Enums/           # UserRole, PaymentMethod, RepairStatus, StockMovementType
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   # Auth, Product, Category, Sale, Repair, User, Notification
│   │   │   └── Middleware/        # EnsureUserRole (role:admin,staff)
│   │   ├── Models/          # User, Product, Category, Sale, SaleDetail, Repair, StockMovement
│   │   └── Services/        # EmailApiService (Resend)
│   ├── database/
│   │   ├── factories/       # User, Product, Category, Sale, Repair
│   │   ├── migrations/      # 11 migraciones limpias
│   │   └── seeders/         # DatabaseSeeder, ProductSeeder, RepairSeeder
│   ├── routes/api.php       # /api/v1/*
│   └── tests/               # 87 tests Pest (Feature + Unit)
│
├── client/                   # Next.js App Router
│   ├── app/
│   │   ├── page.tsx          # Home público
│   │   ├── products/         # Catálogo con búsqueda/filtros
│   │   ├── login/ register/  # Auth
│   │   ├── dashboard/        # ERP (layout protegido por rol)
│   │   └── profile/          # Perfil de usuario
│   ├── components/           # Header, Footer
│   ├── hooks/                # useMounted (SSR-safe)
│   ├── store/                # useAuthStore, useCartStore (Zustand)
│   ├── utils/                # api.ts (client tipado con Bearer)
│   └── tests/                # 13 tests Vitest
│
└── .github/workflows/ci.yml  # Pipeline: Pint+PHPStan+Pest / ESLint+TS+Vitest+Build
```

---

## Inicio Rápido

### Requisitos
- PHP 8.4+ · Composer
- Node.js 20+ · npm

### Backend

```bash
cd server
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate:fresh --seed
php artisan serve          # http://localhost:8000
```

### Frontend

```bash
cd client
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev                # http://localhost:3000
```

### Cuentas de prueba (seed)

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@nexuscore.dev | password |
| Staff | staff@nexuscore.dev | password |

---

## API

Base URL: `http://localhost:8000/api/v1`

### Públicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Login → Bearer token |
| POST | `/auth/register` | Registro de cliente |
| GET | `/products` | Catálogo (paginado, búsqueda, categoría, precio mín/máx, orden) |
| GET | `/products/{slug}` | Detalle de producto |
| GET | `/categories` | Categorías activas |
| POST | `/orders` | Checkout como invitado (throttle 10/min) |
| GET | `/orders/by-session/{session_id}` | Consulta pública de pedido por sesión de pago |
| POST | `/payments/fake/confirm` | Confirmar pago simulado (solo `PAYMENT_DRIVER=fake`) |
| POST | `/stripe/webhook` | Webhook de Stripe (firma verificada) |

### Autenticados (Staff + Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/auth/me` | Usuario actual |
| POST | `/auth/logout` | Revocar token |
| PUT | `/auth/change-password` | Cambiar contraseña |
| GET | `/admin/products` | Listado completo (con inactivos) |
| POST | `/admin/products` | Crear producto |
| PUT | `/admin/products/{id}` | Actualizar producto |
| DELETE | `/admin/products/{id}` | Desactivar producto |
| POST | `/admin/products/{id}/adjust-stock` | Ajuste manual de stock |
| POST | `/admin/products/{id}/image` | Subir imagen (JPG/PNG/WebP/AVIF, 2 MB) |
| DELETE | `/admin/products/{id}/image` | Quitar imagen |
| GET | `/admin/stock-movements` | Historial de movimientos de stock |
| GET | `/admin/categories` | Listado de categorías (con conteo) |
| POST | `/admin/categories` | Crear categoría |
| PUT | `/admin/categories/{id}` | Actualizar categoría |
| DELETE | `/admin/categories/{id}` | Eliminar categoría |
| GET | `/sales` | Listado de ventas |
| POST | `/sales` | Registrar venta (descuenta stock) |
| GET | `/sales/summary` | KPIs del dashboard |
| GET | `/sales/chart` | Datos para gráfico |
| GET | `/repairs` | Listado de reparaciones |
| POST | `/repairs` | Registrar reparación |
| POST | `/repairs/{id}/change-status` | Cambiar estado (genera historial) |
| GET | `/repairs/summary` | Conteo por estado |

### Solo Admin

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET/POST/PUT/DELETE | `/users` | Gestión de usuarios |

### Ejemplo: Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexuscore.dev","password":"password"}'
```

```json
{
  "user": { "id": 1, "name": "Admin", "role": "admin" },
  "access_token": "1|abc...",
  "token_type": "Bearer"
}
```

---

## Decisiones Técnicas

| Decisión | Razón |
|----------|-------|
| **API-only** (sin Blade/Livewire) | Frontend independiente, despliegue separado, contratos claros |
| **Sanctum Bearer** | Simple para SPA/mobile, sin cookies CSRF |
| **Backed Enums** | Type-safe en PHP + TypeScript, autocompletado, validación limpia |
| **Middleware de roles** | Un solo punto de control, testeable, legible en rutas |
| **`DB::transaction` + `lockForUpdate`** | Ventas y ajustes de stock atómicos, sin condiciones de carrera |
| **Respuestas `success/data`** | Contrato uniforme para el frontend |
| **SQLite en CI** | Sin dependencia de servicios externos, más rápido |

---

## Quality

```bash
# Backend
cd server
php artisan test              # 87 tests, 168 assertions
vendor/bin/pint --test        # Code style
vendor/bin/phpstan analyse    # Static analysis nivel 5

# Frontend
cd client
npm test                      # 13 tests Vitest
npm run lint                  # ESLint 0 errores
npm run typecheck             # TypeScript estricto
npm run build                 # Next.js build
```

---

## Roadmap

- [x] Sprint 00 — Auditoría
- [x] Sprint 01 — Limpieza y herramientas de calidad
- [x] Sprint 02 — Modelo de dominio unificado
- [x] Sprint 03 — Auth hardening con roles
- [x] Sprint 04 — Catálogo CRUD completo
- [x] Sprint 05 — Sales/Repairs endpoints
- [x] Sprint 06 — Frontend rebranding + dashboard
- [x] Sprint 07 — Suite de tests completa
- [x] Sprint 08 — CI/CD pipeline
- [x] Sprint 09 — Pulido portfolio (UI kit, dark mode, dashboard, storefront)
- [ ] Sprint 10 — Experiencia de compra completa *(en curso)*
  - [x] Checkout como invitado con facturación (cantidades, IVA)
  - [x] Pagos online (Stripe modo test o simulación local)
  - [ ] SEO técnico (metadata, JSON-LD, sitemap)
  - [ ] Mis pedidos, cupones, favoritos y reseñas
  - [ ] Facturas PDF, exportes CSV y métricas avanzadas
  - [ ] E2E con Playwright y despliegue

---

## Licencia

MIT

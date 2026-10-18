# NexusCore

> **Plataforma de Comercio y Operaciones** — un sistema que integra catálogo, inventario, ventas, reparaciones y gestión administrativa en una sola plataforma.

> **Nota:** este proyecto fue desarrollado originalmente como un proyecto académico multi-equipo bajo el nombre *AriaTechShop-ERP*. Tras finalizar la materia, se sometió a una auditoría técnica completa y se está refactorizando desde cero bajo una dirección técnica única. El historial git conserva los orígenes; el código actual representa la nueva arquitectura.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Laravel 12 · PHP 8.2+ · Sanctum (API tokens) · Pest (testing) |
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 |
| **Estado** | Zustand (client) · TanStack Query (server) |
| **Formularios** | React Hook Form + Zod |
| **Base de datos** | MySQL 8 / SQLite (dev) |
| **CI/CD** | GitHub Actions · Pint · PHPStan · Playwright |

---

## Arquitectura

```
nexuscore/
├── server/                  # API Laravel (100% API, sin Blade/Livewire)
│   ├── app/
│   │   ├── Actions/          # Operaciones de negocio transaccionales
│   │   ├── Enums/            # Backed Enums (roles, estados, tipos)
│   │   ├── Exceptions/       # Excepciones custom + handler
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/
│   │   │   ├── Requests/     # Form Requests (validación + auth)
│   │   │   └── Resources/    # API Resources (contratos de respuesta)
│   │   ├── Models/           # Eloquent Models
│   │   ├── Notifications/    # Laravel Notifications (coladas)
│   │   ├── Policies/         # Autorización por recurso
│   │   └── Services/         # Lógica transversal justificada
│   ├── database/
│   │   ├── factories/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/api.php        # /api/v1/*
│   └── tests/                # Pest: Feature + Unit
│
├── client/                   # Next.js App Router
│   ├── app/
│   │   ├── (storefront)/     # /  /products  /cart  /checkout
│   │   └── (admin)/          # /admin/*  dashboard, products, sales...
│   ├── components/           # UI kit compartido (Button, Table, etc.)
│   ├── features/             # Módulos: auth, catalog, cart, sales...
│   ├── lib/                  # API client, utils
│   ├── stores/               # Zustand stores
│   └── types/                # Tipos TypeScript compartidos
│
└── docs/                     # ADRs, diagramas, guías
```

### Principios de Diseño

1. **API-first**: el backend es una API REST versionada (`/api/v1`); el frontend es un cliente más.
2. **Lógica en el servidor**: totales, stock y reglas comerciales se calculan en Actions, nunca en el cliente.
3. **Autorización verificable**: Policies en cada recurso; roles `admin`/`staff`/`customer` con permisos explícitos.
4. **Transacciones atómicas**: operaciones multi-tabla (venta + detalle + stock) se ejecutan dentro de `DB::transaction` con `lockForUpdate`.
5. **Contratos tipados**: API Resources definen la forma de cada respuesta; TypeScript los refleja en el cliente.
6. **Tests desde el día uno**: cada Action, Policy y endpoint crítico tiene cobertura antes de merge.

---

## Plan de Sprints

El refactor se ejecuta en sprints secuenciales. Cada sprint tiene entregables claros y criterios de aceptación verificables.

---

### Sprint 00 — Auditoría y Línea Base

**Objetivo:** Diagnóstico completo del estado actual. Entender qué existe, qué funciona, qué está roto y por qué.

- [x] Inventario de archivos, dependencias y módulos (backend + frontend)
- [x] Revisión de migraciones, modelos, controladores y rutas
- [x] Identificación de errores reproducibles y código duplicado
- [x] Diagnóstico priorizado (P0 seguridad, P1 funcionalidad, P2 arquitectura, P3 calidad)

**Entregable:** Documento de auditoría con lista priorizada de problemas y métricas de código.

---

### Sprint 01 — Fundamentos y Calidad

**Objetivo:** Purgar código muerto, establecer herramientas de calidad y definir la dirección técnica.

- [ ] Eliminar Blade, Livewire, rutas web, código muerto (~500 LOC)
- [ ] Configurar Pint (formato) + PHPStan (análisis estático)
- [ ] Completar `.env.example` con todas las variables requeridas
- [ ] Configurar CI: Pint, PHPStan, ESLint, `next build`
- [ ] Crear ADR (Architecture Decision Record) inicial
- [ ] Actualizar README con arquitectura real

**Criterio de aceptación:** `composer pint --test` pasa limpio. `phpstan analyse` sin errores. CI verde en PR.

---

### Sprint 02 — Modelo de Dominio y Persistencia

**Objetivo:** Diseñar el esquema de datos unificado que resuelva la duplicación y los bugs silenciosos.

- [ ] Unificar `inventories` + `products` + `categories` en módulo de catálogo
- [ ] Crear `stock_movements` para auditoría de inventario
- [ ] Corregir bug FK: `products.category_id` (hoy `integer()->constrained()` no crea nada)
- [ ] Reemplazar `enum()` nativos por Backed Enums + columnas `string`
- [ ] Añadir índices faltantes (`sales.sale_date`, `repairs.status`, `products.category_id`)
- [ ] Completar Factories y Seeders (catálogo variado, ventas históricas, reparaciones)
- [ ] Ejecutar `php artisan migrate:fresh --seed` y verificar integridad

**Criterio de aceptación:** Todas las FK existen. Seeders crean datos consistentes. No hay columnas `enum()` nativos.

---

### Sprint 03 — Identidad y Acceso

**Objetivo:** Autenticación real con tokens, autorización por rol y protección de recursos.

- [ ] Implementar `createToken()` en login (hoy Sanctum decorativo)
- [ ] `POST /api/v1/auth/login` + `POST /api/v1/auth/logout` con throttle
- [ ] Backed Enums: `UserRole` (admin, staff, customer)
- [ ] Policies: `ProductPolicy`, `SalePolicy`, `RepairPolicy`, `UserPolicy`
- [ ] Middleware `role:admin` para rutas administrativas
- [ ] Tests: acceso permitido y denegado por rol en cada recurso

**Criterio de aceptación:** Login devuelve token. Token autentica en rutas protegidas. Un `customer` no puede acceder a `/admin/*`. Tests de autorización pasan.

---

### Sprint 04 — Catálogo e Inventario

**Objetivo:** CRUD de productos/categorías con validación robusta, respuestas consistentes y movimiento de stock.

- [ ] Form Requests para Product y Category
- [ ] API Resources para Product, Category (contratos tipados)
- [ ] Endpoints: `GET/POST/PUT/DELETE /api/v1/products`, `/categories`
- [ ] Búsqueda, filtros (`?category=`, `?in_stock=`), paginación
- [ ] `AdjustStock` y `RegisterStock` Actions (transacción + `lockForUpdate`)
- [ ] Endpoint `GET /api/v1/stock-movements` con filtros
- [ ] Tests: CRUD completo, validación, movimiento de stock atómico

**Criterio de aceptación:** Crear producto valida todos los campos. Ajustar stock genera movimiento en `stock_movements`. Dos ajustes concurrentes no pierden stock.

---

### Sprint 05 — Ventas y Reparaciones

**Objetivo:** Ciclo de vida completo de venta y reparación con invariantes de negocio.

- [ ] `CreateSale` Action: detalle + totales + descuento de stock (transacción)
- [ ] `ChangeRepairStatus` Action: cambio + historial + notificación
- [ ] Form Requests + API Resources para Sale y Repair
- [ ] Notifications coladas para emails (reemplazar código inline)
- [ ] `generateRepairNumber` seguro (retry en transacción)
- [ ] Endpoints: `GET /api/v1/sales/chart` (datos para dashboard)
- [ ] Tests: venta descuenta stock, totales correctos, cambio de estado genera historial

**Criterio de aceptación:** Crear una venta con 3 productos decrementa stock y genera 3 `stock_movements`. Cambiar estado de reparación genera `RepairStatusHistory`. Los emails se envían por cola (no sincrónicos).

---

### Sprint 06 — Frontend: Cimientos y Storefront

**Objetivo:** API client tipado, auth end-to-end, storefront funcional con carrito y checkout.

- [ ] `types/api.ts` con interfaces del backend (eliminar `any`)
- [ ] Cliente API: Bearer token, manejo 401, discriminated union
- [ ] TanStack Query para datos del servidor
- [ ] React Hook Form + Zod sincronizado con reglas Laravel
- [ ] UI kit: Button, Input, Card, Badge, Table, Spinner, Modal
- [ ] Auth end-to-end: login → token → rutas protegidas
- [ ] Storefront: home, `/products` (filtros), `/cart` (cantidades), `/checkout`
- [ ] Dark mode, responsive, `next/image`

**Criterio de aceptación:** Login funciona contra API real. Carrito muestra cantidad correcta. Checkout crea venta en backend. No hay `any` en el código TypeScript.

---

### Sprint 07 — Frontend: Dashboard ERP

**Objetivo:** Paneles administrativos completos que reemplazan Blade/Livewire.

- [ ] Layout admin con guard por rol
- [ ] `/admin` dashboard: KPIs + chart de ventas (recharts)
- [ ] `/admin/products`: CRUD con tabla paginada
- [ ] `/admin/categories`: CRUD
- [ ] `/admin/inventory`: ajustes + historial de movimientos
- [ ] `/admin/sales`: listado + creación con líneas
- [ ] `/admin/repairs`: lista filtros + detalle + cambio estado
- [ ] `/admin/users`: CRUD con roles
- [ ] Estados vacíos, skeletons, errores en cada pantalla

**Criterio de aceptación:** Admin puede crear producto, registrar venta y ver stock decrementado. Cambiar estado de reparación actualiza UI y envía notificación.

---

### Sprint 08 — Testing y CI

**Objetivo:** Cobertura >70% en endpoints críticos, e2e completo, CI que garantiza calidad.

- [ ] Pest: tests de integración para todos los Actions y endpoints
- [ ] Tests de Policies (autorización por rol)
- [ ] Vitest + Testing Library: stores, API client, formularios
- [ ] Playwright: `login → catálogo → carrito → checkout`
- [ ] Playwright: `admin → producto → venta → stock`
- [ ] CI: Pint, PHPStan, ESLint, Pest, Vitest, `next build`, Playwright
- [ ] Coverage report configurado

**Criterio de aceptación:** `php artisan test --coverage` >70% en `app/Actions` y `app/Http`. Playwright pasa end-to-end. CI bloquea merge si algo falla.

---

### Sprint 09 — Portafolio y Publicación

**Objetivo:** Documentación profesional, demo desplegada, retrospectiva técnica.

- [ ] README completo: arquitectura, screenshots, setup, decisiones
- [ ] ADRs documentados (por qué API pura, por qué Actions, por qué Enums)
- [ ] Diagrama de arquitectura (Mermaid o imagen)
- [ ] Guía de API (endpoints, request/response examples)
- [ ] Desplegar demo (Netlify/Vercel + backend en Railway/Render)
- [ ] Capturas de pantalla de cada módulo
- [ ] Retrospectiva: qué se aprendió del refactor

**Criterio de aceptación:** Un reclutador puede clonar el repo, leer el README y entender qué hace, cómo se usa y por qué está diseñado así. Demo accesible públicamente.

---

## Requisitos Previos

- PHP 8.2+
- Composer
- Node.js 20+
- pnpm
- MySQL 8 (o SQLite para desarrollo rápido)

## Instalación Rápida

```bash
# Backend
cd server
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve  # http://localhost:8000

# Frontend
cd client
pnpm install
cp .env.example .env.local
pnpm dev  # http://localhost:3000
```

---

## Historial

Este proyecto comenzó como un proyecto académico en equipo. La auditoría inicial reveló:

- API sin autenticar en endpoints críticos
- Sanctum instalado pero sin `createToken()` (auth decorativa)
- Dominio duplicado: `inventories` + `products` + `categories` como string libre
- Lógica de negocio en controladores (530 LOC en un solo archivo)
- 0 Form Requests, 0 Policies, 0 API Resources
- Frontend sin tipos (`any`), 15+ rutas rotas, 0 tests
- Bug silencioso: FK de `products.category_id` no existía

El refactor documentado en este README representa la transformación de ese código en una arquitectura mantenible, testeada y preparada para producción.

---

## Licencia

MIT

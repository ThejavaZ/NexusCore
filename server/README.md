# NexusCore Server

API REST backend de NexusCore — plataforma de comercio y operaciones.

## Stack

- **Framework:** Laravel 12 · PHP 8.2+
- **Auth:** Laravel Sanctum (Bearer tokens)
- **Testing:** Pest v3
- **Code Style:** Laravel Pint
- **Static Analysis:** PHPStan + Larastan

## Arquitectura

```
app/
├── Enums/              # Backed Enums (Sprint 02)
├── Exceptions/         # Excepciones custom
├── Http/
│   ├── Controllers/Api/V1/  # Controladores API
│   ├── Requests/       # Form Requests (Sprint 02)
│   └── Resources/      # API Resources (Sprint 02)
├── Models/             # Eloquent Models
├── Notifications/      # Laravel Notifications (queued)
├── Policies/           # Autorización (Sprint 03)
└── Services/           # Lógica transversal
```

## Desarrollo

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate:fresh --seed
composer dev  # serve + queue + pail
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `composer dev` | Servidor + queue listener + pail |
| `composer test` | Ejecutar suite Pest |
| `composer lint` | Formatear código con Pint |
| `composer lint:test` | Verificar estilo sin modificar |
| `composer analyse` | Análisis estático PHPStan |

## API

Todas las rutas están bajo `/api/v1`. Autenticación vía Bearer token.

### Público

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Login (throttle 5/min) |
| POST | `/api/v1/auth/register` | Registro (throttle 5/min) |
| GET | `/api/v1/products` | Catálogo de productos |
| GET | `/api/v1/products/{slug}` | Detalle de producto |
| GET | `/api/v1/categories` | Categorías activas |

### Autenticado

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/logout` | Revocar token |
| GET | `/api/v1/auth/me` | Usuario actual |
| GET/POST | `/api/v1/users` | CRUD usuarios |
| GET/POST | `/api/v1/sales` | CRUD ventas |
| GET | `/api/v1/sales/chart` | Datos para dashboard |
| GET/POST | `/api/v1/repairs` | CRUD reparaciones |
| POST | `/api/v1/repairs/{id}/change-status` | Cambiar estado |

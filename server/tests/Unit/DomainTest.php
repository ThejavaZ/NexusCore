<?php

use App\Enums\PaymentMethod;
use App\Enums\RepairStatus;
use App\Enums\StockMovementType;
use App\Enums\UserRole;
use App\Models\Product;
use App\Models\Repair;
use App\Models\Sale;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Enums
|--------------------------------------------------------------------------
*/

test('UserRole tiene los valores correctos', function () {
    expect(UserRole::Admin->value)->toBe('admin');
    expect(UserRole::Staff->value)->toBe('staff');
    expect(UserRole::Customer->value)->toBe('customer');
});

test('PaymentMethod tiene los valores correctos', function () {
    expect(PaymentMethod::Cash->value)->toBe('cash');
    expect(PaymentMethod::Card->value)->toBe('card');
    expect(PaymentMethod::Transfer->value)->toBe('transfer');
});

test('RepairStatus tiene los 7 estados', function () {
    expect(RepairStatus::cases())->toHaveCount(7);
    expect(RepairStatus::Pending->value)->toBe('pending');
    expect(RepairStatus::Delivered->value)->toBe('delivered');
});

test('StockMovementType determina entradas correctamente', function () {
    expect(StockMovementType::Initial->isEntry())->toBeTrue();
    expect(StockMovementType::Purchase->isEntry())->toBeTrue();
    expect(StockMovementType::Restock->isEntry())->toBeTrue();
    expect(StockMovementType::Sale->isEntry())->toBeFalse();
    expect(StockMovementType::Adjustment->isEntry())->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Sale
|--------------------------------------------------------------------------
*/

test('Sale genera número de factura secuencial', function () {
    Sale::factory()->create(['invoice_number' => 'INV-00042']);

    expect(Sale::generateInvoiceNumber())->toBe('INV-00043');
});

test('Sale genera primera factura si no hay datos', function () {
    expect(Sale::generateInvoiceNumber())->toBe('INV-00001');
});

/*
|--------------------------------------------------------------------------
| Repair
|--------------------------------------------------------------------------
*/

test('Repair genera número secuencial', function () {
    Repair::factory()->create(['repair_number' => 'RRP-00100']);

    expect(Repair::generateRepairNumber())->toBe('RRP-00101');
});

test('Repair genera primera orden si no hay datos', function () {
    expect(Repair::generateRepairNumber())->toBe('RRP-00001');
});

test('Repair scope pending filtra correctamente', function () {
    Repair::factory()->pending()->count(2)->create();
    Repair::factory()->completed()->create();

    expect(Repair::pending()->count())->toBe(2);
});

test('Repair scope inProgress incluye diagnosed, approved, in_progress', function () {
    Repair::factory()->create(['status' => RepairStatus::Diagnosed]);
    Repair::factory()->create(['status' => RepairStatus::Approved]);
    Repair::factory()->create(['status' => RepairStatus::InProgress]);
    Repair::factory()->pending()->create();

    expect(Repair::inProgress()->count())->toBe(3);
});

/*
|--------------------------------------------------------------------------
| Product
|--------------------------------------------------------------------------
*/

test('Product scope lowStock detecta stock bajo', function () {
    Product::factory()->create(['stock' => 1, 'min_stock' => 5]);
    Product::factory()->create(['stock' => 50, 'min_stock' => 5]);

    expect(Product::lowStock()->count())->toBe(1);
});

test('Product hasLowStock devuelve true cuando stock <= min', function () {
    $product = Product::factory()->make(['stock' => 2, 'min_stock' => 5]);

    expect($product->hasLowStock())->toBeTrue();
});

test('Product scope active excluye inactivos', function () {
    Product::factory()->create(['is_active' => true]);
    Product::factory()->inactive()->create();

    expect(Product::active()->count())->toBe(1);
});

/*
|--------------------------------------------------------------------------
| User
|--------------------------------------------------------------------------
*/

test('User isAdmin solo para rol admin', function () {
    expect(User::factory()->admin()->create()->isAdmin())->toBeTrue();
    expect(User::factory()->staff()->create()->isAdmin())->toBeFalse();
    expect(User::factory()->create()->isAdmin())->toBeFalse();
});

test('User isStaff para admin y staff', function () {
    expect(User::factory()->admin()->create()->isStaff())->toBeTrue();
    expect(User::factory()->staff()->create()->isStaff())->toBeTrue();
    expect(User::factory()->create()->isStaff())->toBeFalse();
});

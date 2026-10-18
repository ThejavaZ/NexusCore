<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\FakePaymentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RepairController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| NexusCore API v1
|--------------------------------------------------------------------------
|
| All endpoints are prefixed with /api/v1. Authentication uses Sanctum
| Bearer tokens. Public routes (catalog, auth) are listed first.
|
*/

Route::prefix('v1')->group(function () {

    /*
    | Public: Authentication
    */
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');

    /*
    | Public: Catalog (storefront)
    */
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{slug}', [ProductController::class, 'show']);
    Route::get('categories', [CategoryController::class, 'index']);

    /*
    | Public: storefront checkout (guest or authenticated)
    */
    Route::post('orders', [SaleController::class, 'store'])->middleware('throttle:10,1');
    Route::get('orders/by-session/{sessionId}', [SaleController::class, 'bySession']);
    Route::get('coupons/validate', [CouponController::class, 'validateCoupon'])->middleware('throttle:20,1');
    Route::post('payments/fake/confirm', [FakePaymentController::class, 'confirm'])->middleware('throttle:10,1');
    Route::post('stripe/webhook', [StripeWebhookController::class, 'handle']);

    /*
    | Protected: authenticated via Sanctum Bearer token
    */
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::put('auth/change-password', [AuthController::class, 'changePassword']);

        /*
        | Authenticated customer — pedidos propios
        */
        Route::get('orders/mine', [SaleController::class, 'mine']);
        Route::get('orders/mine/{sale}', [SaleController::class, 'mineShow']);

        /*
        | Admin only — user management
        */
        Route::middleware('role:admin')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::apiResource('admin/coupons', CouponController::class);
        });

        /*
        | Staff + Admin — catalog management, sales, repairs, notifications
        */
        Route::middleware('role:admin,staff')->group(function () {
            /*
            | Catalog CRUD
            */
            Route::get('admin/products', [ProductController::class, 'adminIndex']);
            Route::get('admin/products/{product}', [ProductController::class, 'showById']);
            Route::post('admin/products', [ProductController::class, 'store']);
            Route::put('admin/products/{product}', [ProductController::class, 'update']);
            Route::delete('admin/products/{product}', [ProductController::class, 'destroy']);
            Route::post('admin/products/{product}/adjust-stock', [ProductController::class, 'adjustStock']);
            Route::post('admin/products/{product}/image', [ProductController::class, 'uploadImage']);
            Route::delete('admin/products/{product}/image', [ProductController::class, 'removeImage']);
            Route::get('admin/stock-movements', [StockMovementController::class, 'index']);

            Route::get('admin/categories', [CategoryController::class, 'adminIndex']);
            Route::post('admin/categories', [CategoryController::class, 'store']);
            Route::put('admin/categories/{category}', [CategoryController::class, 'update']);
            Route::delete('admin/categories/{category}', [CategoryController::class, 'destroy']);

            /*
            | Sales & Repairs
            */
            Route::get('sales/summary', [SaleController::class, 'summary'])->name('sales.summary');
            Route::get('sales/chart', [SaleController::class, 'chart'])->name('sales.chart');
            Route::apiResource('sales', SaleController::class)->only(['index', 'show', 'store']);
            Route::get('repairs/summary', [RepairController::class, 'summary'])->name('repairs.summary');
            Route::apiResource('repairs', RepairController::class);
            Route::post('repairs/{repair}/change-status', [RepairController::class, 'changeStatus'])
                ->name('repairs.change-status');

            /*
            | Notifications
            */
            Route::prefix('notifications')->group(function () {
                Route::post('welcome', [NotificationController::class, 'sendWelcome']);
                Route::post('order-confirmation', [NotificationController::class, 'sendOrderConfirmation']);
                Route::post('invoice', [NotificationController::class, 'sendInvoice']);
            });
        });
    });
});

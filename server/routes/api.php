<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RepairController;
use App\Http\Controllers\Api\SaleController;
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
    | Protected: authenticated via Sanctum Bearer token
    */
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        /*
        | Admin only — user management
        */
        Route::middleware('role:admin')->group(function () {
            Route::apiResource('users', UserController::class);
        });

        /*
        | Staff + Admin — sales, repairs, notifications
        */
        Route::middleware('role:admin,staff')->group(function () {
            Route::apiResource('sales', SaleController::class)->only(['index', 'show', 'store']);
            Route::get('sales/chart', [SaleController::class, 'chart'])->name('sales.chart');
            Route::apiResource('repairs', RepairController::class);
            Route::post('repairs/{repair}/change-status', [RepairController::class, 'changeStatus'])
                ->name('repairs.change-status');

            Route::prefix('notifications')->group(function () {
                Route::post('welcome', [NotificationController::class, 'sendWelcome']);
                Route::post('order-confirmation', [NotificationController::class, 'sendOrderConfirmation']);
                Route::post('invoice', [NotificationController::class, 'sendInvoice']);
            });
        });
    });
});

<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| NexusCore is an API-only backend. The web routes file only provides
| a health check endpoint. All UI lives in the Next.js client.
|
*/

Route::get('/up', function () {
    return response()->json(['status' => 'ok', 'app' => 'NexusCore']);
})->name('up');

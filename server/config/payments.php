<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Payment driver
    |--------------------------------------------------------------------------
    | 'stripe' real checkout en modo test · 'fake' simulación local demo.
    */
    'driver' => env('PAYMENT_DRIVER', 'stripe'),

    'currency' => env('STRIPE_CURRENCY', 'usd'),

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    /*
    | URL pública del frontend para success/cancel del checkout.
    */
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),

];

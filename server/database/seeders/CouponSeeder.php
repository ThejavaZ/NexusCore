<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::create([
            'code' => 'BIENVENIDO10',
            'type' => 'percent',
            'value' => 10,
            'is_active' => true,
        ]);

        Coupon::create([
            'code' => 'AHORRA50',
            'type' => 'fixed',
            'value' => 50,
            'min_amount' => 500,
            'is_active' => true,
        ]);
    }
}

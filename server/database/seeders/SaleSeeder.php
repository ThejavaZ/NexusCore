<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('sales')->insert([
            [
                'invoice_number' => 'INV-001',
                'sale_date' => now(),
                'customer_name' => 'Juan Perez',
                'customer_phone' => '5551234567',
                'customer_email' => 'juan@example.com',
                'subtotal' => 500,
                'tax_amount' => 80,
                'total_amount' => 580,
                'payment_method' => 'cash',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'invoice_number' => 'INV-002',
                'sale_date' => now(),
                'customer_name' => 'Maria Lopez',
                'customer_phone' => '5559876543',
                'customer_email' => 'maria@example.com',
                'subtotal' => 1000,
                'tax_amount' => 160,
                'total_amount' => 1160,
                'payment_method' => 'card',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

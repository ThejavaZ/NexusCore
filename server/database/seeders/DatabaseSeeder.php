<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Admin',
            'email' => 'admin@nexuscore.dev',
        ]);

        User::factory()->staff()->create([
            'name' => 'Staff',
            'email' => 'staff@nexuscore.dev',
        ]);

        $this->call([
            ProductSeeder::class,
            RepairSeeder::class,
            CouponSeeder::class,
        ]);
    }
}

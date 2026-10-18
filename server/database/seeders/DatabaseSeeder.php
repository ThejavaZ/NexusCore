<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@nexuscore.dev',
            'password' => Hash::make('password'),
            'role' => 1,
            'language' => 1,
            'status' => 1,
            'is_active' => true,
        ]);

        User::factory()->create([
            'name' => 'Staff',
            'email' => 'staff@nexuscore.dev',
            'password' => Hash::make('password'),
            'role' => 2,
            'is_active' => true,
        ]);

        $this->call([
            RepairSeeder::class,
            SaleSeeder::class,
        ]);
    }
}

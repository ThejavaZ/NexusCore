<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Repair;
use App\Models\RepairStatusHistory;
use App\Models\User;
use Illuminate\Database\Seeder;

class RepairSeeder extends Seeder
{
    public function run(): void
    {
        $technician1 = User::firstOrCreate(
            ['email' => 'tecnico1@nexuscore.dev'],
            [
                'name' => 'Carlos Técnico',
                'password' => bcrypt('password'),
                'role' => UserRole::Staff,
                'is_active' => true,
            ]
        );

        $technician2 = User::firstOrCreate(
            ['email' => 'tecnico2@nexuscore.dev'],
            [
                'name' => 'María Técnico',
                'password' => bcrypt('password'),
                'role' => UserRole::Staff,
                'is_active' => true,
            ]
        );

        // Crear reparaciones en diferentes estados

        // 5 Pendientes
        Repair::factory(5)->pending()->create()->each(function ($repair) {
            RepairStatusHistory::create([
                'repair_id' => $repair->id,
                'status_to' => 'pending',
                'notes' => 'Reparación registrada en el sistema',
                'changed_by' => null,
            ]);
        });

        // 3 Diagnosticadas
        Repair::factory(3)->create(['status' => 'diagnosed'])->each(function ($repair) {
            RepairStatusHistory::create([
                'repair_id' => $repair->id,
                'status_to' => 'pending',
                'notes' => 'Reparación registrada',
            ]);
            RepairStatusHistory::create([
                'repair_id' => $repair->id,
                'status_from' => 'pending',
                'status_to' => 'diagnosed',
                'notes' => 'Diagnóstico completado',
                'changed_by' => User::inRandomOrder()->first()->id,
            ]);
        });

        // 4 En progreso
        Repair::factory(4)->inProgress()->create()->each(function ($repair) {
            RepairStatusHistory::create([
                'repair_id' => $repair->id,
                'status_to' => 'pending',
                'notes' => 'Reparación registrada',
            ]);
            RepairStatusHistory::create([
                'repair_id' => $repair->id,
                'status_from' => 'pending',
                'status_to' => 'in_progress',
                'notes' => 'Iniciando reparación',
                'changed_by' => $repair->assigned_to,
            ]);
        });

        // 5 Completadas
        Repair::factory(5)->completed()->create()->each(function ($repair) {
            RepairStatusHistory::create([
                'repair_id' => $repair->id,
                'status_to' => 'pending',
                'notes' => 'Reparación registrada',
            ]);
            RepairStatusHistory::create([
                'repair_id' => $repair->id,
                'status_from' => 'pending',
                'status_to' => 'in_progress',
                'notes' => 'Iniciando reparación',
                'changed_by' => $repair->assigned_to,
            ]);
            RepairStatusHistory::create([
                'repair_id' => $repair->id,
                'status_from' => 'in_progress',
                'status_to' => 'completed',
                'notes' => 'Reparación finalizada exitosamente',
                'changed_by' => $repair->assigned_to,
            ]);
        });

        // 3 Entregadas
        Repair::factory(3)->delivered()->create()->each(function ($repair) {
            RepairStatusHistory::create([
                'repair_id' => $repair->id,
                'status_to' => 'pending',
                'notes' => 'Reparación registrada',
            ]);
            RepairStatusHistory::create([
                'repair_id' => $repair->id,
                'status_from' => 'pending',
                'status_to' => 'completed',
                'notes' => 'Reparación completada',
                'changed_by' => $repair->assigned_to,
            ]);
            RepairStatusHistory::create([
                'repair_id' => $repair->id,
                'status_from' => 'completed',
                'status_to' => 'delivered',
                'notes' => 'Equipo entregado al cliente',
                'changed_by' => $repair->assigned_to,
            ]);
        });

        $this->command->info('✅ Se crearon '.Repair::count().' reparaciones con su historial');
    }
}

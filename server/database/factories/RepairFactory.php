<?php

namespace Database\Factories;

use App\Enums\RepairStatus;
use App\Models\Repair;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RepairFactory extends Factory
{
    protected $model = Repair::class;

    public function definition(): array
    {
        $deviceTypes = ['Laptop', 'Desktop', 'Tablet', 'Smartphone', 'Monitor', 'Impresora'];
        $brands = ['Dell', 'HP', 'Lenovo', 'Apple', 'Samsung', 'Asus', 'Acer'];
        $statuses = RepairStatus::cases();

        $status = fake()->randomElement($statuses);
        $receivedAt = fake()->dateTimeBetween('-30 days', 'now');

        return [
            'repair_number' => 'RRP-'.str_pad(fake()->unique()->numberBetween(1, 9999), 5, '0', STR_PAD_LEFT),
            'user_id' => null,
            'customer_name' => fake()->name(),
            'customer_email' => fake()->email(),
            'customer_phone' => fake()->phoneNumber(),
            'device_type' => fake()->randomElement($deviceTypes),
            'brand' => fake()->randomElement($brands),
            'model' => fake()->bothify('Model-###??'),
            'serial_number' => fake()->bothify('SN-########'),
            'issue_description' => fake()->randomElement([
                'No enciende',
                'Pantalla rota',
                'Problema de batería',
                'No carga',
                'Sobrecalentamiento',
                'Lento',
                'Virus detectado',
                'Problema de audio',
                'Teclado dañado',
                'Puerto USB no funciona',
            ]),
            'technician_notes' => $status !== RepairStatus::Pending ? fake()->sentence(10) : null,
            'estimated_cost' => fake()->randomFloat(2, 50, 500),
            'final_cost' => in_array($status, [RepairStatus::Completed, RepairStatus::Delivered])
                ? fake()->randomFloat(2, 50, 500)
                : null,
            'status' => $status,
            'received_at' => $receivedAt,
            'estimated_delivery' => fake()->dateTimeBetween($receivedAt, '+15 days'),
            'delivered_at' => $status === RepairStatus::Delivered
                ? fake()->dateTimeBetween($receivedAt, 'now')
                : null,
            'assigned_to' => $status !== RepairStatus::Pending ? User::factory() : null,
            'customer_notified' => fake()->boolean(70),
            'last_notification_at' => fake()->boolean(70)
                ? fake()->dateTimeBetween($receivedAt, 'now')
                : null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => RepairStatus::Pending,
            'technician_notes' => null,
            'final_cost' => null,
            'assigned_to' => null,
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn () => [
            'status' => RepairStatus::InProgress,
            'assigned_to' => User::factory(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => RepairStatus::Completed,
            'final_cost' => fake()->randomFloat(2, 50, 500),
            'assigned_to' => User::factory(),
        ]);
    }

    public function delivered(): static
    {
        return $this->state(fn () => [
            'status' => RepairStatus::Delivered,
            'final_cost' => fake()->randomFloat(2, 50, 500),
            'delivered_at' => fake()->dateTimeBetween('-10 days', 'now'),
            'assigned_to' => User::factory(),
        ]);
    }
}

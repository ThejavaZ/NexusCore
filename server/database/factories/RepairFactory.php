<?php

namespace Database\Factories;

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
        $statuses = ['pending', 'diagnosed', 'approved', 'in_progress', 'completed', 'delivered'];

        $status = $this->faker->randomElement($statuses);
        $receivedAt = $this->faker->dateTimeBetween('-30 days', 'now');

        return [
            'repair_number' => 'RRP-'.str_pad($this->faker->unique()->numberBetween(1, 9999), 5, '0', STR_PAD_LEFT),
            'user_id' => null,
            'customer_name' => $this->faker->name(),
            'customer_email' => $this->faker->email(),
            'customer_phone' => $this->faker->phoneNumber(),
            'device_type' => $this->faker->randomElement($deviceTypes),
            'brand' => $this->faker->randomElement($brands),
            'model' => $this->faker->bothify('Model-###??'),
            'serial_number' => $this->faker->bothify('SN-########'),
            'issue_description' => $this->faker->randomElement([
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
            'technician_notes' => $status !== 'pending' ? $this->faker->sentence(10) : null,
            'estimated_cost' => $this->faker->randomFloat(2, 50, 500),
            'final_cost' => in_array($status, ['completed', 'delivered']) ? $this->faker->randomFloat(2, 50, 500) : null,
            'status' => $status,
            'received_at' => $receivedAt,
            'estimated_delivery' => $this->faker->dateTimeBetween($receivedAt, '+15 days'),
            'delivered_at' => $status === 'delivered' ? $this->faker->dateTimeBetween($receivedAt, 'now') : null,
            'assigned_to' => $status !== 'pending' ? User::factory() : null,
            'customer_notified' => $this->faker->boolean(70),
            'last_notification_at' => $this->faker->boolean(70) ? $this->faker->dateTimeBetween($receivedAt, 'now') : null,
        ];
    }

    public function pending()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'technician_notes' => null,
            'final_cost' => null,
            'assigned_to' => null,
        ]);
    }

    public function inProgress()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'assigned_to' => User::factory(),
        ]);
    }

    public function completed()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'final_cost' => $this->faker->randomFloat(2, 50, 500),
            'assigned_to' => User::factory(),
        ]);
    }

    public function delivered()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'delivered',
            'final_cost' => $this->faker->randomFloat(2, 50, 500),
            'delivered_at' => $this->faker->dateTimeBetween('-10 days', 'now'),
            'assigned_to' => User::factory(),
        ]);
    }
}

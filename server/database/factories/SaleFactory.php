<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 100, 10000);
        $tax = round($subtotal * 0.16, 2);

        return [
            'invoice_number' => 'INV-'.str_pad((string) fake()->unique()->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT),
            'sale_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'customer_name' => fake()->name(),
            'customer_phone' => fake()->phoneNumber(),
            'customer_email' => fake()->email(),
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'total_amount' => $subtotal + $tax,
            'payment_method' => fake()->randomElement(PaymentMethod::cases()),
            'created_by' => User::factory()->staff(),
        ];
    }
}

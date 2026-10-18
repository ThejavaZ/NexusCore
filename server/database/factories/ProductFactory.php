<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'sku' => strtoupper(fake()->bothify('SKU-####??')),
            'description' => fake()->sentence(10),
            'category_id' => Category::factory(),
            'stock' => fake()->numberBetween(0, 100),
            'min_stock' => fake()->numberBetween(1, 10),
            'price' => fake()->randomFloat(2, 100, 50000),
            'cost' => fake()->randomFloat(2, 50, 40000),
            'image_url' => fake()->imageUrl(),
            'is_active' => true,
        ];
    }

    public function withStock(int $stock): static
    {
        return $this->state(fn () => ['stock' => $stock]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}

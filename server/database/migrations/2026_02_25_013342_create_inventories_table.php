<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inventories', function (Blueprint $table) {

            $table->id();

            // product name
            $table->string('name');

            // category (screen, battery, accessory, etc.)
            $table->string('category');

            // price
            $table->decimal('price', 10, 2);

            // quantity available
            $table->unsignedInteger('stock')->default(0);

            // optional description
            $table->text('description')->nullable();

            $table->timestamps();

            // index for faster searches
            $table->index('name');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};

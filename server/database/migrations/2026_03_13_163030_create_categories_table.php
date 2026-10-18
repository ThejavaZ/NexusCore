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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique(); // Ej: "Tarjetas de Video", "Procesadores"
            $table->string('slug')->unique();     // Ej: "tarjetas-de-video" (para las rutas de Next.js)
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);

            // Campos de auditoría coherentes con tus otros modelos
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->foreignId('deleted_by')->nullable()->constrained('users');

            $table->timestamps();
            $table->softDeletes(); // Para no borrar historial de ventas accidentalmente
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};

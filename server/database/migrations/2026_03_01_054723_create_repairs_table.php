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
        Schema::create('repairs', function (Blueprint $table) {
            $table->id();
            $table->string('repair_number')->unique(); // RRP-001
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Cliente
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');

            // Información del equipo
            $table->string('device_type'); // Laptop, Phone, Tablet, etc.
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();

            // Detalles de la reparación
            $table->text('issue_description');
            $table->text('technician_notes')->nullable();
            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->decimal('final_cost', 10, 2)->nullable();

            // Estado y fechas
            $table->enum('status', [
                'pending',      // Pendiente de revisión
                'diagnosed',    // Diagnosticado
                'approved',     // Aprobado por cliente
                'in_progress',  // En reparación
                'completed',    // Completado
                'delivered',    // Entregado
                'cancelled',     // Cancelado
            ])->default('pending');

            $table->date('received_at'); // Fecha de recepción
            $table->date('estimated_delivery')->nullable();
            $table->date('delivered_at')->nullable();

            // Control
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete(); // Técnico asignado
            $table->boolean('customer_notified')->default(false);
            $table->timestamp('last_notification_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repairs');
    }
};

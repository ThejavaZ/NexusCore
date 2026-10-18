<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->string('status', 30)->default('paid')->after('payment_method')->index();
            $table->string('stripe_session_id')->nullable()->unique()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['status', 'stripe_session_id']);
        });
    }
};

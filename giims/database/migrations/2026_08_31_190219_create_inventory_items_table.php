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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., 'Welding Electrodes', 'Multimeter'
            $table->string('sku')->unique()->nullable();
            $table->enum('category', ['consumable', 'fixed_asset']);
            $table->integer('quantity_in_stock')->default(0);
            $table->string('unit'); // e.g., 'pcs', 'kg', 'boxes'
            $table->integer('min_threshold')->default(5); // For low stock alerts
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};

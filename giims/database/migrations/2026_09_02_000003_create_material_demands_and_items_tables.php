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
        Schema::create('material_demands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('batches')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // teacher
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('demand_letter_text')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('demand_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_demand_id')->constrained('material_demands')->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->integer('requested_qty');
            $table->integer('approved_qty')->default(0);
            $table->integer('consumed_qty')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demand_items');
        Schema::dropIfExists('material_demands');
    }
};

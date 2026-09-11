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
        Schema::create('institutional_holidays', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('reason');
            $table->date('holiday_date');
            $table->date('end_date')->nullable();
            $table->string('scope')->default('all'); // all, specific_courses
            $table->json('course_ids')->nullable(); // JSON array of course IDs when scope is specific_courses
            $table->boolean('is_published')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('created_by_role')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institutional_holidays');
    }
};

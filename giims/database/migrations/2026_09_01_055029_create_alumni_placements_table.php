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
        Schema::create('alumni_placements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_profile_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->enum('employment_status', ['employed', 'self_employed', 'higher_education', 'unemployed']);
            $table->string('company_name')->nullable();
            $table->string('designation')->nullable();
            $table->string('location')->nullable(); // e.g., 'Rahim Yar Khan', 'Lahore', 'Dubai'
            $table->integer('monthly_salary')->nullable(); // Optional for stats
            $table->date('placement_date')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alumni_placements');
    }
};

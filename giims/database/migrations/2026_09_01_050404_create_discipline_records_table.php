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
        Schema::create('discipline_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_profile_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('reported_by')->constrained('users')->cascadeOnDelete(); // Teacher/Admin who reported it
            $table->string('title'); // e.g., 'Uniform Violation', 'Misconduct in Workshop'
            $table->text('description');
            $table->enum('severity', ['minor', 'major', 'critical']);
            $table->string('action_taken')->nullable(); // e.g., 'Verbal Warning', 'Parents Called', 'Suspended'
            $table->string('status')->default('open'); // open, resolved
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discipline_records');
    }
};

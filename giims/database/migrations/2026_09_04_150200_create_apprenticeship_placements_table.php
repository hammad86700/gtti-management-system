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
        Schema::create('apprenticeship_placements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_profile_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('enrollment_id')->nullable()->constrained('enrollments')->nullOnDelete();
            $table->string('company_name');
            $table->string('industry_sector')->default('Other');
            $table->string('supervisor_name');
            $table->string('supervisor_phone');
            $table->string('supervisor_email')->nullable();
            $table->decimal('stipend_amount', 10, 2)->default(0.00);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('placement_status', 30)->default('active'); // active, completed, terminated
            $table->boolean('tevta_registered')->default(false);
            $table->string('work_location')->nullable();
            $table->text('job_description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_profile_id', 'placement_status'], 'appr_place_profile_status_idx');
            $table->index('industry_sector');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apprenticeship_placements');
    }
};

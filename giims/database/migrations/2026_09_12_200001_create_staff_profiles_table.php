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
        Schema::create('staff_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('father_name');
            $table->string('cnic', 15)->unique();
            $table->string('phone');
            $table->string('emergency_contact')->nullable();
            $table->date('dob');
            $table->enum('gender', ['male', 'female', 'other'])->default('male');
            $table->string('designation');
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->enum('employment_type', ['regular', 'contract', 'visiting'])->default('regular');
            $table->decimal('salary_or_daily_rate', 10, 2)->nullable();
            $table->date('joining_date');
            $table->string('highest_qualification');
            $table->text('residential_address');
            $table->text('permanent_address')->nullable();
            $table->string('profile_photo_path')->nullable();
            $table->string('cnic_front_path')->nullable();
            $table->string('cnic_back_path')->nullable();
            $table->string('cv_resume_path')->nullable();
            $table->string('experience_certificate_path')->nullable();
            $table->enum('status', ['active', 'on_leave', 'resigned', 'terminated'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_profiles');
    }
};

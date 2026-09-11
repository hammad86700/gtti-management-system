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
        Schema::create('faculty_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('attendance_date');
            $table->time('check_in_time');
            $table->string('proof_image_path');
            $table->string('ip_address', 45);
            $table->boolean('is_ip_verified')->default(false);
            $table->enum('status', ['present', 'late'])->default('present');
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'attendance_date'], 'faculty_attendances_user_date_unique');
        });

        Schema::create('faculty_leaves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('leave_type', ['casual', 'medical', 'emergency', 'official_duty']);
            $table->date('start_date');
            $table->date('end_date');
            $table->text('reason');
            $table->string('attachment_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('actioned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('actioned_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faculty_leaves');
        Schema::dropIfExists('faculty_attendances');
    }
};

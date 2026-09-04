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
        // 1. Courses: Intake capacity limit and classes start date
        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'intake_capacity')) {
                $table->integer('intake_capacity')->default(50)->after('requires_entrance_test');
            }
            if (!Schema::hasColumn('courses', 'classes_start_date')) {
                $table->date('classes_start_date')->nullable()->after('intake_capacity');
            }
        });

        // 2. Applications: Paid challan receipt upload & classes commencement notice
        Schema::table('applications', function (Blueprint $table) {
            if (!Schema::hasColumn('applications', 'challan_receipt_path')) {
                $table->string('challan_receipt_path')->nullable()->after('fee_status');
            }
            if (!Schema::hasColumn('applications', 'challan_deposit_date')) {
                $table->date('challan_deposit_date')->nullable()->after('challan_receipt_path');
            }
            if (!Schema::hasColumn('applications', 'challan_bank_reference')) {
                $table->string('challan_bank_reference')->nullable()->after('challan_deposit_date');
            }
            if (!Schema::hasColumn('applications', 'challan_uploaded_at')) {
                $table->timestamp('challan_uploaded_at')->nullable()->after('challan_bank_reference');
            }
            if (!Schema::hasColumn('applications', 'classes_commencement_notice')) {
                $table->text('classes_commencement_notice')->nullable()->after('clerk_notice');
            }
        });

        // 3. Enrollments: Teacher LMS activation gate
        Schema::table('enrollments', function (Blueprint $table) {
            if (!Schema::hasColumn('enrollments', 'is_lms_active')) {
                $table->boolean('is_lms_active')->default(false)->after('status');
            }
            if (!Schema::hasColumn('enrollments', 'lms_activated_at')) {
                $table->timestamp('lms_activated_at')->nullable()->after('is_lms_active');
            }
            if (!Schema::hasColumn('enrollments', 'lms_activated_by')) {
                $table->foreignId('lms_activated_by')->nullable()->constrained('users')->nullOnDelete()->after('lms_activated_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['lms_activated_by']);
            $table->dropColumn(['is_lms_active', 'lms_activated_at', 'lms_activated_by']);
        });

        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'challan_receipt_path',
                'challan_deposit_date',
                'challan_bank_reference',
                'challan_uploaded_at',
                'classes_commencement_notice',
            ]);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['intake_capacity', 'classes_start_date']);
        });
    }
};

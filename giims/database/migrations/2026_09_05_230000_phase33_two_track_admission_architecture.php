<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Courses table updates
        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'capacity')) {
                $table->integer('capacity')->default(25)->after('requires_entrance_test');
            }
            if (!Schema::hasColumn('courses', 'is_admission_open')) {
                $table->boolean('is_admission_open')->default(true)->after('capacity');
            }
        });

        // Sync existing intake_capacity into capacity if intake_capacity exists
        if (Schema::hasColumn('courses', 'intake_capacity')) {
            DB::statement('UPDATE courses SET capacity = intake_capacity WHERE intake_capacity IS NOT NULL');
        }

        // 2. Fee Challans table updates
        Schema::table('fee_challans', function (Blueprint $table) {
            if (!Schema::hasColumn('fee_challans', 'receipt_image_path')) {
                $table->string('receipt_image_path')->nullable()->after('status');
            }
            if (!Schema::hasColumn('fee_challans', 'submission_notes')) {
                $table->text('submission_notes')->nullable()->after('receipt_image_path');
            }
            if (!Schema::hasColumn('fee_challans', 'verification_status')) {
                $table->string('verification_status')->default('unpaid')->after('submission_notes'); // unpaid, under_review, verified
            }
            if (!Schema::hasColumn('fee_challans', 'payment_deadline')) {
                $table->date('payment_deadline')->nullable()->after('verification_status');
            }
        });

        // 3. Merit Lists table updates
        Schema::table('merit_lists', function (Blueprint $table) {
            if (!Schema::hasColumn('merit_lists', 'is_publicly_visible')) {
                $table->boolean('is_publicly_visible')->default(false)->after('status');
            }
        });

        // 4. Applications table updates
        Schema::table('applications', function (Blueprint $table) {
            if (!Schema::hasColumn('applications', 'institutional_roll_number')) {
                $table->string('institutional_roll_number')->nullable()->after('entrance_roll_number');
            }
            if (!Schema::hasColumn('applications', 'admission_confirmed_at')) {
                $table->timestamp('admission_confirmed_at')->nullable()->after('scrutinized_at');
            }
        });

        // Mark existing published merit lists as publicly visible
        DB::statement("UPDATE merit_lists SET is_publicly_visible = 1 WHERE status = 'published'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $cols = [];
            foreach (['institutional_roll_number', 'admission_confirmed_at'] as $col) {
                if (Schema::hasColumn('applications', $col)) {
                    $cols[] = $col;
                }
            }
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });

        Schema::table('merit_lists', function (Blueprint $table) {
            if (Schema::hasColumn('merit_lists', 'is_publicly_visible')) {
                $table->dropColumn('is_publicly_visible');
            }
        });

        Schema::table('fee_challans', function (Blueprint $table) {
            $cols = [];
            foreach (['receipt_image_path', 'submission_notes', 'verification_status', 'payment_deadline'] as $col) {
                if (Schema::hasColumn('fee_challans', $col)) {
                    $cols[] = $col;
                }
            }
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });

        Schema::table('courses', function (Blueprint $table) {
            $cols = [];
            foreach (['capacity', 'is_admission_open'] as $col) {
                if (Schema::hasColumn('courses', $col)) {
                    $cols[] = $col;
                }
            }
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};

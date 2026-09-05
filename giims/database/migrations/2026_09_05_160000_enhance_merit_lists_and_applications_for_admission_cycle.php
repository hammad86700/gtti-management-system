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
        // 1. Enhance merit_lists table for file uploads, publication, and classes start date
        Schema::table('merit_lists', function (Blueprint $table) {
            if (Schema::hasColumn('merit_lists', 'admission_campaign_id')) {
                // Allow null campaign if standalone list
                $table->foreignId('admission_campaign_id')->nullable()->change();
            }
            if (!Schema::hasColumn('merit_lists', 'file_path')) {
                $table->string('file_path')->nullable()->after('title');
            }
            if (!Schema::hasColumn('merit_lists', 'file_name')) {
                $table->string('file_name')->nullable()->after('file_path');
            }
            if (!Schema::hasColumn('merit_lists', 'classes_start_date')) {
                $table->date('classes_start_date')->nullable()->after('file_name');
            }
            if (!Schema::hasColumn('merit_lists', 'uploaded_by')) {
                $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete()->after('classes_start_date');
            }
            if (!Schema::hasColumn('merit_lists', 'remarks')) {
                $table->text('remarks')->nullable()->after('uploaded_by');
            }
            if (!Schema::hasColumn('merit_lists', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('status');
            }
        });

        // 2. Enhance applications table for entrance roll number and clerk custom challan upload
        Schema::table('applications', function (Blueprint $table) {
            if (!Schema::hasColumn('applications', 'entrance_roll_number')) {
                $table->string('entrance_roll_number')->nullable()->after('application_number');
            }
            if (!Schema::hasColumn('applications', 'clerk_challan_path')) {
                $table->string('clerk_challan_path')->nullable()->after('challan_receipt_path');
            }
            if (!Schema::hasColumn('applications', 'clerk_challan_uploaded_at')) {
                $table->timestamp('clerk_challan_uploaded_at')->nullable()->after('clerk_challan_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['entrance_roll_number', 'clerk_challan_path', 'clerk_challan_uploaded_at']);
        });

        Schema::table('merit_lists', function (Blueprint $table) {
            $table->dropForeign(['uploaded_by']);
            $table->dropColumn(['file_path', 'file_name', 'classes_start_date', 'uploaded_by', 'remarks', 'published_at']);
        });
    }
};

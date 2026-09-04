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
        Schema::table('applications', function (Blueprint $table) {
            $table->date('test_date')->nullable()->after('status');
            $table->string('test_time')->nullable()->after('test_date');
            $table->string('test_venue')->nullable()->after('test_time');
            $table->text('clerk_notice')->nullable()->after('test_venue');
            $table->text('clerk_remarks')->nullable()->after('clerk_notice');
            $table->foreignId('scrutinized_by')->nullable()->constrained('users')->nullOnDelete()->after('clerk_remarks');
            $table->timestamp('scrutinized_at')->nullable()->after('scrutinized_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropForeign(['scrutinized_by']);
            $table->dropColumn([
                'test_date',
                'test_time',
                'test_venue',
                'clerk_notice',
                'clerk_remarks',
                'scrutinized_by',
                'scrutinized_at',
            ]);
        });
    }
};

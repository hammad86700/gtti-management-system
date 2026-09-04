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
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('status')->default('active')->after('emergency_contact'); // active, struck_off, terminated
            $table->timestamp('struck_off_at')->nullable()->after('status');
            $table->timestamp('struck_off_until')->nullable()->after('struck_off_at');
            $table->integer('struck_off_days')->nullable()->after('struck_off_until');
            $table->text('termination_reason')->nullable()->after('struck_off_days');
            $table->foreignId('sanctioned_by')->nullable()->after('termination_reason')->constrained('users')->nullOnDelete();
            $table->string('order_reference')->nullable()->after('sanctioned_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropForeign(['sanctioned_by']);
            $table->dropColumn([
                'status',
                'struck_off_at',
                'struck_off_until',
                'struck_off_days',
                'termination_reason',
                'sanctioned_by',
                'order_reference',
            ]);
        });
    }
};

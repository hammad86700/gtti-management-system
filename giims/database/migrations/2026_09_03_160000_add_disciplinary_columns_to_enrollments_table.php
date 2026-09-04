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
        Schema::table('enrollments', function (Blueprint $table) {
            $table->timestamp('struck_off_at')->nullable()->after('status');
            $table->timestamp('struck_off_until')->nullable()->after('struck_off_at');
            $table->integer('struck_off_days')->nullable()->after('struck_off_until');
            $table->text('disciplinary_reason')->nullable()->after('struck_off_days');
            $table->foreignId('disciplined_by')->nullable()->after('disciplinary_reason')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['disciplined_by']);
            $table->dropColumn([
                'struck_off_at',
                'struck_off_until',
                'struck_off_days',
                'disciplinary_reason',
                'disciplined_by',
            ]);
        });
    }
};

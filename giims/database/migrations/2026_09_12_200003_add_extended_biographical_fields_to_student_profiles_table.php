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
            if (!Schema::hasColumn('student_profiles', 'religion')) {
                $table->string('religion')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('student_profiles', 'guardian_name')) {
                $table->string('guardian_name')->nullable()->after('father_name');
            }
            if (!Schema::hasColumn('student_profiles', 'guardian_phone')) {
                $table->string('guardian_phone')->nullable()->after('guardian_name');
            }
            if (!Schema::hasColumn('student_profiles', 'permanent_address')) {
                $table->text('permanent_address')->nullable()->after('address');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn(['religion', 'guardian_name', 'guardian_phone', 'permanent_address']);
        });
    }
};

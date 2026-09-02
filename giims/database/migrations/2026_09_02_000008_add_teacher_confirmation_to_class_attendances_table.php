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
        Schema::table('class_attendances', function (Blueprint $table) {
            $table->boolean('is_confirmed_by_teacher')->default(false)->after('marked_at');
            $table->timestamp('teacher_confirmed_at')->nullable()->after('is_confirmed_by_teacher');
            $table->foreignId('confirmed_by_user_id')->nullable()->constrained('users')->nullOnDelete()->after('teacher_confirmed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_attendances', function (Blueprint $table) {
            $table->dropForeign(['confirmed_by_user_id']);
            $table->dropColumn([
                'is_confirmed_by_teacher',
                'teacher_confirmed_at',
                'confirmed_by_user_id',
            ]);
        });
    }
};

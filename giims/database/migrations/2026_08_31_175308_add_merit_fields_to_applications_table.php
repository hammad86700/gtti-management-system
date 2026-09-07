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
            $table->foreignId('merit_list_id')->nullable()->constrained('merit_lists')->nullOnDelete();
            $table->integer('obtained_marks')->nullable();
            $table->integer('total_marks')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropForeign(['merit_list_id']);
            $table->dropColumn(['merit_list_id', 'obtained_marks', 'total_marks']);
        });
    }
};

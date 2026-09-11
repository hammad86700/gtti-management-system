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
            if (!Schema::hasColumn('applications', 'shift')) {
                $table->string('shift')->default('Morning')->after('course_id');
            }
            if (!Schema::hasColumn('applications', 'batch_id')) {
                $table->foreignId('batch_id')->nullable()->after('shift')->constrained('batches')->nullOnDelete();
            }
            $table->index(['course_id', 'shift']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropIndex(['course_id', 'shift']);
            if (Schema::hasColumn('applications', 'batch_id')) {
                $table->dropConstrainedForeignId('batch_id');
            }
            if (Schema::hasColumn('applications', 'shift')) {
                $table->dropColumn('shift');
            }
        });
    }
};

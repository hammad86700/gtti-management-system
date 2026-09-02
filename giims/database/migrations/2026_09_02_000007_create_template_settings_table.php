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
        Schema::create('template_settings', function (Blueprint $table) {
            $table->id();
            $table->string('identifier')->unique(); // e.g. 'demand_letter_template', 'leave_application_template'
            $table->string('title');
            $table->string('type')->default('general'); // demand_letter, leave_application, exam_template
            $table->text('content_pattern');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('template_settings');
    }
};

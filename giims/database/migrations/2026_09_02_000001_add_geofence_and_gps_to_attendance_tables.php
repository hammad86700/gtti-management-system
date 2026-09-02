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
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->string('location_name')->default('Computer Lab / Workshop')->after('subject_id');
            $table->decimal('latitude', 10, 7)->nullable()->after('location_name');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->integer('radius_meters')->default(150)->after('longitude');
            $table->boolean('is_geofence_active')->default(true)->after('radius_meters');
        });

        Schema::table('class_attendances', function (Blueprint $table) {
            $table->string('method')->default('manual')->after('status'); // 'gps', 'manual', 'rfid'
            $table->decimal('student_lat', 10, 7)->nullable()->after('method');
            $table->decimal('student_lng', 10, 7)->nullable()->after('student_lat');
            $table->decimal('distance_meters', 8, 2)->nullable()->after('student_lng');
            $table->string('device_info')->nullable()->after('distance_meters');
            $table->timestamp('marked_at')->nullable()->after('device_info');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->dropColumn([
                'location_name',
                'latitude',
                'longitude',
                'radius_meters',
                'is_geofence_active',
            ]);
        });

        Schema::table('class_attendances', function (Blueprint $table) {
            $table->dropColumn([
                'method',
                'student_lat',
                'student_lng',
                'distance_meters',
                'device_info',
                'marked_at',
            ]);
        });
    }
};

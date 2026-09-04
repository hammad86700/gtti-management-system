<?php

use App\Domains\Identity\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Role::firstOrCreate(
            ['slug' => 'clerk'],
            [
                'name' => 'Clerk / Admission Officer',
                'is_system' => false,
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Role::where('slug', 'clerk')->delete();
    }
};

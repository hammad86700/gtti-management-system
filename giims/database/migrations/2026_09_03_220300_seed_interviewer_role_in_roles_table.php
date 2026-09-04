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
            ['slug' => 'interviewer'],
            [
                'name' => 'Examiner / Interviewer',
                'description' => 'Academic staff member authorized to evaluate viva candidates at the interview desk',
                'is_system' => false,
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Role::where('slug', 'interviewer')->delete();
    }
};

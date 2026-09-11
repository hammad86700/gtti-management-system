<?php

namespace App\Domains\Identity\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Domains\Organization\Models\Institute;
use App\Domains\Student\Models\StudentProfile;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): UserFactory
    {
        return UserFactory::new();
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'institute_id',
        'name',
        'email',
        'cnic',
        'phone',
        'status',
        'is_visiting_faculty',
        'daily_rate',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_visiting_faculty' => 'boolean',
            'daily_rate' => 'integer',
        ];
    }

    /**
     * Get the institute associated with the user.
     */
    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }

    /**
     * Get the roles assigned to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    /**
     * Get the student profile associated with the user.
     */
    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class)->withTrashed();
    }

    /**
     * Get the academic batches assigned to this instructor/user.
     */
    public function batches(): BelongsToMany
    {
        return $this->belongsToMany(\App\Domains\Organization\Models\Batch::class, 'batch_user');
    }

    /**
     * Get the lesson plans created by this instructor/user.
     */
    public function lessonPlans(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Domains\Academic\Models\LessonPlan::class);
    }

    /**
     * Get the assignments created by this instructor/user.
     */
    public function assignments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Domains\Academic\Models\Assignment::class);
    }

    public function materialDemands(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Domains\Operations\Models\MaterialDemand::class);
    }

    public function assetAllocations(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Domains\Operations\Models\AssetAllocation::class);
    }

    public function teacherBills(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Domains\Operations\Models\TeacherBill::class);
    }

    public function facultyAttendances(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Domains\Attendance\Models\FacultyAttendance::class);
    }

    public function facultyLeaves(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Domains\Attendance\Models\FacultyLeave::class);
    }

    public function staffProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(\App\Domains\Staff\Models\StaffProfile::class);
    }

    /**
     * Check if user has one or more roles.
     *
     * @param string|array $roles
     * @return bool
     */
    public function hasRole(string|array $roles): bool
    {
        $roleArray = is_array($roles) ? $roles : explode('|', $roles);
        $roleArray = array_map(fn ($r) => strtolower(trim($r)), $roleArray);

        if (! $this->relationLoaded('roles')) {
            $this->load('roles');
        }

        // Super-admin bypass
        if ($this->roles->contains(fn ($r) => in_array($r->slug, ['super-admin', 'principal']))) {
            return true;
        }

        return $this->roles->contains(function ($role) use ($roleArray) {
            return in_array(strtolower($role->slug), $roleArray) || in_array(strtolower($role->name), $roleArray);
        });
    }
}

<?php

namespace App\Http\Controllers\Student;

use App\Domains\Academic\Models\Assignment;
use App\Domains\Academic\Models\LessonPlan;
use App\Domains\Attendance\Models\ClassAttendance;
use App\Domains\Attendance\Models\GateLog;
use App\Domains\Examination\Models\Exam;
use App\Domains\Examination\Models\OnlineTest;
use App\Domains\Operations\Models\Announcement;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the intelligent student/applicant academic command center.
     */
    public function index(): Response|RedirectResponse
    {
        $user = auth()->user();

        // 1. Redirect administrative staff (Super Admin, Principal, Admin) to Admin Command Center
        if ($user->roles()->whereIn('slug', ['super-admin', 'principal', 'administrator', 'admin'])->exists()) {
            return redirect()->route('admin.dashboard');
        }

        // 2. Redirect clerks to Clerk Admission Portal
        if ($user->roles()->whereIn('slug', ['clerk', 'admission-clerk'])->exists()) {
            return redirect()->route('clerk.dashboard');
        }

        // 3. Redirect faculty / instructors to Teacher Dashboard
        if ($user->roles()->whereIn('slug', ['teacher', 'instructor', 'trade-incharge'])->exists()) {
            return redirect()->route('teacher.dashboard');
        }

        // 4. Redirect interviewers to Viva Interview Desk
        if ($user->roles()->whereIn('slug', ['interviewer'])->exists()) {
            return redirect()->route('interviewer.viva.index');
        }

        // 5. Redirect security personnel to Gate Portal
        if ($user->roles()->whereIn('slug', ['security-officer', 'security'])->exists()) {
            return redirect()->route('security.gate.index');
        }

        $user->load([
            'studentProfile.applications.course.trade.program.department',
            'studentProfile.applications.admissionCampaign',
            'studentProfile.applications.documents',
            'studentProfile.applications.entranceTestAttempt.entranceExam',
            'studentProfile.applications.feeChallan',
            'studentProfile.enrollments.course.trade.program.department',
            'studentProfile.enrollments.batch.teachers',
            'studentProfile.enrollments.lmsActivator',
        ]);

        $profile = $user->studentProfile;
        $sanction = null;

        if ($profile) {
            // Check for temporary struck-off automatic expiry
            if ($profile->status === 'struck_off') {
                if ($profile->struck_off_until && now()->greaterThan($profile->struck_off_until)) {
                    $profile->update([
                        'status' => 'active',
                        'struck_off_at' => null,
                        'struck_off_until' => null,
                        'struck_off_days' => null,
                        'termination_reason' => null,
                    ]);

                    $profile->enrollments()
                        ->where('status', 'suspended')
                        ->update(['status' => 'active']);
                } else {
                    $sanction = [
                        'status' => 'struck_off',
                        'type' => 'struck_off',
                        'struck_off_days' => $profile->struck_off_days,
                        'struck_off_at' => $profile->struck_off_at?->format('d M Y, h:i A'),
                        'struck_off_until' => $profile->struck_off_until?->format('d M Y, h:i A'),
                        'remaining_days' => $profile->remainingSuspensionDays(),
                        'reason' => $profile->termination_reason,
                        'order_reference' => $profile->order_reference,
                    ];
                }
            } elseif ($profile->status === 'terminated') {
                $sanction = [
                    'status' => 'terminated',
                    'type' => 'terminated',
                    'struck_off_at' => $profile->struck_off_at?->format('d M Y, h:i A'),
                    'reason' => $profile->termination_reason,
                    'order_reference' => $profile->order_reference,
                ];
            }

            // Also check for enrollment-level sanction if not already captured
            if (! $sanction) {
                $sanctionedEnrollment = $profile->enrollments()
                    ->whereIn('status', ['struck_off', 'terminated'])
                    ->latest('struck_off_at')
                    ->first();

                if ($sanctionedEnrollment) {
                    if ($sanctionedEnrollment->status === 'struck_off') {
                        if ($sanctionedEnrollment->struck_off_until && now()->greaterThan($sanctionedEnrollment->struck_off_until)) {
                            $sanctionedEnrollment->update([
                                'status' => 'active',
                                'struck_off_at' => null,
                                'struck_off_until' => null,
                                'struck_off_days' => null,
                                'disciplinary_reason' => null,
                                'disciplined_by' => null,
                            ]);
                        } else {
                            $sanction = [
                                'status' => 'struck_off',
                                'type' => 'struck_off',
                                'struck_off_days' => $sanctionedEnrollment->struck_off_days,
                                'struck_off_at' => $sanctionedEnrollment->struck_off_at?->format('d M Y, h:i A'),
                                'struck_off_until' => $sanctionedEnrollment->struck_off_until?->format('d M Y, h:i A'),
                                'remaining_days' => $sanctionedEnrollment->remainingSuspensionDays(),
                                'reason' => $sanctionedEnrollment->disciplinary_reason ?? $profile->termination_reason ?? 'Academic Disciplinary Sanction',
                                'order_reference' => $profile->order_reference ?? ('GTTI/ORD/' . date('Y')),
                            ];
                        }
                    } elseif ($sanctionedEnrollment->status === 'terminated') {
                        $sanction = [
                            'status' => 'terminated',
                            'type' => 'terminated',
                            'struck_off_at' => $sanctionedEnrollment->struck_off_at?->format('d M Y, h:i A') ?? $profile->struck_off_at?->format('d M Y, h:i A'),
                            'reason' => $sanctionedEnrollment->disciplinary_reason ?? $profile->termination_reason ?? 'Executive Expulsion Decree',
                            'order_reference' => $profile->order_reference ?? ('GTTI/EXP/' . date('Y')),
                        ];
                    }
                }
            }
        }

        $activeEnrollment = $profile?->enrollments()
            ->where('status', 'active')
            ->with(['course.trade.program.department', 'batch.teachers'])
            ->latest()
            ->first();

        // Initialize academic data collections
        $onlineTests = collect();
        $assignments = collect();
        $recentExams = collect();
        $lessonPlans = collect();
        $pendingTestsCount = 0;
        $pendingAssignmentsCount = 0;
        $assignedTeachers = collect();

        $attendanceStats = [
            'total_sessions' => 0,
            'present_count' => 0,
            'late_count' => 0,
            'absent_count' => 0,
            'percentage' => null,
            'has_data' => false,
            'latest_gate_log' => null,
        ];

        $today = today();
        $todaySession = null;
        $todayAttendance = null;

        if ($activeEnrollment && $activeEnrollment->batch_id && $profile) {
            $batchId = $activeEnrollment->batch_id;

            // Today's attendance session for this batch & student today status
            $currentSession = \App\Domains\Attendance\Models\AttendanceSession::where('batch_id', $batchId)
                ->whereDate('session_date', $today)
                ->latest()
                ->first();

            if ($currentSession) {
                $todaySession = [
                    'id' => $currentSession->id,
                    'location_name' => $currentSession->location_name ?? 'Computer Lab 1 & 2 (IT Wing)',
                    'latitude' => (float) ($currentSession->latitude ?? 28.4212),
                    'longitude' => (float) ($currentSession->longitude ?? 70.3023),
                    'radius_meters' => (int) ($currentSession->radius_meters ?? 150),
                    'is_geofence_active' => (bool) $currentSession->is_geofence_active,
                    'has_daily_pin' => !empty($currentSession->daily_pin),
                    'status' => $currentSession->status,
                ];

                $attRecord = \App\Domains\Attendance\Models\ClassAttendance::where('attendance_session_id', $currentSession->id)
                    ->where('student_profile_id', $profile->id)
                    ->first();

                if ($attRecord) {
                    $todayAttendance = [
                        'id' => $attRecord->id,
                        'status' => $attRecord->status,
                        'method' => $attRecord->method,
                        'distance_meters' => $attRecord->distance_meters,
                        'marked_at' => $attRecord->marked_at?->format('h:i A') ?? $attRecord->created_at?->format('h:i A'),
                        'is_marked' => in_array($attRecord->status, ['present', 'late']),
                        'is_confirmed_by_teacher' => (bool) $attRecord->is_confirmed_by_teacher,
                    ];
                }
            } else {
                // Default GTTI Campus / Lab geofence ready for student check-in
                $todaySession = [
                    'id' => null,
                    'location_name' => 'Computer Lab 1 & 2 (IT Wing)',
                    'latitude' => 28.4212,
                    'longitude' => 70.3023,
                    'radius_meters' => 150,
                    'is_geofence_active' => true,
                    'status' => 'active',
                ];
            }

            // 1. Online CBT Tests for the student's batch
            $onlineTests = OnlineTest::where('batch_id', $batchId)
                ->where('status', 'published')
                ->withCount('questions')
                ->with(['attempts' => function ($q) use ($profile) {
                    $q->where('student_profile_id', $profile->id);
                }])
                ->latest()
                ->take(8)
                ->get()
                ->map(function ($test) {
                    $attempt = $test->attempts->first();
                    return [
                        'id' => $test->id,
                        'title' => $test->title,
                        'duration_minutes' => $test->duration_minutes,
                        'questions_count' => $test->questions_count,
                        'total_marks' => $test->total_marks,
                        'passing_percentage' => $test->passing_percentage,
                        'status' => $test->status,
                        'created_at' => $test->created_at?->toIso8601String(),
                        'has_attempted' => !is_null($attempt),
                        'attempt' => $attempt ? [
                            'id' => $attempt->id,
                            'score' => $attempt->score,
                            'total_questions' => $attempt->total_questions,
                            'status' => $attempt->status,
                            'submitted_at' => $attempt->end_time?->toIso8601String() ?? $attempt->created_at?->toIso8601String(),
                        ] : null,
                    ];
                });

            $pendingTestsCount = $onlineTests->where('has_attempted', false)->count();

            // 2. Assignments created by teachers for this batch
            $assignments = Assignment::where('batch_id', $batchId)
                ->with([
                    'subject',
                    'submissions' => function ($q) use ($profile) {
                        $q->where('student_profile_id', $profile->id);
                    },
                ])
                ->latest('due_date')
                ->take(6)
                ->get()
                ->map(function ($assignment) {
                    $sub = $assignment->submissions->first();
                    $isSubmitted = !is_null($sub);
                    return [
                        'id' => $assignment->id,
                        'title' => $assignment->title,
                        'description' => $assignment->description,
                        'subject_name' => $assignment->subject?->name ?? 'General Coursework',
                        'subject_code' => $assignment->subject?->code,
                        'due_date' => $assignment->due_date?->toDateString(),
                        'max_marks' => $assignment->total_marks ?? 100,
                        'is_submitted' => $isSubmitted,
                        'submission' => $sub ? [
                            'id' => $sub->id,
                            'obtained_marks' => $sub->obtained_marks,
                            'grade' => $sub->grade,
                            'status' => $sub->status,
                            'teacher_feedback' => $sub->teacher_feedback,
                            'submitted_at' => $sub->created_at?->toIso8601String(),
                        ] : null,
                    ];
                });

            $pendingAssignmentsCount = $assignments->where('is_submitted', false)->count();

            // 3. Lesson plans / Teacher curriculum topics
            $lessonPlans = LessonPlan::where('batch_id', $batchId)
                ->with('subject')
                ->latest('planned_date')
                ->take(5)
                ->get()
                ->map(function ($lp) {
                    return [
                        'id' => $lp->id,
                        'topic' => $lp->topic,
                        'subject_name' => $lp->subject?->name ?? 'Curriculum Topic',
                        'planned_date' => $lp->planned_date?->toDateString(),
                        'resources_url' => $lp->resources_url,
                        'has_file' => !empty($lp->file_path),
                    ];
                });

            // 4. Official Examinations and locked marks
            $recentExams = Exam::where('batch_id', $batchId)
                ->with([
                    'subject',
                    'examResults' => function ($q) use ($profile) {
                        $q->where('student_profile_id', $profile->id);
                    },
                ])
                ->latest('exam_date')
                ->take(5)
                ->get()
                ->map(function ($e) {
                    $res = $e->examResults->first();
                    return [
                        'id' => $e->id,
                        'name' => $e->name,
                        'subject_name' => $e->subject?->name ?? 'Assessment Module',
                        'exam_date' => $e->exam_date?->toDateString(),
                        'total_marks' => $e->total_marks,
                        'is_locked' => (bool) $e->is_locked,
                        'has_result' => !is_null($res),
                        'marks_obtained' => $res?->marks_obtained,
                        'is_competent' => $res?->is_competent,
                        'remarks' => $res?->remarks,
                    ];
                });

            // 5. Real Classroom Attendance & Gate Security
            $attendances = ClassAttendance::where('student_profile_id', $profile->id)->get();
            $totalCount = $attendances->count();
            if ($totalCount > 0) {
                $presentCount = $attendances->where('status', 'present')->count();
                $lateCount = $attendances->where('status', 'late')->count();
                $absentCount = $attendances->where('status', 'absent')->count();
                $pct = round((($presentCount + ($lateCount * 0.5)) / $totalCount) * 100, 1);

                $latestGate = GateLog::where('student_profile_id', $profile->id)->latest('logged_at')->first();

                $attendanceStats = [
                    'total_sessions' => $totalCount,
                    'present_count' => $presentCount,
                    'late_count' => $lateCount,
                    'absent_count' => $absentCount,
                    'percentage' => $pct,
                    'has_data' => true,
                    'latest_gate_log' => $latestGate ? [
                        'type' => $latestGate->type,
                        'logged_at' => $latestGate->logged_at?->toIso8601String(),
                        'gate_name' => $latestGate->gate_name,
                    ] : null,
                ];
            }

            // Batch instructors
            if ($activeEnrollment->batch && $activeEnrollment->batch->teachers) {
                $assignedTeachers = $activeEnrollment->batch->teachers->map(function ($teacher) {
                    return [
                        'id' => $teacher->id,
                        'name' => $teacher->name,
                        'email' => $teacher->email,
                    ];
                });
            }
        }

        // 6. Institutional & Faculty Announcements with sender differentiation
        $announcements = Announcement::with(['creator.roles'])
            ->whereIn('target_audience', ['all', 'students'])
            ->where(function ($q) {
                $q->where('expires_at', '>=', today())
                  ->orWhereNull('expires_at');
            })
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($a) {
                $creator = $a->creator;
                $isTeacher = false;
                $roleTitle = 'Administration';

                if ($creator && $creator->roles) {
                    $slugs = $creator->roles->pluck('slug')->all();
                    if (in_array('teacher', $slugs) || in_array('instructor', $slugs)) {
                        $isTeacher = true;
                        $roleTitle = 'Instructor / Faculty';
                    } elseif (in_array('principal', $slugs)) {
                        $roleTitle = 'Principal Office';
                    } elseif (in_array('super-admin', $slugs) || in_array('administrator', $slugs)) {
                        $roleTitle = 'Central Administration';
                    }
                }

                return [
                    'id' => $a->id,
                    'title' => $a->title,
                    'message' => $a->message,
                    'target_audience' => $a->target_audience,
                    'created_at' => $a->created_at?->toIso8601String(),
                    'expires_at' => $a->expires_at?->toDateString(),
                    'author_name' => $creator?->name ?? 'GTTI Management',
                    'author_role' => $roleTitle,
                    'sender_type' => $isTeacher ? 'teacher' : 'admin',
                ];
            });

        // 7. Official Published Merit Lists (Strictly Scoped by Admission Track)
        $latestApp = $profile?->applications()->latest()->first();
        $isAdmittedStudent = (bool) ($activeEnrollment && $activeEnrollment->is_lms_active);
        $meritLists = collect();

        if (!$isAdmittedStudent) {
            if ($latestApp && $latestApp->course) {
                // If applicant applied to an FCFS course, merit lists are not applicable
                if ($latestApp->course->isMeritBased()) {
                    $meritLists = \App\Domains\Admissions\Models\MeritList::where(function ($q) {
                            $q->where('status', 'published')
                              ->orWhere('is_publicly_visible', true);
                        })
                        ->where('course_id', $latestApp->course_id)
                        ->with(['course.trade', 'uploader'])
                        ->latest('published_at')
                        ->take(5)
                        ->get()
                        ->map(function ($ml) {
                            return [
                                'id' => $ml->id,
                                'title' => $ml->title,
                                'course_id' => $ml->course_id,
                                'course_name' => $ml->course?->name ?? 'Course',
                                'trade_name' => $ml->course?->trade?->name ?? 'Vocational Trade',
                                'file_name' => $ml->file_name,
                                'has_file' => !empty($ml->file_path),
                                'classes_start_date' => $ml->classes_start_date?->format('d M Y'),
                                'published_at' => $ml->published_at?->format('d M Y') ?? $ml->created_at?->format('d M Y'),
                                'remarks' => $ml->remarks,
                            ];
                        });
                }
            } else {
                // Unapplied exploring students: can view public published merit lists
                $meritLists = \App\Domains\Admissions\Models\MeritList::where(function ($q) {
                        $q->where('status', 'published')
                          ->orWhere('is_publicly_visible', true);
                    })
                    ->with(['course.trade', 'uploader'])
                    ->latest('published_at')
                    ->take(10)
                    ->get()
                    ->map(function ($ml) {
                        return [
                            'id' => $ml->id,
                            'title' => $ml->title,
                            'course_id' => $ml->course_id,
                            'course_name' => $ml->course?->name ?? 'General Course',
                            'trade_name' => $ml->course?->trade?->name ?? 'Vocational Trade',
                            'file_name' => $ml->file_name,
                            'has_file' => !empty($ml->file_path),
                            'classes_start_date' => $ml->classes_start_date?->format('d M Y'),
                            'published_at' => $ml->published_at?->format('d M Y') ?? $ml->created_at?->format('d M Y'),
                            'remarks' => $ml->remarks,
                        ];
                    });
            }
        }

        return Inertia::render('Student/Dashboard', [
            'userData' => $user,
            'sanction' => $sanction,
            'announcements' => $announcements,
            'meritLists' => $meritLists,
            'onlineTests' => $onlineTests,
            'pendingTestsCount' => $pendingTestsCount,
            'assignments' => $assignments,
            'pendingAssignmentsCount' => $pendingAssignmentsCount,
            'lessonPlans' => $lessonPlans,
            'recentExams' => $recentExams,
            'attendanceStats' => $attendanceStats,
            'assignedTeachers' => $assignedTeachers,
            'todaySession' => $todaySession,
            'todayAttendance' => $todayAttendance,
        ]);
    }
}

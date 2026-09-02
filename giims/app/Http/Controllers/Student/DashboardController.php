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

        // Redirect administrative staff to Admin Command Center
        if ($user->roles()->whereIn('slug', ['super-admin', 'principal', 'administrator', 'clerk', 'admission-clerk'])->exists()) {
            return redirect()->route('admin.dashboard');
        }

        // Redirect faculty / instructors to Teacher Dashboard
        if ($user->roles()->whereIn('slug', ['teacher', 'instructor', 'trade-incharge'])->exists()) {
            return redirect()->route('teacher.dashboard');
        }

        // Redirect security personnel to Gate Portal
        if ($user->roles()->whereIn('slug', ['security-officer', 'security'])->exists()) {
            return redirect()->route('security.gate.index');
        }

        $user->load([
            'studentProfile.applications.course.trade.program.department',
            'studentProfile.applications.admissionCampaign',
            'studentProfile.applications.documents',
            'studentProfile.enrollments.course.trade.program.department',
            'studentProfile.enrollments.batch.teachers',
        ]);

        $profile = $user->studentProfile;
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

        return Inertia::render('Student/Dashboard', [
            'userData' => $user,
            'announcements' => $announcements,
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

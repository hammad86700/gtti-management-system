<?php

use App\Http\Controllers\Admin\AcademicAllocationController;
use App\Http\Controllers\Admin\AdmissionCampaignController;
use App\Http\Controllers\Admin\AlumniController as AdminAlumniController;
use App\Http\Controllers\Admin\AnnouncementController as AdminAnnouncementController;
use App\Http\Controllers\Admin\ApplicationReviewController;
use App\Http\Controllers\Admin\ClearanceController as AdminClearanceController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DisciplineController as AdminDisciplineController;
use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\Admin\InventoryController as AdminInventoryController;
use App\Http\Controllers\Admin\MeritController;
use App\Http\Controllers\Admin\OrganizationController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\ResultApprovalController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Security\GateController;
use App\Http\Controllers\Student\AlumniController as StudentAlumniController;
use App\Http\Controllers\Student\ApplicationController as StudentApplicationController;
use App\Http\Controllers\Student\ClearanceController as StudentClearanceController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\LeaveController as StudentLeaveController;
use App\Http\Controllers\Student\LmsController as StudentLmsController;
use App\Http\Controllers\Student\OnlineTestController as StudentOnlineTestController;
use App\Http\Controllers\Student\ProfileController as StudentProfileController;
use App\Http\Controllers\Teacher\AssignmentController as TeacherAssignmentController;
use App\Http\Controllers\Teacher\AttendanceController as TeacherAttendanceController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Teacher\ExamController as TeacherExamController;
use App\Http\Controllers\Teacher\LeaveController as TeacherLeaveController;
use App\Http\Controllers\Teacher\LessonPlanController as TeacherLessonPlanController;
use App\Http\Controllers\Teacher\OnlineTestController as TeacherOnlineTestController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('/organization', [OrganizationController::class, 'index'])->name('admin.organization.index');

    Route::get('/campaigns', [AdmissionCampaignController::class, 'index'])->name('admin.campaigns.index');
    Route::post('/campaigns', [AdmissionCampaignController::class, 'store'])->name('admin.campaigns.store');

    Route::get('/applications', [ApplicationReviewController::class, 'index'])->name('admin.applications.index');
    Route::get('/applications/{id}', [ApplicationReviewController::class, 'show'])->name('admin.applications.show');
    Route::patch('/applications/{id}/status', [ApplicationReviewController::class, 'updateStatus'])->name('admin.applications.update-status');
    Route::get('/documents/{id}/download', [ApplicationReviewController::class, 'downloadDocument'])->name('admin.documents.download');

    Route::get('/merit-lists', [MeritController::class, 'index'])->name('admin.merit.index');
    Route::post('/merit-lists', [MeritController::class, 'store'])->name('admin.merit.store');
    Route::get('/merit-lists/{id}', [MeritController::class, 'show'])->name('admin.merit.show');
    Route::post('/merit-lists/{id}/reorder', [MeritController::class, 'reorder'])->name('admin.merit.reorder');

    Route::get('/enrollments', [EnrollmentController::class, 'index'])->name('admin.enrollments.index');
    Route::post('/enrollments', [EnrollmentController::class, 'store'])->name('admin.enrollments.store');

    Route::get('/result-approvals', [ResultApprovalController::class, 'index'])->name('admin.result-approvals.index');
    Route::post('/result-approvals/{examId}/lock', [ResultApprovalController::class, 'lock'])->name('admin.result-approvals.lock');
    Route::post('/result-approvals/{examId}/unlock', [ResultApprovalController::class, 'unlock'])->name('admin.result-approvals.unlock');

    Route::get('/clearances', [AdminClearanceController::class, 'index'])->name('admin.clearances.index');
    Route::patch('/clearances/{id}', [AdminClearanceController::class, 'update'])->name('admin.clearances.update');
    Route::post('/clearances/{id}/certificate', [AdminClearanceController::class, 'issueCertificate'])->name('admin.clearances.issue-certificate');

    Route::get('/inventory', [AdminInventoryController::class, 'index'])->name('admin.inventory.index');
    Route::post('/inventory', [AdminInventoryController::class, 'store'])->name('admin.inventory.store');
    Route::post('/inventory/{id}/transaction', [AdminInventoryController::class, 'transaction'])->name('admin.inventory.transaction');
    Route::post('/inventory/demands/{id}/approve', [AdminInventoryController::class, 'approveDemand'])->name('admin.inventory.demands.approve');
    Route::post('/inventory/allocate-asset', [AdminInventoryController::class, 'allocateAsset'])->name('admin.inventory.allocate-asset');

    Route::get('/assets', [\App\Http\Controllers\Admin\AssetAllocationController::class, 'index'])->name('admin.assets.index');
    Route::post('/assets', [\App\Http\Controllers\Admin\AssetAllocationController::class, 'store'])->name('admin.assets.store');
    Route::post('/assets/{id}/return', [\App\Http\Controllers\Admin\AssetAllocationController::class, 'returnAsset'])->name('admin.assets.return');

    Route::get('/discipline', [AdminDisciplineController::class, 'index'])->name('admin.discipline.index');
    Route::post('/discipline', [AdminDisciplineController::class, 'store'])->name('admin.discipline.store');
    Route::patch('/discipline/{id}/resolve', [AdminDisciplineController::class, 'resolve'])->name('admin.discipline.resolve');

    Route::get('/alumni-placements', [AdminAlumniController::class, 'index'])->name('admin.alumni.index');

    Route::get('/announcements', [AdminAnnouncementController::class, 'index'])->name('admin.announcements.index');
    Route::post('/announcements', [AdminAnnouncementController::class, 'store'])->name('admin.announcements.store');

    Route::get('/reports', [AdminReportController::class, 'index'])->name('admin.reports.index');
    Route::get('/reports/students/export', [AdminReportController::class, 'exportStudents'])->name('admin.reports.students.export');
    Route::get('/reports/applications/export', [AdminReportController::class, 'exportApplications'])->name('admin.reports.applications.export');
    Route::get('/reports/inventory/export', [AdminReportController::class, 'exportInventory'])->name('admin.reports.inventory.export');
    Route::get('/reports/alumni/export', [AdminReportController::class, 'exportAlumni'])->name('admin.reports.alumni.export');

    Route::get('/attendance', [\App\Http\Controllers\Admin\AttendanceController::class, 'index'])->name('admin.attendance.index');
    Route::post('/attendance/override', [\App\Http\Controllers\Admin\AttendanceOverrideController::class, 'store'])->name('admin.attendance.override');

    Route::get('/staff', [StaffController::class, 'index'])->name('admin.staff.index');
    Route::post('/staff', [StaffController::class, 'store'])->name('admin.staff.store');

    // Route alias for staff.index & staff.store direct compatibility
    Route::get('/staff-direct', [StaffController::class, 'index'])->name('staff.index');
    Route::post('/staff-direct', [StaffController::class, 'store'])->name('staff.store');

    // Academic Allocations (Phase 17)
    Route::get('/allocations', [AcademicAllocationController::class, 'index'])->name('allocations.index');
    Route::post('/allocations', [AcademicAllocationController::class, 'store'])->name('allocations.store');
    Route::delete('/allocations/{batch}/{user}', [AcademicAllocationController::class, 'destroy'])->name('allocations.destroy');
    Route::get('/allocations-alias', [AcademicAllocationController::class, 'index'])->name('admin.allocations.index');

    // Privileged Administrative Subsystems (Super-Admin / Principal only)
    Route::middleware('role:super-admin,principal')->group(function () {
        Route::get('/settings', [\App\Http\Controllers\Admin\SiteSettingController::class, 'index'])->name('admin.settings.index');
        Route::post('/settings', [\App\Http\Controllers\Admin\SiteSettingController::class, 'update'])->name('admin.settings.update');
        Route::get('/system-logs', [\App\Http\Controllers\Admin\ActivityLogController::class, 'index'])->name('admin.system-logs.index');
    });
});

Route::middleware(['auth', 'verified', 'role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/dashboard', [TeacherDashboardController::class, 'index'])->name('dashboard');
    Route::get('/batches/{batchId}/lesson-plans', [TeacherLessonPlanController::class, 'index'])->name('lesson-plans.index');
    Route::post('/batches/{batchId}/lesson-plans', [TeacherLessonPlanController::class, 'store'])->name('lesson-plans.store');
    Route::get('/batches/{batchId}/assignments', [TeacherAssignmentController::class, 'index'])->name('assignments.index');
    Route::post('/batches/{batchId}/assignments', [TeacherAssignmentController::class, 'store'])->name('assignments.store');
    Route::patch('/submissions/{submissionId}/grade', [TeacherAssignmentController::class, 'grade'])->name('assignments.grade');
    Route::get('/batches/{batchId}/attendance/create', [TeacherAttendanceController::class, 'create'])->name('attendance.create');
    Route::post('/batches/{batchId}/attendance', [TeacherAttendanceController::class, 'store'])->name('attendance.store');
    Route::get('/batches/{batchId}/attendance/live', [TeacherAttendanceController::class, 'liveSession'])->name('attendance.live');
    Route::post('/batches/{batchId}/attendance/start-session', [TeacherAttendanceController::class, 'startSession'])->name('attendance.start-session');
    Route::post('/batches/{batchId}/attendance/manual-update', [TeacherAttendanceController::class, 'manualUpdateRecord'])->name('attendance.manual-update');
    Route::post('/attendance/sessions/{sessionId}/close', [TeacherAttendanceController::class, 'closeSession'])->name('attendance.close-session');
    Route::post('/attendance/sessions/{sessionId}/generate-pin', [TeacherAttendanceController::class, 'generatePin'])->name('attendance.generate-pin');
    Route::post('/batches/{batchId}/attendance/generate-pin', [TeacherAttendanceController::class, 'generateBatchPin'])->name('attendance.generate-batch-pin');
    Route::post('/batches/{batchId}/attendance/update-zone', [TeacherAttendanceController::class, 'updateSessionZone'])->name('attendance.update-zone');
    Route::post('/batches/{batchId}/attendance/confirm', [TeacherAttendanceController::class, 'confirmAttendance'])->name('attendance.confirm');
    Route::get('/leaves', [TeacherLeaveController::class, 'index'])->name('leaves.index');
    Route::patch('/leaves/{id}/status', [TeacherLeaveController::class, 'updateStatus'])->name('leaves.update-status');

    Route::get('/batches/{batchId}/exams', [TeacherExamController::class, 'index'])->name('exams.index');
    Route::post('/batches/{batchId}/exams', [TeacherExamController::class, 'store'])->name('exams.store');
    Route::get('/exams/{examId}', [TeacherExamController::class, 'show'])->name('exams.show');
    Route::post('/exams/{examId}/marks', [TeacherExamController::class, 'storeMarks'])->name('exams.store-marks');

    Route::get('/batches/{batchId}/online-tests', [TeacherOnlineTestController::class, 'index'])->name('online-tests.index');
    Route::post('/batches/{batchId}/online-tests', [TeacherOnlineTestController::class, 'store'])->name('online-tests.store');
    Route::get('/online-tests/{testId}', [TeacherOnlineTestController::class, 'show'])->name('online-tests.show');
    Route::post('/online-tests/{testId}/bulk-upload', [TeacherOnlineTestController::class, 'bulkUpload'])->name('online-tests.bulk-upload');
    Route::patch('/online-tests/{testId}/publish', [TeacherOnlineTestController::class, 'publish'])->name('online-tests.publish');
    Route::post('/online-tests/{testId}/attempts/{attemptId}/force-submit', [TeacherOnlineTestController::class, 'forceSubmit'])->name('online-tests.force-submit');
    Route::post('/announcements', [TeacherDashboardController::class, 'storeAnnouncement'])->name('announcements.store');
    Route::get('/demands', [\App\Http\Controllers\Teacher\MaterialDemandController::class, 'index'])->name('demands.index');
    Route::post('/demands', [\App\Http\Controllers\Teacher\MaterialDemandController::class, 'store'])->name('demands.store');
    Route::get('/demands/{id}/print', [\App\Http\Controllers\Teacher\MaterialDemandController::class, 'show'])->name('demands.show');
    Route::get('/billing', [\App\Http\Controllers\Teacher\BillingController::class, 'index'])->name('billing.index');
    Route::post('/billing/generate', [\App\Http\Controllers\Teacher\BillingController::class, 'generate'])->name('billing.generate');
    Route::get('/billing/{id}/print', [\App\Http\Controllers\Teacher\BillingController::class, 'show'])->name('billing.show');
});

Route::middleware(['auth', 'verified', 'role:security'])->prefix('security')->name('security.')->group(function () {
    Route::get('/gate-portal', [GateController::class, 'index'])->name('gate.index');
    Route::post('/gate-portal/verify', [GateController::class, 'verify'])->name('gate.verify');
    Route::post('/gate-portal/log', [GateController::class, 'store'])->name('gate.store');
});

Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/profile', [StudentProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [StudentProfileController::class, 'update'])->name('profile.update');

    Route::get('/apply', [StudentApplicationController::class, 'create'])->name('application.create');
    Route::post('/apply', [StudentApplicationController::class, 'store'])->name('application.store');

    Route::get('/lms', [StudentLmsController::class, 'index'])->name('lms.index');
    Route::post('/assignments/{assignmentId}/submit', [StudentLmsController::class, 'submitAssignment'])->name('assignments.submit');

    Route::get('/leaves', [StudentLeaveController::class, 'index'])->name('leaves.index');
    Route::post('/leaves', [StudentLeaveController::class, 'store'])->name('leaves.store');

    Route::get('/clearance', [StudentClearanceController::class, 'index'])->name('clearance.index');
    Route::post('/clearance', [StudentClearanceController::class, 'store'])->name('clearance.store');

    Route::get('/alumni', [StudentAlumniController::class, 'index'])->name('alumni.index');
    Route::post('/alumni', [StudentAlumniController::class, 'store'])->name('alumni.store');

    Route::get('/online-tests', [StudentOnlineTestController::class, 'index'])->name('online-tests.index');
    Route::get('/online-tests/{testId}/take', [StudentOnlineTestController::class, 'takeTest'])->name('online-tests.take');
    Route::post('/online-tests/{testId}/submit', [StudentOnlineTestController::class, 'submit'])->name('online-tests.submit');

    Route::post('/attendance/check-in', [\App\Http\Controllers\Student\StudentAttendanceController::class, 'checkIn'])->name('attendance.check-in');
    Route::post('/attendance/self-mark', [\App\Http\Controllers\Student\StudentAttendanceController::class, 'markSelfAttendance'])->name('attendance.self-mark');
});

// Intelligent Student / Applicant Dashboard
Route::get('/dashboard', [StudentDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

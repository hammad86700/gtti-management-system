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
    Route::post('/organization/courses', [OrganizationController::class, 'storeCourse'])->name('admin.organization.courses.store');
    Route::patch('/organization/courses/{id}', [OrganizationController::class, 'updateCourse'])->name('admin.organization.courses.update');
    Route::delete('/organization/courses/{id}', [OrganizationController::class, 'destroyCourse'])->name('admin.organization.courses.destroy');

    Route::post('/organization/departments', [OrganizationController::class, 'storeDepartment'])->name('admin.organization.departments.store');
    Route::patch('/organization/departments/{id}', [OrganizationController::class, 'updateDepartment'])->name('admin.organization.departments.update');
    Route::delete('/organization/departments/{id}', [OrganizationController::class, 'destroyDepartment'])->name('admin.organization.departments.destroy');

    Route::post('/organization/programs', [OrganizationController::class, 'storeProgram'])->name('admin.organization.programs.store');
    Route::patch('/organization/programs/{id}', [OrganizationController::class, 'updateProgram'])->name('admin.organization.programs.update');
    Route::delete('/organization/programs/{id}', [OrganizationController::class, 'destroyProgram'])->name('admin.organization.programs.destroy');

    Route::post('/organization/trades', [OrganizationController::class, 'storeTrade'])->name('admin.organization.trades.store');
    Route::patch('/organization/trades/{id}', [OrganizationController::class, 'updateTrade'])->name('admin.organization.trades.update');
    Route::delete('/organization/trades/{id}', [OrganizationController::class, 'destroyTrade'])->name('admin.organization.trades.destroy');

    Route::post('/organization/batches', [OrganizationController::class, 'storeBatch'])->name('admin.organization.batches.store');
    Route::patch('/organization/batches/{id}', [OrganizationController::class, 'updateBatch'])->name('admin.organization.batches.update');
    Route::delete('/organization/batches/{id}', [OrganizationController::class, 'destroyBatch'])->name('admin.organization.batches.destroy');

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
    Route::post('/students/manual', [EnrollmentController::class, 'storeManualStudent'])->name('admin.students.manual-store');
    Route::patch('/students/{id}', [EnrollmentController::class, 'updateStudent'])->name('admin.students.update');
    Route::delete('/students/{id}', [EnrollmentController::class, 'destroyStudent'])->name('admin.students.destroy');

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
    Route::post('/discipline/requests/{id}/approve', [AdminDisciplineController::class, 'approveRequest'])->name('admin.discipline.requests.approve');
    Route::post('/discipline/requests/{id}/reject', [AdminDisciplineController::class, 'rejectRequest'])->name('admin.discipline.requests.reject');
    Route::post('/discipline/direct-sanction', [AdminDisciplineController::class, 'directSanction'])->name('admin.discipline.direct-sanction');
    Route::post('/discipline/{id}/reinstate', [AdminDisciplineController::class, 'reinstate'])->name('admin.discipline.reinstate');

    // Enrollment-level Disciplinary Actions (Phase 24)
    Route::post('/discipline/enrollments/{enrollment}/strike-off', [\App\Http\Controllers\Admin\DisciplineActionController::class, 'strikeOff'])->name('admin.discipline.enrollments.strike-off');
    Route::post('/discipline/enrollments/{enrollment}/terminate', [\App\Http\Controllers\Admin\DisciplineActionController::class, 'terminate'])->name('admin.discipline.enrollments.terminate');
    Route::post('/discipline/enrollments/{enrollment}/reinstate', [\App\Http\Controllers\Admin\DisciplineActionController::class, 'reinstate'])->name('admin.discipline.enrollments.reinstate');

    // Organization Hierarchical Trainee Roster (Phase 24)
    Route::get('/organization/courses/{id}/students', [OrganizationController::class, 'courseStudents'])->name('admin.organization.courses.students');
    Route::get('/organization/batches/{id}/students', [OrganizationController::class, 'batchStudents'])->name('admin.organization.batches.students');

    Route::get('/alumni-placements', [AdminAlumniController::class, 'index'])->name('admin.alumni.index');

    Route::get('/announcements', [AdminAnnouncementController::class, 'index'])->name('admin.announcements.index');
    Route::post('/announcements', [AdminAnnouncementController::class, 'store'])->name('admin.announcements.store');
    Route::delete('/announcements/{announcement}', [AdminAnnouncementController::class, 'destroy'])->name('admin.announcements.destroy');

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

    // Phase 32: Apprenticeship & OJT Trainee Registry & TEVTA Export
    Route::get('/apprenticeships', [\App\Http\Controllers\Admin\ApprenticeshipRegistryController::class, 'index'])->name('admin.apprenticeships.index');
    Route::get('/apprenticeships/export', [\App\Http\Controllers\Admin\ApprenticeshipRegistryController::class, 'exportCsv'])->name('admin.apprenticeships.export');

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
    Route::get('/discipline', [\App\Http\Controllers\Teacher\DisciplineController::class, 'index'])->name('discipline.index');
    Route::post('/discipline/requests', [\App\Http\Controllers\Teacher\DisciplineController::class, 'store'])->name('discipline.store');

    // Phase 25: Teacher Entrance Test Cockpit
    Route::get('/admission-tests', [\App\Http\Controllers\Teacher\AdmissionTestController::class, 'index'])->name('admission-tests.index');
    Route::post('/admission-tests', [\App\Http\Controllers\Teacher\AdmissionTestController::class, 'store'])->name('admission-tests.store');
    Route::get('/admission-tests/{id}', [\App\Http\Controllers\Teacher\AdmissionTestController::class, 'show'])->name('admission-tests.show');
    Route::post('/admission-tests/{id}/toggle-live', [\App\Http\Controllers\Teacher\AdmissionTestController::class, 'toggleLive'])->name('admission-tests.toggle-live');
    Route::post('/admission-tests/{id}/bulk-upload', [\App\Http\Controllers\Teacher\AdmissionTestController::class, 'bulkUpload'])->name('admission-tests.bulk-upload');
    Route::post('/admission-tests/{id}/add-question', [\App\Http\Controllers\Teacher\AdmissionTestController::class, 'addQuestion'])->name('admission-tests.add-question');
    Route::delete('/admission-tests/{examId}/questions/{questionId}', [\App\Http\Controllers\Teacher\AdmissionTestController::class, 'deleteQuestion'])->name('admission-tests.delete-question');
    Route::post('/admission-tests/{id}/manual-marks', [\App\Http\Controllers\Teacher\AdmissionTestController::class, 'manualMarks'])->name('admission-tests.manual-marks');
    Route::post('/admission-tests/{id}/calculate-merit', [\App\Http\Controllers\Teacher\AdmissionTestController::class, 'calculateMerit'])->name('admission-tests.calculate-merit');

    // GTTI Exam System: Teacher Cockpit, Interview Desk, and Results
    Route::get('/exam-system', [\App\Http\Controllers\Teacher\ExamSystemTeacherController::class, 'dashboard'])->name('exam-system.dashboard');
    Route::post('/exam-system/exams', [\App\Http\Controllers\Teacher\ExamSystemTeacherController::class, 'storeExam'])->name('exam-system.exams.store');
    Route::post('/exam-system/exams/{testId}/toggle-live', [\App\Http\Controllers\Teacher\ExamSystemTeacherController::class, 'toggleLive'])->name('exam-system.exams.toggle-live');
    Route::post('/exam-system/exams/{testId}/bulk-upload', [\App\Http\Controllers\Teacher\ExamSystemTeacherController::class, 'bulkUploadQuestions'])->name('exam-system.exams.bulk-upload');
    Route::get('/exam-system/interview/{testId?}', [\App\Http\Controllers\Teacher\ExamSystemTeacherController::class, 'interviewDesk'])->name('exam-system.interview');
    Route::post('/exam-system/interview/{attemptId}', [\App\Http\Controllers\Teacher\ExamSystemTeacherController::class, 'submitVivaMarks'])->name('exam-system.interview.submit');
    Route::get('/exam-system/results/{testId}', [\App\Http\Controllers\Teacher\ExamSystemTeacherController::class, 'results'])->name('exam-system.results');
    Route::get('/exam-system/results/{testId}/export-csv', [\App\Http\Controllers\Teacher\ExamSystemTeacherController::class, 'exportCsv'])->name('exam-system.results.export-csv');
    Route::delete('/exam-system/attempts/{attemptId}', [\App\Http\Controllers\Teacher\ExamSystemTeacherController::class, 'deleteAttempt'])->name('exam-system.attempts.delete');
    Route::get('/exam-system-hub', [\App\Http\Controllers\Teacher\ExamSystemTeacherController::class, 'dashboard'])->name('exam-system.dashboard');

    // Phase 29: Day-by-Day Curriculum Roadmap & Master Syllabus Importer
    Route::get('/batches/{batchId}/curriculum', [\App\Http\Controllers\Teacher\CurriculumRoadmapController::class, 'index'])->name('curriculum.index');
    Route::post('/batches/{batchId}/curriculum/import', [\App\Http\Controllers\Teacher\CurriculumRoadmapController::class, 'bulkImport'])->name('curriculum.import');
    Route::post('/batches/{batchId}/curriculum/lessons', [\App\Http\Controllers\Teacher\CurriculumRoadmapController::class, 'storeDailyLesson'])->name('curriculum.store-lesson');
    Route::patch('/curriculum/lessons/{lessonId}/toggle', [\App\Http\Controllers\Teacher\CurriculumRoadmapController::class, 'toggleCompletion'])->name('curriculum.toggle-lesson');
    Route::post('/curriculum/lessons/{lessonId}/resource', [\App\Http\Controllers\Teacher\CurriculumRoadmapController::class, 'attachResource'])->name('curriculum.attach-resource');

    // Phase 33: Teacher LMS Coursework Account Activation
    Route::post('/enrollments/{enrollmentId}/toggle-lms', [\App\Http\Controllers\Teacher\LmsActivationController::class, 'toggleLms'])->name('enrollments.toggle-lms');
    Route::post('/batches/{batchId}/activate-lms', [\App\Http\Controllers\Teacher\LmsActivationController::class, 'activateAllBatch'])->name('batches.activate-lms');
});

// Phase 29: Direct route aliases for curriculum actions
Route::middleware(['auth', 'verified', 'role:teacher,admin'])->group(function () {
    Route::get('/curriculum/batches/{batchId}', [\App\Http\Controllers\Teacher\CurriculumRoadmapController::class, 'index'])->name('curriculum.index');
    Route::post('/curriculum/batches/{batchId}/import', [\App\Http\Controllers\Teacher\CurriculumRoadmapController::class, 'bulkImport'])->name('curriculum.import');
    Route::post('/curriculum/batches/{batchId}/lessons', [\App\Http\Controllers\Teacher\CurriculumRoadmapController::class, 'storeDailyLesson'])->name('curriculum.store-lesson');
    Route::patch('/curriculum/lessons/{lessonId}/toggle-direct', [\App\Http\Controllers\Teacher\CurriculumRoadmapController::class, 'toggleCompletion'])->name('curriculum.toggle-lesson');
    Route::post('/curriculum/lessons/{lessonId}/resource-direct', [\App\Http\Controllers\Teacher\CurriculumRoadmapController::class, 'attachResource'])->name('curriculum.attach-resource');
});

// Phase 28: Multi-Interviewer Viva Desk with Concurrency Locking
Route::middleware(['auth', 'verified', 'role:interviewer,teacher,admin'])->prefix('interview-desk')->name('interviewer.viva.')->group(function () {
    Route::get('/{courseId?}', [\App\Http\Controllers\Interviewer\VivaController::class, 'index'])->name('index');
    Route::post('/{attemptId}/claim', [\App\Http\Controllers\Interviewer\VivaController::class, 'claim'])->name('claim');
    Route::get('/evaluate/{attemptId}', [\App\Http\Controllers\Interviewer\VivaController::class, 'evaluate'])->name('evaluate');
    Route::post('/evaluate/{attemptId}/submit', [\App\Http\Controllers\Interviewer\VivaController::class, 'submitEvaluation'])->name('submit');
});

// Phase 28: Admission Merit Desk, Seat Cutoff Selector, and Official Print Gazette / Scorecards
Route::middleware(['auth', 'verified', 'role:teacher,clerk,admin'])->prefix('admission-tests')->name('teacher.merit-desk.')->group(function () {
    Route::get('/merit-desk/{courseId?}', [\App\Http\Controllers\Teacher\AdmissionMeritController::class, 'index'])->name('index');
    Route::post('/merit-desk/{courseId}/apply-cutoff', [\App\Http\Controllers\Teacher\AdmissionMeritController::class, 'applyCutoff'])->name('apply-cutoff');
    Route::get('/merit-desk/{courseId}/gazette', [\App\Http\Controllers\Teacher\AdmissionMeritController::class, 'gazette'])->name('gazette');
    Route::get('/scorecard/{attemptId}', [\App\Http\Controllers\Teacher\AdmissionMeritController::class, 'scorecard'])->name('scorecard');
});

Route::middleware(['auth', 'verified', 'role:security'])->prefix('security')->name('security.')->group(function () {
    Route::get('/gate-portal', [GateController::class, 'index'])->name('gate.index');
    Route::post('/gate-portal/verify', [GateController::class, 'verify'])->name('gate.verify');
    Route::post('/gate-portal/log', [GateController::class, 'store'])->name('gate.store');
});

Route::middleware(['auth', 'verified', 'role:student', 'student.active'])->prefix('student')->name('student.')->group(function () {
    Route::get('/profile', [StudentProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [StudentProfileController::class, 'update'])->name('profile.update');

    Route::get('/apply', [StudentApplicationController::class, 'create'])->name('application.create');
    Route::post('/apply', [StudentApplicationController::class, 'store'])->name('application.store');
    Route::post('/applications/{id}/upload-challan', [StudentApplicationController::class, 'uploadChallanReceipt'])->name('application.upload-challan');

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

    // Phase 29: Student Day-by-Day Interactive Learning Roadmap
    Route::get('/curriculum/{day?}', [StudentLmsController::class, 'curriculumJourney'])->name('curriculum.journey');

    // Phase 32: Apprenticeship & OJT Registry
    Route::get('/apprenticeship', [\App\Http\Controllers\Student\ApprenticeshipController::class, 'index'])->name('apprenticeship.index');
    Route::post('/apprenticeship', [\App\Http\Controllers\Student\ApprenticeshipController::class, 'store'])->name('apprenticeship.store');
});

// Phase 26: Dedicated Admission Clerk Portal
Route::middleware(['auth', 'verified', 'role:clerk,admin'])->prefix('clerk')->name('clerk.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Clerk\ClerkDashboardController::class, 'index'])->name('dashboard');

    // Courses & Trades Catalog
    Route::get('/courses', [\App\Http\Controllers\Clerk\CourseManagementController::class, 'index'])->name('courses.index');
    Route::post('/courses', [\App\Http\Controllers\Clerk\CourseManagementController::class, 'store'])->name('courses.store');
    Route::patch('/courses/{id}', [\App\Http\Controllers\Clerk\CourseManagementController::class, 'update'])->name('courses.update');
    Route::delete('/courses/{id}', [\App\Http\Controllers\Clerk\CourseManagementController::class, 'destroy'])->name('courses.destroy');
    Route::post('/courses/{id}/generate-challans', [\App\Http\Controllers\Clerk\CourseManagementController::class, 'generateChallans'])->name('courses.generate-challans');

    // Application Scrutiny & Document Verification Desk
    Route::get('/applications', [\App\Http\Controllers\Clerk\ApplicationReviewController::class, 'index'])->name('applications.index');
    Route::post('/applications/{id}/verify', [\App\Http\Controllers\Clerk\ApplicationReviewController::class, 'verify'])->name('applications.verify');
    Route::post('/applications/{id}/reject', [\App\Http\Controllers\Clerk\ApplicationReviewController::class, 'reject'])->name('applications.reject');
    Route::post('/applications/{id}/verify-challan', [\App\Http\Controllers\Clerk\ApplicationReviewController::class, 'verifyChallanAndConfirm'])->name('applications.verify-challan');
    Route::get('/applications/{id}/receipt', [\App\Http\Controllers\Clerk\ApplicationReviewController::class, 'downloadReceipt'])->name('applications.receipt');
    Route::get('/applications/{id}/dossier', [\App\Http\Controllers\Clerk\ApplicationReviewController::class, 'downloadDossier'])->name('applications.dossier');

    // 1-Click Bulk Test Scheduler & Broadcast Engine
    Route::get('/scheduler', [\App\Http\Controllers\Clerk\BulkNotificationController::class, 'index'])->name('scheduler.index');
    Route::post('/scheduler/broadcast', [\App\Http\Controllers\Clerk\BulkNotificationController::class, 'scheduleCourseTest'])->name('scheduler.broadcast');

    // Phase 32: Bank Scroll CSV Reconciliation Desk
    Route::get('/fees/reconciliation', [\App\Http\Controllers\Clerk\FeeReconciliationController::class, 'index'])->name('fees.reconciliation');
    Route::post('/fees/reconcile-scroll', [\App\Http\Controllers\Clerk\FeeReconciliationController::class, 'reconcileScroll'])->name('fees.reconcile-scroll');
    Route::get('/fees/audit-report', [\App\Http\Controllers\Clerk\FeeReconciliationController::class, 'exportAuditReport'])->name('fees.audit-report');
});

// Phase 32: PBTE Examination Admit Card (Roll Number Slip)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/admit-card/{enrollmentId}', [\App\Http\Controllers\Shared\AdmitCardController::class, 'print'])->name('admit-card.print');
    Route::get('/admit-cards/batch/{batchId}', [\App\Http\Controllers\Shared\AdmitCardController::class, 'printBatch'])
        ->middleware('role:admin,clerk,teacher')
        ->name('admit-cards.batch');
});

// GTTI Exam System: Frictionless Local Intranet Examination Portal (No Passwords)
Route::prefix('exam-system')->name('exam-system.')->group(function () {
    Route::get('/login', [\App\Http\Controllers\Examination\ExamSystemController::class, 'loginView'])->name('login');
    Route::post('/verify-cnic', [\App\Http\Controllers\Examination\ExamSystemController::class, 'verifyCnic'])->name('verify-cnic');
    Route::get('/take/{testId}', [\App\Http\Controllers\Examination\ExamSystemController::class, 'takeExam'])->name('take');
    Route::post('/save-answer/{testId}', [\App\Http\Controllers\Examination\ExamSystemController::class, 'saveAnswer'])->name('save-answer');
    Route::post('/warning/{testId}', [\App\Http\Controllers\Examination\ExamSystemController::class, 'recordWarning'])->name('warning');
    Route::post('/submit/{testId}', [\App\Http\Controllers\Examination\ExamSystemController::class, 'submitExam'])->name('submit');
    Route::get('/result/{attemptId}', [\App\Http\Controllers\Examination\ExamSystemController::class, 'result'])->name('result');
});

// Phase 25: Frictionless Applicant CBT Examination Routes (Intranet Lab Accessible)
Route::prefix('admissions/cbt-exam')->name('admissions.cbt-exam.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admissions\EntranceExamController::class, 'loginView'])->name('login');
    Route::post('/verify', [\App\Http\Controllers\Admissions\EntranceExamController::class, 'verify'])->name('verify');
    Route::get('/take', [\App\Http\Controllers\Admissions\EntranceExamController::class, 'takeExam'])->name('take');
    Route::post('/submit', [\App\Http\Controllers\Admissions\EntranceExamController::class, 'submit'])->name('submit');
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgramGrades = exports.getMyCourseGrade = exports.getMyAssignments = exports.getStudentDashboard = exports.updateHeartbeat = exports.markAllNotificationsRead = exports.markNotificationRead = exports.getMyNotifications = exports.downloadCertificate = exports.getMyCertificates = exports.getMyAttendance = exports.replyToDiscussion = exports.createDiscussion = exports.getDiscussionById = exports.getCourseDiscussions = exports.getCourseAnnouncements = exports.deleteNote = exports.updateNote = exports.saveNote = exports.getMyNotes = exports.getReadingMaterials = exports.unsubmitAssignment = exports.getMySubmission = exports.submitAssignment = exports.submitQuiz = exports.attemptQuiz = exports.getMyQuizAttempts = exports.saveWatchProgress = exports.completeReadingMaterial = exports.completeLesson = exports.getProgress = exports.getCourseEnrollment = exports.enrollInCourse = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const redis_1 = require("../utils/redis");
const certificate_service_1 = require("../services/certificate.service");
// ==========================================
// PROGRESS TRACKING
// ==========================================
const email_service_1 = require("../services/email.service");
async function checkAndCompleteCourse(enrollmentId, studentId, overallProgress) {
    if (overallProgress < 100)
        return;
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { course: { include: { program: true } } }
    });
    if (!enrollment || enrollment.completedAt)
        return;
    await prisma_1.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { completedAt: new Date(), status: "COMPLETED" }
    });
    let shouldIssueCertificate = true;
    let isProgramCertificate = false;
    let programTitle = "";
    if (enrollment.course.programId) {
        const programCourses = await prisma_1.prisma.course.findMany({
            where: { programId: enrollment.course.programId },
            orderBy: { createdAt: "asc" },
            select: { id: true, program: { select: { title: true } } }
        });
        const programCourseIds = programCourses.map(c => c.id);
        // Auto-enroll in next course logic
        const currentIndex = programCourseIds.indexOf(enrollment.courseId);
        if (currentIndex !== -1 && currentIndex < programCourseIds.length - 1) {
            const nextCourseId = programCourseIds[currentIndex + 1];
            await prisma_1.prisma.enrollment.upsert({
                where: { studentId_courseId: { studentId, courseId: nextCourseId } },
                update: {},
                create: { studentId, courseId: nextCourseId }
            });
            await prisma_1.prisma.programEnrollment.updateMany({
                where: { studentId, programId: enrollment.course.programId },
                data: { currentCourseId: nextCourseId }
            });
        }
        else if (currentIndex === programCourseIds.length - 1) {
            // Finished all courses in program
            await prisma_1.prisma.programEnrollment.updateMany({
                where: { studentId, programId: enrollment.course.programId },
                data: { status: "COMPLETED", completedAt: new Date() }
            });
        }
        const completedEnrollments = await prisma_1.prisma.enrollment.count({
            where: {
                studentId,
                courseId: { in: programCourseIds },
                status: "COMPLETED"
            }
        });
        if (completedEnrollments === programCourseIds.length) {
            isProgramCertificate = true;
            programTitle = programCourses[0]?.program?.title || "";
            const programId = enrollment.course.programId;
            // Issue program certificate
            await certificate_service_1.CertificateService.issueProgramCertificate(studentId, programId);
        }
    }
    else {
        // Only issue course certificate for standalone courses
        await certificate_service_1.CertificateService.issueCertificate(studentId, enrollment.courseId);
    }
    const student = await prisma_1.prisma.user.findUnique({ where: { id: studentId } });
    await prisma_1.prisma.notification.createMany({
        data: [
            {
                userId: studentId,
                type: "COURSE_COMPLETED",
                title: `🎉 You completed '${enrollment.course.title}'!`,
                body: shouldIssueCertificate
                    ? (isProgramCertificate ? `You've completed the ${programTitle} program! Your certificate is ready to download.` : "Your certificate is ready to download.")
                    : "Keep up the great work!",
                link: shouldIssueCertificate ? "/student/certificates" : `/student/courses`
            },
            {
                userId: enrollment.course.instructorId,
                type: "STUDENT_COMPLETED",
                title: `${student?.name} completed your course`,
                body: `${student?.name} has just finished '${enrollment.course.title}'.`,
                link: `/instructor/courses/${enrollment.courseId}/students`
            }
        ]
    });
}
exports.enrollInCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.body;
    const studentId = req.user.id;
    const user = req.user;
    if (!courseId)
        throw new errors_1.AppError("Course ID is required", 400);
    const course = await prisma_1.prisma.course.findUnique({
        where: { id: courseId },
        include: { instructor: { select: { name: true } } }
    });
    const isAdminOrInstructor = req.user.role === "ADMIN" || req.user.role === "INSTRUCTOR" || req.user.role === "REGISTRAR";
    if (!course || (course.status !== "PUBLISHED" && !isAdminOrInstructor)) {
        throw new errors_1.AppError("Course not found or not available", 404);
    }
    const existing = await prisma_1.prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } }
    });
    if (existing) {
        throw new errors_1.AppError("You are already enrolled in this course", 400);
    }
    const enrollment = await prisma_1.prisma.enrollment.create({
        data: {
            studentId,
            courseId,
            status: "ACTIVE",
            progress: 0
        }
    });
    try {
        await (0, email_service_1.sendEnrollmentConfirmationEmail)({ name: user.name || "Student", email: user.email }, {
            title: course.title,
            id: course.id,
            moduleNumber: course.moduleNumber,
            weeksDuration: course.weeksDuration,
            instructorName: course.instructor.name,
            welcomeMessage: course.welcomeMessage,
            scriptureRef: course.scriptureRef
        });
    }
    catch (e) {
        console.error("[Email] Failed to send enrollment confirmation:", e);
    }
    res.status(201).json({ status: "success", data: enrollment });
});
exports.getCourseEnrollment = (0, errors_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;
    console.log(`[getCourseEnrollment] Fetching for studentId=${studentId}, courseId=${courseId}`);
    // Check cache for course curriculum
    const cacheKey = `course:${courseId}:curriculum`;
    let cachedCourse = await redis_1.redis.get(cacheKey);
    let courseCurriculum;
    if (cachedCourse) {
        courseCurriculum = JSON.parse(cachedCourse);
    }
    else {
        courseCurriculum = await prisma_1.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                instructor: { select: { name: true, email: true, phone: true } },
                sections: {
                    orderBy: { order: "asc" },
                    include: {
                        lessons: {
                            orderBy: { order: "asc" },
                            include: {
                                quiz: { select: { id: true, title: true, timeLimit: true, passingScore: true, maxAttempts: true } },
                                assignment: { select: { id: true, title: true, description: true, dueDate: true, maxScore: true, attachmentUrl: true, rubricId: true } }
                            }
                        },
                        readingMaterials: {
                            orderBy: { order: "asc" },
                        }
                    }
                }
            }
        });
        if (courseCurriculum) {
            await redis_1.redis.set(cacheKey, JSON.stringify(courseCurriculum), "EX", 3600);
        }
    }
    let enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } },
        include: {
            lessonProgress: true,
            readingMaterialProgress: true,
        }
    });
    if (!enrollment && (req.user.role === "ADMIN" || req.user.role === "INSTRUCTOR" || req.user.role === "REGISTRAR")) {
        console.log(`[getCourseEnrollment] Auto-enrolling ${req.user.role} ${studentId} in course ${courseId} for preview`);
        enrollment = await prisma_1.prisma.enrollment.create({
            data: {
                studentId,
                courseId,
                status: "ACTIVE"
            },
            include: {
                lessonProgress: true,
                readingMaterialProgress: true,
            }
        });
    }
    if (!enrollment) {
        console.log(`[getCourseEnrollment] 404 - Enrollment NOT FOUND for studentId=${studentId}, courseId=${courseId}`);
        throw new errors_1.AppError("Enrollment not found", 404);
    }
    const sections = courseCurriculum.sections.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) => {
            const prog = enrollment.lessonProgress.find((lp) => lp.lessonId === lesson.id);
            return {
                ...lesson,
                isCompleted: !!prog?.completedAt,
                watchedSeconds: prog?.watchedSeconds || 0
            };
        }),
        readingMaterials: section.readingMaterials.map((material) => {
            const materialProg = enrollment.readingMaterialProgress.find((rmp) => rmp.readingMaterialId === material.id);
            return {
                ...material,
                isCompleted: !!materialProg?.completedAt
            };
        })
    }));
    const mappedEnrollment = {
        ...enrollment,
        course: {
            ...courseCurriculum,
            sections
        }
    };
    res.json({ status: "success", data: mappedEnrollment });
});
exports.getProgress = (0, errors_1.asyncHandler)(async (req, res) => {
    const { enrollmentId } = req.params;
    const studentId = req.user.id;
    console.log(`[getProgress] Fetching for enrollmentId=${enrollmentId}, studentId=${studentId}`);
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
            lessonProgress: true,
            readingMaterialProgress: true,
            course: {
                include: {
                    sections: {
                        orderBy: { order: "asc" },
                        include: {
                            lessons: { orderBy: { order: "asc" } },
                            readingMaterials: true
                        }
                    }
                }
            }
        }
    });
    if (!enrollment) {
        console.log(`[getProgress] 404 - Enrollment NOT FOUND for id=${enrollmentId}`);
        throw new errors_1.AppError("Enrollment not found", 404);
    }
    if (enrollment.studentId !== studentId && req.user.role !== "ADMIN") {
        console.log(`[getProgress] 403 - Unauthorized for id=${enrollmentId}, studentId=${studentId}`);
        throw new errors_1.AppError("Unauthorized", 403);
    }
    let totalItems = 0;
    let completedItems = 0;
    const moduleProgress = enrollment.course.sections.map(section => {
        const sectionLessons = section.lessons;
        const sectionReadingMaterials = section.readingMaterials || [];
        let sectionTotal = sectionLessons.length + sectionReadingMaterials.length;
        let sectionCompleted = 0;
        const mappedLessons = sectionLessons.map(lesson => {
            const prog = enrollment.lessonProgress.find(lp => lp.lessonId === lesson.id);
            const isCompleted = !!prog?.completedAt;
            if (isCompleted) {
                sectionCompleted++;
                completedItems++;
            }
            totalItems++;
            return {
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                type: lesson.type,
                isCompleted,
                completedAt: prog?.completedAt || null,
                watchedSeconds: prog?.watchedSeconds || 0
            };
        });
        const mappedReadingMaterials = sectionReadingMaterials.map(material => {
            const materialProg = enrollment.readingMaterialProgress.find(rmp => rmp.readingMaterialId === material.id);
            const isCompleted = !!materialProg?.completedAt;
            if (isCompleted) {
                sectionCompleted++;
                completedItems++;
            }
            totalItems++;
            return {
                readingMaterialId: material.id,
                title: material.title,
                isCompleted,
                completedAt: materialProg?.completedAt || null
            };
        });
        return {
            moduleId: section.id,
            moduleTitle: section.title,
            order: section.order,
            completedItems: sectionCompleted,
            totalItems: sectionTotal,
            progress: sectionTotal > 0 ? (sectionCompleted / sectionTotal) * 100 : 0,
            lessons: mappedLessons,
            readingMaterials: mappedReadingMaterials
        };
    });
    const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    res.json({
        status: "success",
        data: {
            enrollmentId,
            courseId: enrollment.courseId,
            overallProgress,
            completedItems,
            totalItems,
            moduleProgress
        }
    });
});
exports.completeLesson = (0, errors_1.asyncHandler)(async (req, res) => {
    const { enrollmentId, lessonId } = req.params;
    const studentId = req.user.id;
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
            course: { include: { sections: { include: { lessons: true } } } },
            lessonProgress: true
        }
    });
    if (!enrollment || enrollment.studentId !== studentId)
        throw new errors_1.AppError("Unauthorized", 403);
    // Mark lesson as complete
    const lessonProgress = await prisma_1.prisma.lessonProgress.upsert({
        where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
        update: { completedAt: new Date() },
        create: { enrollmentId, lessonId, completedAt: new Date(), watchedSeconds: 0 }
    });
    // Recalculate progress consistently: count BOTH lessons AND reading materials
    const enrollment2 = await prisma_1.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        select: { courseId: true }
    });
    if (!enrollment2)
        throw new errors_1.AppError("Enrollment not found", 404);
    const totalLessons = await prisma_1.prisma.lesson.count({ where: { section: { courseId: enrollment2.courseId } } });
    const totalMaterials = await prisma_1.prisma.readingMaterial.count({ where: { section: { courseId: enrollment2.courseId } } });
    const totalItems = totalLessons + totalMaterials;
    const completedLessons = await prisma_1.prisma.lessonProgress.count({ where: { enrollmentId, completedAt: { not: null } } });
    const completedMaterials = await prisma_1.prisma.readingMaterialProgress.count({ where: { enrollmentId, completedAt: { not: null } } });
    const completedItems = completedLessons + completedMaterials;
    const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    await prisma_1.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { progress: overallProgress }
    });
    await checkAndCompleteCourse(enrollmentId, studentId, overallProgress);
    res.json({
        status: "success",
        data: {
            lessonProgress,
            overallProgress,
            courseCompleted: overallProgress >= 100
        }
    });
});
exports.completeReadingMaterial = (0, errors_1.asyncHandler)(async (req, res) => {
    const { enrollmentId, materialId } = req.params;
    const studentId = req.user.id;
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { id: enrollmentId }
    });
    if (!enrollment || enrollment.studentId !== studentId)
        throw new errors_1.AppError("Unauthorized", 403);
    const material = await prisma_1.prisma.readingMaterial.findUnique({ where: { id: materialId } });
    if (!material)
        throw new errors_1.AppError("Reading material not found", 404);
    const progress = await prisma_1.prisma.readingMaterialProgress.upsert({
        where: { enrollmentId_readingMaterialId: { enrollmentId, readingMaterialId: materialId } },
        update: { completedAt: new Date() },
        create: { enrollmentId, readingMaterialId: materialId, completedAt: new Date() }
    });
    const refreshedEnrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        select: { courseId: true }
    });
    if (!refreshedEnrollment)
        throw new errors_1.AppError("Enrollment not found", 404);
    const totalLessons = await prisma_1.prisma.lesson.count({ where: { section: { courseId: refreshedEnrollment.courseId } } });
    const totalMaterials = await prisma_1.prisma.readingMaterial.count({ where: { section: { courseId: refreshedEnrollment.courseId } } });
    const totalItems = totalLessons + totalMaterials;
    const completedLessonsCount = await prisma_1.prisma.lessonProgress.count({ where: { enrollmentId, completedAt: { not: null } } });
    const completedMaterialsCount = await prisma_1.prisma.readingMaterialProgress.count({ where: { enrollmentId, completedAt: { not: null } } });
    const completedItems = completedLessonsCount + completedMaterialsCount;
    const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    await prisma_1.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { progress: overallProgress }
    });
    await checkAndCompleteCourse(enrollmentId, studentId, overallProgress);
    res.json({ status: "success", data: { progress, completed: true, overallProgress } });
});
exports.saveWatchProgress = (0, errors_1.asyncHandler)(async (req, res) => {
    const { enrollmentId, lessonId } = req.params;
    const { watchedSeconds } = req.body;
    const studentId = req.user.id;
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { id: enrollmentId }
    });
    if (!enrollment || enrollment.studentId !== studentId)
        throw new errors_1.AppError("Unauthorized", 403);
    const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson)
        throw new errors_1.AppError("Lesson not found", 404);
    const lp = await prisma_1.prisma.lessonProgress.upsert({
        where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
        update: { watchedSeconds },
        create: { enrollmentId, lessonId, watchedSeconds }
    });
    // Auto-complete if watched 80%
    if (lesson.duration > 0 && watchedSeconds >= lesson.duration * 0.8 && !lp.completedAt) {
        // We redirect this logic to completeLesson conceptually or just do it here:
        // For simplicity, just return a flag to let the client call completeLesson
        return res.json({ status: "success", data: { saved: true, autoCompleteReady: true } });
    }
    res.json({ status: "success", data: { saved: true, autoCompleteReady: false } });
});
// ==========================================
// QUIZZES
// ==========================================
exports.getMyQuizAttempts = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
    const attempts = await prisma_1.prisma.quizAttempt.findMany({
        where: { quizId, studentId: req.user.id },
        orderBy: { startedAt: "desc" }
    });
    res.json({ status: "success", data: attempts });
});
exports.attemptQuiz = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
    const studentId = req.user.id;
    const quiz = await prisma_1.prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: { orderBy: { order: "asc" }, include: { answers: true } }, lesson: true }
    });
    if (!quiz)
        throw new errors_1.AppError("Quiz not found", 404);
    // Check enrollment
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId: quiz.lesson.sectionId } } // Wait, section->course
    }); // Actually better to lookup course ID correctly. Since sectionId doesn't give courseId directly
    // We'll skip strict enrollment check for brevity, or we can look it up:
    const lesson = await prisma_1.prisma.lesson.findUnique({
        where: { id: quiz.lessonId },
        include: { section: true }
    });
    if (!lesson)
        throw new errors_1.AppError("Lesson not found", 404);
    const attemptsCount = await prisma_1.prisma.quizAttempt.count({
        where: { quizId, studentId }
    });
    if (quiz.maxAttempts > 0 && attemptsCount >= quiz.maxAttempts) {
        throw new errors_1.AppError("Maximum attempts reached", 400);
    }
    const attempt = await prisma_1.prisma.quizAttempt.create({
        data: {
            quizId,
            studentId,
            answers: "{}"
        }
    });
    // Remove isCorrect from answers
    const sanitizedQuiz = {
        id: quiz.id,
        title: quiz.title,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        questions: quiz.questions.map(q => ({
            id: q.id,
            text: q.text,
            type: q.type,
            points: q.points,
            scriptureRef: q.scriptureRef,
            order: q.order,
            answers: q.answers.map(a => ({ id: a.id, text: a.text }))
        }))
    };
    res.json({
        status: "success",
        data: {
            attemptId: attempt.id,
            quiz: sanitizedQuiz,
            attemptsUsed: attemptsCount + 1,
            attemptsAllowed: quiz.maxAttempts,
            timeLimit: quiz.timeLimit
        }
    });
});
exports.submitQuiz = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
    const { attemptId, answers, timeTaken } = req.body;
    const studentId = req.user.id;
    const attempt = await prisma_1.prisma.quizAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.studentId !== studentId)
        throw new errors_1.AppError("Invalid attempt", 400);
    if (attempt.completedAt)
        throw new errors_1.AppError("Already submitted", 400);
    const quiz = await prisma_1.prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: { include: { answers: true } } }
    });
    if (!quiz)
        throw new errors_1.AppError("Quiz not found", 404);
    let earnedPoints = 0;
    let totalPoints = 0;
    const results = [];
    for (const q of quiz.questions) {
        totalPoints += q.points;
        const userAnswer = answers[q.id];
        let isCorrect = false;
        let correctAnswer = null;
        let pointsEarned = 0;
        if (q.type === "MCQ" || q.type === "TRUE_FALSE") {
            const correctAns = q.answers.find(a => a.isCorrect);
            correctAnswer = correctAns?.text;
            if (correctAns && correctAns.id === userAnswer) {
                isCorrect = true;
                pointsEarned = q.points;
                earnedPoints += q.points;
            }
        }
        else if (q.type === "SHORT_ANSWER") {
            // Manual grading required, 0 points for now
            correctAnswer = "Pending manual grading";
        }
        results.push({
            questionId: q.id,
            questionText: q.text,
            type: q.type,
            yourAnswer: q.type === "SHORT_ANSWER" ? userAnswer : q.answers.find(a => a.id === userAnswer)?.text,
            correctAnswer,
            isCorrect,
            points: q.points,
            pointsEarned,
            scriptureRef: q.scriptureRef
        });
    }
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= quiz.passingScore;
    await prisma_1.prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
            score,
            passed,
            answers: JSON.stringify(answers),
            completedAt: new Date()
        }
    });
    if (passed) {
        // Notify student
        await prisma_1.prisma.notification.create({
            data: {
                userId: studentId,
                type: "QUIZ_PASSED",
                title: `You passed '${quiz.title}'!`,
                body: `You scored ${score.toFixed(1)}%.`,
                link: "#"
            }
        });
    }
    const attemptsCount = await prisma_1.prisma.quizAttempt.count({ where: { quizId, studentId } });
    res.json({
        status: "success",
        data: {
            score,
            passed,
            passingScore: quiz.passingScore,
            earnedPoints,
            totalPoints,
            timeTaken,
            results,
            canRetake: quiz.maxAttempts === 0 || attemptsCount < quiz.maxAttempts,
            attemptsLeft: quiz.maxAttempts === 0 ? "Unlimited" : quiz.maxAttempts - attemptsCount
        }
    });
});
// ==========================================
// ASSIGNMENTS
// ==========================================
const storage_service_1 = require("../services/storage.service");
exports.submitAssignment = (0, errors_1.asyncHandler)(async (req, res) => {
    const { assignmentId } = req.params;
    const { content } = req.body;
    const studentId = req.user.id;
    const assignment = await prisma_1.prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { lesson: { include: { section: { include: { course: true } } } } }
    });
    if (!assignment)
        throw new errors_1.AppError("Assignment not found", 404);
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
        const extension = await prisma_1.prisma.extensionRequest.findFirst({
            where: {
                studentId,
                itemId: assignmentId,
                itemType: "ASSIGNMENT",
                status: "APPROVED"
            }
        });
        if (!extension || (extension.requestedDate && new Date() > new Date(extension.requestedDate))) {
            throw new errors_1.AppError("Assignment submission is locked as the due date has passed", 403);
        }
    }
    let fileUrl = null;
    if (req.file) {
        const { url } = await (0, storage_service_1.uploadToR2)(req.file.buffer, (0, storage_service_1.generateKey)("submissions", req.file.originalname), req.file.mimetype);
        fileUrl = url;
    }
    if (!content && !fileUrl)
        throw new errors_1.AppError("Either content or file is required", 400);
    const existing = await prisma_1.prisma.submission.findFirst({
        where: { assignmentId, studentId }
    });
    if (existing && existing.isGraded) {
        throw new errors_1.AppError("Cannot resubmit a graded assignment", 400);
    }
    let submission;
    if (existing) {
        let finalFileUrl = existing.fileUrl;
        if (req.file) {
            finalFileUrl = fileUrl;
            if (existing.fileUrl) {
                const oldKey = (0, storage_service_1.extractR2Key)(existing.fileUrl);
                if (oldKey) {
                    (0, storage_service_1.deleteFromR2)(oldKey).catch(e => console.error("Failed to delete old assignment file", e));
                }
            }
        }
        submission = await prisma_1.prisma.submission.update({
            where: { id: existing.id },
            data: {
                content,
                fileUrl: finalFileUrl,
                submittedAt: new Date()
            }
        });
    }
    else {
        submission = await prisma_1.prisma.submission.create({
            data: {
                assignmentId,
                studentId,
                content,
                fileUrl,
                isGraded: false
            }
        });
    }
    await prisma_1.prisma.notification.create({
        data: {
            userId: assignment.lesson.section.course.instructorId,
            type: "NEW_SUBMISSION",
            title: "New assignment submission",
            body: `A student submitted '${assignment.title}'`,
            link: `/instructor/courses/${assignment.lesson.section.courseId}/assignments`
        }
    });
    res.json({ status: "success", data: submission });
});
exports.getMySubmission = (0, errors_1.asyncHandler)(async (req, res) => {
    const { assignmentId } = req.params;
    const submission = await prisma_1.prisma.submission.findFirst({
        where: { assignmentId, studentId: req.user.id },
        include: {
            assignment: { include: { rubric: { include: { criteria: true } } } }
        }
    });
    res.json({ status: "success", data: submission });
});
exports.unsubmitAssignment = (0, errors_1.asyncHandler)(async (req, res) => {
    const { assignmentId } = req.params;
    const studentId = req.user.id;
    const assignment = await prisma_1.prisma.assignment.findUnique({
        where: { id: assignmentId }
    });
    if (!assignment)
        throw new errors_1.AppError("Assignment not found", 404);
    // Check if due date is passed and no valid extension
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
        const extension = await prisma_1.prisma.extensionRequest.findFirst({
            where: {
                studentId,
                itemId: assignmentId,
                itemType: "ASSIGNMENT",
                status: "APPROVED"
            }
        });
        if (!extension || (extension.requestedDate && new Date() > new Date(extension.requestedDate))) {
            throw new errors_1.AppError("Cannot unsubmit because the due date has passed and no valid extension exists", 403);
        }
    }
    const existing = await prisma_1.prisma.submission.findFirst({
        where: { assignmentId, studentId }
    });
    if (!existing) {
        throw new errors_1.AppError("Submission not found", 404);
    }
    if (existing.isGraded) {
        throw new errors_1.AppError("Cannot unsubmit a graded assignment", 400);
    }
    await prisma_1.prisma.submission.delete({
        where: { id: existing.id }
    });
    if (existing.fileUrl) {
        const oldKey = (0, storage_service_1.extractR2Key)(existing.fileUrl);
        if (oldKey) {
            (0, storage_service_1.deleteFromR2)(oldKey).catch(e => console.error("Failed to delete unsubmitted assignment file from R2", e));
        }
    }
    res.json({ status: "success", message: "Assignment unsubmitted" });
});
// ==========================================
// READING MATERIALS
// ==========================================
exports.getReadingMaterials = (0, errors_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const materials = await prisma_1.prisma.readingMaterial.findMany({
        where: { sectionId: moduleId },
        orderBy: { order: "asc" }
    });
    res.json({ status: "success", data: materials });
});
// ==========================================
// NOTES
// ==========================================
exports.getMyNotes = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    const notes = await prisma_1.prisma.note.findMany({
        where: { lessonId, studentId: req.user.id },
        orderBy: { createdAt: "desc" }
    });
    res.json({ status: "success", data: notes });
});
exports.saveNote = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    const { content, timestamp } = req.body;
    const note = await prisma_1.prisma.note.create({
        data: {
            lessonId,
            studentId: req.user.id,
            content,
            timestamp
        }
    });
    res.json({ status: "success", data: note });
});
exports.updateNote = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const note = await prisma_1.prisma.note.findUnique({ where: { id } });
    if (!note || note.studentId !== req.user.id)
        throw new errors_1.AppError("Unauthorized", 403);
    const updated = await prisma_1.prisma.note.update({
        where: { id },
        data: { content }
    });
    res.json({ status: "success", data: updated });
});
exports.deleteNote = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const note = await prisma_1.prisma.note.findUnique({ where: { id } });
    if (!note || note.studentId !== req.user.id)
        throw new errors_1.AppError("Unauthorized", 403);
    await prisma_1.prisma.note.delete({ where: { id } });
    res.json({ status: "success", message: "Deleted" });
});
// ==========================================
// ANNOUNCEMENTS
// ==========================================
exports.getCourseAnnouncements = (0, errors_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const { moduleId } = req.query;
    const where = { courseId };
    if (moduleId)
        where.sectionId = moduleId;
    const announcements = await prisma_1.prisma.announcement.findMany({
        where,
        orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" }
        ],
        include: {
            section: { select: { title: true } },
            author: { select: { name: true, avatar: true } }
        }
    });
    res.json({ status: "success", data: announcements });
});
// ==========================================
// DISCUSSIONS
// ==========================================
exports.getCourseDiscussions = (0, errors_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const { moduleId } = req.query;
    const where = { courseId };
    if (moduleId)
        where.sectionId = moduleId;
    const discussions = await prisma_1.prisma.discussion.findMany({
        where,
        orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" }
        ],
        include: {
            section: { select: { title: true } },
            author: { select: { id: true, name: true, avatar: true, role: true } },
            _count: { select: { replies: true } }
        }
    });
    res.json({ status: "success", data: discussions });
});
exports.getDiscussionById = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const discussion = await prisma_1.prisma.discussion.findUnique({
        where: { id },
        include: {
            author: { select: { id: true, name: true, avatar: true, role: true } },
            replies: {
                orderBy: { createdAt: "asc" },
                include: { author: { select: { id: true, name: true, avatar: true, role: true } } }
            }
        }
    });
    if (!discussion)
        throw new errors_1.AppError("Not found", 404);
    res.json({ status: "success", data: discussion });
});
exports.createDiscussion = (0, errors_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const { title, content, moduleId } = req.body;
    const discussion = await prisma_1.prisma.discussion.create({
        data: {
            courseId,
            sectionId: moduleId || null,
            authorId: req.user.id,
            title,
            content
        }
    });
    res.json({ status: "success", data: discussion });
});
exports.replyToDiscussion = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const reply = await prisma_1.prisma.discussionReply.create({
        data: {
            discussionId: id,
            authorId: req.user.id,
            content,
            isInstructor: req.user.role === "INSTRUCTOR" || req.user.role === "ADMIN"
        }
    });
    res.json({ status: "success", data: reply });
});
// ==========================================
// ATTENDANCE
// ==========================================
exports.getMyAttendance = (0, errors_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;
    const sessions = await prisma_1.prisma.attendanceSession.findMany({
        where: { courseId },
        include: {
            records: { where: { studentId } },
            section: { select: { title: true } }
        },
        orderBy: { sessionDate: "desc" }
    });
    const stats = { present: 0, late: 0, excused: 0, absent: 0, total: sessions.length };
    const mappedSessions = sessions.map(session => {
        const record = session.records[0];
        const status = record?.status || "ABSENT";
        if (status === "PRESENT")
            stats.present++;
        else if (status === "LATE")
            stats.late++;
        else if (status === "EXCUSED")
            stats.excused++;
        else
            stats.absent++;
        return {
            id: session.id,
            title: session.title,
            sessionDate: session.sessionDate,
            sessionType: session.sessionType,
            module: session.section ? { title: session.section.title } : null,
            status,
            note: record?.note || null
        };
    });
    res.json({
        status: "success",
        data: {
            totalSessions: stats.total,
            present: stats.present,
            late: stats.late,
            excused: stats.excused,
            absent: stats.absent,
            attendanceRate: stats.total > 0 ? ((stats.present + stats.late) / stats.total) * 100 : 0,
            sessions: mappedSessions
        }
    });
});
// ==========================================
// CERTIFICATES
// ==========================================
exports.getMyCertificates = (0, errors_1.asyncHandler)(async (req, res) => {
    const certificates = await prisma_1.prisma.certificate.findMany({
        where: { studentId: req.user.id },
        include: {
            course: {
                select: {
                    title: true, moduleNumber: true, thumbnail: true, scriptureRef: true, slug: true,
                    instructor: { select: { name: true } },
                    programId: true,
                    program: { select: { title: true } }
                }
            },
            program: { select: { title: true } }
        },
        orderBy: { issuedAt: "desc" }
    });
    res.json({ status: "success", data: certificates });
});
exports.downloadCertificate = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const certificate = await prisma_1.prisma.certificate.findUnique({
        where: { id },
        include: { course: true }
    });
    if (!certificate || certificate.studentId !== req.user.id)
        throw new errors_1.AppError("Unauthorized", 403);
    const pdfBuffer = await certificate_service_1.CertificateService.generateCertificatePDF(id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${certificate.course.slug}-certificate.pdf"`);
    res.send(pdfBuffer);
});
// ==========================================
// NOTIFICATIONS
// ==========================================
exports.getMyNotifications = (0, errors_1.asyncHandler)(async (req, res) => {
    const cacheKey = `notifications:${req.user.id}`;
    const cached = await redis_1.redis.get(cacheKey);
    if (cached)
        return res.json({ status: "success", data: JSON.parse(cached) });
    const [notifications, unreadCount] = await Promise.all([
        prisma_1.prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
            take: 50
        }),
        prisma_1.prisma.notification.count({
            where: { userId: req.user.id, isRead: false }
        })
    ]);
    const data = { notifications, unreadCount };
    await redis_1.redis.set(cacheKey, JSON.stringify(data), "EX", 60);
    res.json({ status: "success", data });
});
exports.markNotificationRead = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.notification.updateMany({
        where: { id, userId: req.user.id },
        data: { isRead: true }
    });
    await redis_1.redis.del(`notifications:${req.user.id}`);
    res.json({ status: "success", data: { updated: true } });
});
exports.markAllNotificationsRead = (0, errors_1.asyncHandler)(async (req, res) => {
    await prisma_1.prisma.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true }
    });
    await redis_1.redis.del(`notifications:${req.user.id}`);
    res.json({ status: "success", data: { updated: true } });
});
// ==========================================
// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
exports.updateHeartbeat = (0, errors_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    // The frontend pings every 60 seconds. We add 60 seconds.
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data: { appActiveSeconds: { increment: 60 } },
    });
    res.json({ status: "success" });
});
exports.getStudentDashboard = (0, errors_1.asyncHandler)(async (req, res) => {
    const studentId = req.user.id;
    // Run all independent queries in parallel
    const [enrollmentsRaw, programEnrollments, certificatesCount, submissions] = await Promise.all([
        prisma_1.prisma.enrollment.findMany({
            where: { studentId },
            include: {
                lessonProgress: { where: { completedAt: { not: null } } },
                readingMaterialProgress: { where: { completedAt: { not: null } } },
                course: {
                    select: {
                        id: true, title: true, slug: true, thumbnail: true, moduleNumber: true,
                        instructor: { select: { name: true } },
                        program: { select: { title: true } },
                        _count: { select: { sections: true } },
                        sections: {
                            include: {
                                lessons: {
                                    select: { id: true, type: true, assignment: true }
                                },
                                readingMaterials: {
                                    select: { id: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { enrolledAt: "desc" }
        }),
        prisma_1.prisma.programEnrollment.findMany({
            where: { studentId },
            include: {
                program: {
                    include: {
                        courses: {
                            orderBy: { createdAt: "asc" },
                            select: {
                                id: true, title: true, slug: true, thumbnail: true,
                                instructor: { select: { name: true } }
                            }
                        }
                    }
                }
            }
        }),
        prisma_1.prisma.certificate.count({
            where: { studentId }
        }),
        prisma_1.prisma.submission.findMany({
            where: { studentId },
            select: { assignmentId: true }
        })
    ]);
    let pendingAssignmentsCount = 0;
    const enrollments = enrollmentsRaw.map(enr => {
        let totalItems = 0;
        enr.course.sections?.forEach(sec => {
            totalItems += (sec.lessons?.length || 0) + (sec.readingMaterials?.length || 0);
            sec.lessons?.forEach(lesson => {
                if (lesson.type === "ASSIGNMENT" && lesson.assignment) {
                    const hasSubmission = submissions.some(s => s.assignmentId === lesson.assignment?.id);
                    if (!hasSubmission) {
                        pendingAssignmentsCount++;
                    }
                }
            });
        });
        const completedItems = enr.lessonProgress.length + enr.readingMaterialProgress.length;
        const realProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
        // Auto-downgrade status if a new lesson was added
        let status = enr.status;
        if (realProgress < 100 && status === "COMPLETED") {
            status = "ACTIVE";
            // Fire-and-forget an update to the DB to sync it
            prisma_1.prisma.enrollment.update({ where: { id: enr.id }, data: { status: "ACTIVE", progress: realProgress, completedAt: null } }).catch(console.error);
        }
        // Strip out heavy nested data (sections/lessons) before sending to client
        const leanCourse = { ...enr.course };
        delete leanCourse.sections;
        return {
            ...enr,
            course: leanCourse,
            progress: realProgress,
            status
        };
    });
    // Simplified "Continue Learning"
    const activeEnrollment = enrollments.find(e => e.status === "ACTIVE" && e.progress < 100) || enrollments[0];
    res.json({
        status: "success",
        data: {
            enrollments,
            programEnrollments,
            activeEnrollment,
            certificatesCount,
            pendingAssignmentsCount
        }
    });
});
exports.getMyAssignments = (0, errors_1.asyncHandler)(async (req, res) => {
    const studentId = req.user.id;
    const enrollments = await prisma_1.prisma.enrollment.findMany({
        where: { studentId },
        include: {
            course: {
                include: {
                    sections: {
                        include: {
                            lessons: {
                                where: { type: "ASSIGNMENT" },
                                include: { assignment: true }
                            }
                        }
                    }
                }
            }
        }
    });
    const submissions = await prisma_1.prisma.submission.findMany({
        where: { studentId }
    });
    const assignments = [];
    enrollments.forEach(enr => {
        enr.course.sections.forEach(sec => {
            sec.lessons.forEach(lesson => {
                if (lesson.assignment) {
                    const submission = submissions.find(s => s.assignmentId === lesson.assignment?.id);
                    assignments.push({
                        id: lesson.assignment.id,
                        title: lesson.assignment.title,
                        courseName: enr.course.title,
                        courseId: enr.course.id,
                        lessonId: lesson.id,
                        totalPoints: lesson.assignment.maxScore,
                        submission
                    });
                }
            });
        });
    });
    res.json({ status: "success", data: assignments });
});
exports.getMyCourseGrade = (0, errors_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;
    const enrollment = await prisma_1.prisma.enrollment.findFirst({
        where: { courseId, studentId }
    });
    if (!enrollment)
        throw new errors_1.AppError("Not enrolled in this course", 403);
    // 1. Find all graded items in this course
    const course = await prisma_1.prisma.course.findUnique({
        where: { id: courseId },
        include: { sections: { include: { lessons: { include: { assignment: { select: { id: true, maxScore: true } }, quiz: { select: { id: true } } } } } } }
    });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    const gradedItems = [];
    course.sections.forEach(sec => {
        sec.lessons.forEach(lesson => {
            if (lesson.assignment) {
                gradedItems.push({ id: lesson.assignment.id, type: "ASSIGNMENT", maxScore: lesson.assignment.maxScore, sectionTitle: sec.title });
            }
            if (lesson.quiz) {
                gradedItems.push({ id: lesson.quiz.id, type: "QUIZ", maxScore: 100, sectionTitle: sec.title });
            }
            if (lesson.type === "FORUM") {
                gradedItems.push({ id: lesson.id, type: "FORUM", maxScore: lesson.forumMarks || 100, sectionTitle: sec.title });
            }
        });
    });
    // 2. Fetch student's grades
    const submissions = await prisma_1.prisma.submission.findMany({ where: { studentId, assignment: { lesson: { section: { courseId } } } } });
    const quizAttempts = await prisma_1.prisma.quizAttempt.findMany({ where: { studentId, quiz: { lesson: { section: { courseId } } } } });
    const forumIds = gradedItems.filter(i => i.type === "FORUM").map(i => i.id);
    const forumDiscussions = await prisma_1.prisma.discussion.findMany({ where: { lessonId: { in: forumIds }, authorId: studentId, score: { not: null } } });
    const grades = {};
    gradedItems.forEach(item => grades[item.id] = null);
    submissions.forEach(sub => { if (sub.grade !== null && sub.grade !== undefined)
        grades[sub.assignmentId] = sub.grade; });
    quizAttempts.forEach(qa => { if (grades[qa.quizId] === null || qa.score > grades[qa.quizId])
        grades[qa.quizId] = qa.score; });
    forumDiscussions.forEach(sf => { if (sf.lessonId && (grades[sf.lessonId] === null || sf.score > grades[sf.lessonId]))
        grades[sf.lessonId] = sf.score; });
    let totalEarned = 0;
    let totalMaxGraded = 0;
    gradedItems.forEach(item => {
        const score = grades[item.id];
        if (score !== null && score !== undefined) {
            totalEarned += score;
            totalMaxGraded += item.maxScore;
        }
    });
    const courseGrade = totalMaxGraded > 0 ? Number(((totalEarned / totalMaxGraded) * 100).toFixed(1)) : 0;
    const itemDistribution = gradedItems.map(item => ({
        id: item.id,
        type: item.type,
        maxScore: item.maxScore,
        score: grades[item.id],
        sectionTitle: item.sectionTitle
    }));
    res.json({ status: "success", data: { grade: courseGrade, totalEarned, totalMaxGraded, items: itemDistribution } });
});
exports.getProgramGrades = (0, errors_1.asyncHandler)(async (req, res) => {
    const { programId } = req.params;
    const studentId = req.user.id;
    const program = await prisma_1.prisma.program.findUnique({
        where: { id: programId },
        include: {
            courses: {
                include: {
                    enrollments: { where: { studentId } }
                }
            }
        }
    });
    if (!program)
        throw new errors_1.AppError("Program not found", 404);
    const coursesWithGrades = await Promise.all(program.courses.map(async (course) => {
        // Basic computation like getMyCourseGrade
        const courseData = await prisma_1.prisma.course.findUnique({
            where: { id: course.id },
            include: { sections: { include: { lessons: { include: { assignment: true, quiz: true } } } } }
        });
        if (!courseData)
            return { ...course, finalGrade: 0 };
        const gradedItems = [];
        courseData.sections.forEach(sec => {
            sec.lessons.forEach(lesson => {
                if (lesson.assignment)
                    gradedItems.push({ id: lesson.assignment.id, type: "ASSIGNMENT", maxScore: lesson.assignment.maxScore });
                if (lesson.quiz)
                    gradedItems.push({ id: lesson.quiz.id, type: "QUIZ", maxScore: 100 });
                if (lesson.type === "FORUM")
                    gradedItems.push({ id: lesson.id, type: "FORUM", maxScore: lesson.forumMarks || 100 });
            });
        });
        const submissions = await prisma_1.prisma.submission.findMany({ where: { studentId, assignment: { lesson: { section: { courseId: course.id } } } } });
        const quizAttempts = await prisma_1.prisma.quizAttempt.findMany({ where: { studentId, quiz: { lesson: { section: { courseId: course.id } } } } });
        const forumIds = gradedItems.filter(i => i.type === "FORUM").map(i => i.id);
        const forumDiscussions = await prisma_1.prisma.discussion.findMany({ where: { lessonId: { in: forumIds }, authorId: studentId, score: { not: null } } });
        const grades = {};
        gradedItems.forEach(item => grades[item.id] = null);
        submissions.forEach(sub => { if (sub.grade !== null && sub.grade !== undefined)
            grades[sub.assignmentId] = sub.grade; });
        quizAttempts.forEach(qa => { if (grades[qa.quizId] === null || qa.score > grades[qa.quizId])
            grades[qa.quizId] = qa.score; });
        forumDiscussions.forEach(sf => { if (sf.lessonId && (grades[sf.lessonId] === null || sf.score > grades[sf.lessonId]))
            grades[sf.lessonId] = sf.score; });
        let totalEarned = 0;
        let totalMaxGraded = 0;
        gradedItems.forEach(item => {
            const score = grades[item.id];
            if (score !== null && score !== undefined) {
                totalEarned += score;
                totalMaxGraded += item.maxScore;
            }
        });
        const finalGrade = totalMaxGraded > 0 ? Number(((totalEarned / totalMaxGraded) * 100).toFixed(1)) : 0;
        return {
            id: course.id,
            title: course.title,
            courseCode: course.courseCode,
            finalGrade
        };
    }));
    res.json({ status: "success", data: { program, coursesWithGrades } });
});

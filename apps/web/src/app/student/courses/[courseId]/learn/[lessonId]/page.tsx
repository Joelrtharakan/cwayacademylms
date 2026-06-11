"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/store/auth.store";
import { CheckCircle, XCircle, HelpCircle, ClipboardCheck, ArrowLeft, ArrowRight, Download, Calendar } from "lucide-react";

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const enrollmentId = "mock-enr-id"; // Will be fetched

  const [lesson, setLesson] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // For quizzes
  const [quizState, setQuizState] = useState("not_started"); // not_started, in_progress, results
  const [quizData, setQuizData] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<any>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizResult, setQuizResult] = useState<any>(null);
  const lastSavedSecond = useRef<number>(0);

  const buildFlowItems = (sections: any[] = []) => {
    return sections.flatMap((section: any) => {
      const videoLessons = section.lessons.filter((l: any) => l.type === "VIDEO");
      const quizLessons = section.lessons.filter((l: any) => l.type === "QUIZ");
      const assignmentLessons = section.lessons.filter((l: any) => l.type === "ASSIGNMENT");
      const otherLessons = section.lessons.filter((l: any) => !["VIDEO", "QUIZ", "ASSIGNMENT"].includes(l.type));

      const readingMaterials = (section.readingMaterials || []).map((material: any) => ({
        ...material,
        itemType: "READING_MATERIAL",
        section
      }));

      return [
        ...videoLessons.map((item: any) => ({ ...item, itemType: item.type, section })),
        ...readingMaterials,
        ...quizLessons.map((item: any) => ({ ...item, itemType: item.type, section })),
        ...assignmentLessons.map((item: any) => ({ ...item, itemType: item.type, section })),
        ...otherLessons.map((item: any) => ({ ...item, itemType: item.type, section }))
      ];
    });
  };

  const allItems = enrollment?.course?.sections ? buildFlowItems(enrollment.course.sections) : [];
  const currentItemIndex = lesson ? allItems.findIndex((item: any) => item.id === lesson.id && item.itemType === lesson.type) : -1;
  const previousItem = currentItemIndex > 0 ? allItems[currentItemIndex - 1] : null;
  const nextItem = currentItemIndex >= 0 && currentItemIndex < allItems.length - 1 ? allItems[currentItemIndex + 1] : null;

  const goToItem = (item: any) => {
    if (!item) return;
    router.push(`/student/courses/${courseId}/learn/${item.id}`);
  };

  // For assignments
  const [assignmentSub, setAssignmentSub] = useState<any>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        // Get enrollment
        const enrRes = await api.get(`/student/courses/${courseId}/learn`);
        const enr = enrRes.data.data;
        setEnrollment(enr);
        
        // Find lesson in sections
        let foundLesson = null;
        let foundSection = null;
        for (const s of enr.course.sections) {
          const l = s.lessons.find((x: any) => x.id === lessonId);
          if (l) {
            foundLesson = l;
            foundSection = s;
            break;
          }
        }

        if (foundLesson) {
          // If it's a quiz, fetch quiz data
          if (foundLesson.type === "QUIZ" && foundLesson.quiz) {
             const attemptsRes = await api.get(`/student/quizzes/${foundLesson.quiz.id}/my-attempts`);
             setLesson({ ...foundLesson, section: foundSection, attempts: attemptsRes.data.data });
          } 
          // If assignment, fetch submission
          else if (foundLesson.type === "ASSIGNMENT" && foundLesson.assignment) {
             const subRes = await api.get(`/student/assignments/${foundLesson.assignment.id}/my-submission`);
             setAssignmentSub(subRes.data.data);
             setLesson({ ...foundLesson, section: foundSection });
          } else {
            setLesson({ ...foundLesson, section: foundSection });
          }
        } else {
          // If no lesson found, try reading material by ID
          let foundMaterial = null;
          for (const s of enr.course.sections) {
            const rm = s.readingMaterials.find((x: any) => x.id === lessonId);
            if (rm) {
              const prog = enr.readingMaterialProgress.find((rmp: any) => rmp.readingMaterialId === rm.id);
              foundMaterial = { ...rm, type: "READING_MATERIAL", section: s, isCompleted: !!prog?.completedAt };
              break;
            }
          }

          if (foundMaterial) {
            setLesson(foundMaterial);
          }
        }
      } catch (err) {
        console.error("Failed to load lesson", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [courseId, lessonId]);

  const markComplete = async () => {
    if (!enrollment || !lesson) return;
    try {
      if (lesson.type === "READING_MATERIAL") {
        await api.post(`/student/enrollments/${enrollment.id}/reading-materials/${lesson.id}/complete`);
      } else {
        await api.post(`/student/enrollments/${enrollment.id}/lessons/${lessonId}/complete`);
      }
      setLesson((prev: any) => ({ ...prev, isCompleted: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNext = async () => {
    if (!nextItem || !enrollment || !lesson) return;
    if (lesson.type === "READING_MATERIAL") {
      await api.post(`/student/enrollments/${enrollment.id}/reading-materials/${lesson.id}/complete`);
    }
    goToItem(nextItem);
  };

  const previousLesson = previousItem;
  const nextLesson = nextItem;

  const goToLesson = (targetLessonId: string) => {
    router.push(`/student/courses/${courseId}/learn/${targetLessonId}`);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://iframe.mediadelivery.net") return;
      try {
        const data = JSON.parse(event.data);
        // Auto complete Bunny video when it ends
        if (data.event === "ended" && lesson && !lesson.isCompleted) {
          markComplete();
        }
      } catch (e) {}
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [lesson, enrollment, lessonId]);

  if (loading || !lesson) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#C9973A] border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleVideoProgress = async (state: any) => {
    if (!lesson.isCompleted && state.playedSeconds > 0) {
      const watchedSeconds = Math.floor(state.playedSeconds);
      if (watchedSeconds % 10 === 0 && watchedSeconds !== lastSavedSecond.current) {
        lastSavedSecond.current = watchedSeconds;
        try {
          await api.post(`/student/enrollments/${enrollment.id}/lessons/${lessonId}/progress`, {
            watchedSeconds
          });
        } catch (err) {}
      }
    }
  };

  const handleVideoTimeUpdate = async (event: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!lesson.isCompleted) {
      const currentTime = Math.floor((event.target as HTMLVideoElement).currentTime);
      if (currentTime > 0 && currentTime - lastSavedSecond.current >= 10) {
        lastSavedSecond.current = currentTime;
        try {
          await api.post(`/student/enrollments/${enrollment.id}/lessons/${lessonId}/progress`, {
            watchedSeconds: currentTime
          });
        } catch (err) {}
      }
    }
  };

  const startQuiz = async () => {
    try {
      const res = await api.post(`/student/quizzes/${lesson.quiz.id}/attempt`);
      setQuizData(res.data.data);
      setQuizState("in_progress");
      setCurrentQuestionIdx(0);
      setQuizAnswers({});
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to start quiz");
    }
  };

  const submitQuiz = async () => {
    if (!quizData) return;
    try {
      const res = await api.post(`/student/quizzes/${lesson.quiz.id}/submit`, {
        attemptId: quizData.attemptId,
        answers: quizAnswers
      });
      setQuizResult(res.data.data);
      setQuizState("results");
    } catch (err: any) {
      alert("Failed to submit");
    }
  };

  const nextButtonClasses = "px-7 py-3 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 min-w-[170px] justify-center bg-[#4A8C5C] text-white hover:bg-[#3B7A54] border border-transparent";

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* VIDEO LESSON */}
        {lesson.type === "VIDEO" && (
          <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center [&_iframe]:!w-full [&_iframe]:!h-full [&_video]:!w-full [&_video]:!h-full [&_video]:!object-contain">
            <div className="w-full h-full relative max-w-7xl mx-auto flex items-center justify-center">
              {lesson.videoUrl ? (
                lesson.videoUrl.includes('youtu') ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${
                      lesson.videoUrl.includes('youtu.be/')
                        ? lesson.videoUrl.split('youtu.be/')[1].split('?')[0]
                        : lesson.videoUrl.split('v=')[1]?.split('&')[0]
                    }?rel=0&modestbranding=1`}
                    title={lesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={lesson.videoUrl.trim()}
                    controls
                    playsInline
                    poster={lesson.thumbnail || undefined}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleVideoTimeUpdate}
                    onEnded={markComplete}
                  />
                )
              ) : lesson.bunnyVideoId ? (
                <iframe
                  src={`https://iframe.mediadelivery.net/embed/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${lesson.bunnyVideoId}?autoplay=false&responsive=true`}
                  loading="lazy"
                  className="w-full h-full border-0"
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                  allowFullScreen={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#8A9E8C]">
                  No video source provided
                </div>
              )}
            </div>
            {!lesson.isCompleted && (
              <div className="max-w-7xl mx-auto mt-4 px-4 md:px-0 flex flex-col items-center gap-2 text-center">
                <button
                  onClick={markComplete}
                  className="px-6 py-3 bg-[#C9973A] text-[#1A261D] rounded-full font-semibold shadow-sm hover:bg-[#A8792A] transition-colors"
                >
                  Mark Lesson Complete
                </button>
                <p className="text-xs text-[#F3F4F6]/90 max-w-xl">
                  If the video does not auto-complete, press this button after you have watched the full lesson.
                </p>
              </div>
            )}
          </div>
        )}

        {/* READING MATERIAL */}
        {lesson.type === "READING_MATERIAL" && (
          <div className="w-full min-h-full bg-[#F7F8F5] text-[#1A261D] px-6 py-16 md:px-12 md:py-20">
            <div className="mx-auto w-full max-w-[1280px] space-y-10 px-6 md:px-10 lg:px-12">
              <div className="pt-4 text-center">
                <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#111827] mb-6">
                  {lesson.title}
                </h1>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-[1200px] mx-auto rounded-[32px] overflow-hidden border border-[#E5E7EB] bg-[#000000] shadow-[0_24px_72px_-24px_rgba(15,23,42,0.18)]">
                  {lesson.fileUrl?.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={lesson.fileUrl}
                      title={lesson.title}
                      className="w-full min-h-[82vh] md:min-h-[calc(100vh-180px)]"
                    />
                  ) : (
                    <div className="flex min-h-[520px] flex-col items-center justify-center gap-6 bg-[#F8FAFC] p-12 text-center">
                      <p className="text-lg font-semibold text-[#111827]">Preview unavailable</p>
                      <p className="max-w-xl text-sm text-[#6B7280]">This reading material cannot be previewed inside the app. Open it in a new tab instead.</p>
                      <a
                        href={lesson.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[#D4A35B] px-6 py-3 text-sm font-semibold text-[#1A261D]"
                      >
                        Open / Download
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TEXT LESSON */}
        {lesson.type === "TEXT" && (
          <div className="w-full min-h-full bg-[#FAFAF7] text-[#1A261D]">
            <div className="max-w-3xl mx-auto py-12 px-6 md:py-16 md:px-12">
              <div className="text-sm text-[#8A9E8C] mb-3 uppercase tracking-wider font-semibold">
                {lesson.section?.title}
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-[#1A261D]">
                {lesson.title}
              </h1>
              <div className="w-20 h-1 bg-[#C9973A] mb-10"></div>
              
              <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[#1A261D] prose-p:text-[#1A261D]/80 prose-p:leading-relaxed prose-a:text-[#C9973A] prose-blockquote:border-l-[#C9973A] prose-blockquote:bg-[rgba(201,151,58,0.06)] prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-lg" 
                   dangerouslySetInnerHTML={{ __html: lesson.content || "" }} />

              <div className="mt-16 pt-8 border-t border-[#E4E8E0]">
                {lesson.isCompleted ? (
                  <button className="w-full md:w-auto px-8 py-4 bg-[#4A8C5C]/10 border border-[#4A8C5C] text-[#4A8C5C] rounded-lg font-bold flex justify-center items-center gap-2 cursor-default">
                    <CheckCircle className="w-5 h-5" /> Read
                  </button>
                ) : (
                  <button 
                    onClick={markComplete}
                    className="w-full md:w-auto px-8 py-4 bg-[#C9973A] text-[#1A261D] rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-[#A8792A] transition-colors"
                  >
                    Mark as Complete <CheckCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}


        {/* QUIZ LESSON */}
        {lesson.type === "QUIZ" && (
          <div className="w-full min-h-full bg-[#F7F7F2] text-[#1A261D] px-6 py-12 md:px-12 md:py-16">
            <div className="mx-auto max-w-6xl space-y-10">
              <section className="relative overflow-hidden rounded-[32px] border border-[#E4E8E0] bg-white/95 p-8 md:p-12 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.2)]">
                <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-[#C9973A]/10 blur-3xl"></div>
                <div className="pointer-events-none absolute left-0 bottom-0 h-32 w-32 rounded-full bg-[#4A8C5C]/10 blur-3xl"></div>
                <div className="relative">
                  <span className="inline-flex items-center rounded-full bg-[#F8FAF7] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#4A8C5C]">
                    Quiz Overview
                  </span>
                  <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#111827] mt-6 max-w-3xl">
                    {lesson.title}
                  </h1>
                  {lesson.description && (
                    <p className="max-w-3xl text-base leading-8 text-[#4B5563] mt-5">
                      {lesson.description}
                    </p>
                  )}

                  <div className="mt-10 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl bg-[#F7F8F5] border border-[#E4E8E0] p-5">
                      <p className="text-sm uppercase tracking-[0.18em] text-[#8A9E8C] mb-2">Passing score</p>
                      <p className="text-3xl font-semibold text-[#1A261D]">{lesson.quiz?.passingScore ?? 0}%</p>
                    </div>
                    <div className="rounded-3xl bg-[#F7F8F5] border border-[#E4E8E0] p-5">
                      <p className="text-sm uppercase tracking-[0.18em] text-[#8A9E8C] mb-2">Time limit</p>
                      <p className="text-3xl font-semibold text-[#1A261D]">
                        {lesson.quiz?.timeLimit ? `${lesson.quiz.timeLimit / 60} min` : "Unlimited"}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-[#F7F8F5] border border-[#E4E8E0] p-5">
                      <p className="text-sm uppercase tracking-[0.18em] text-[#8A9E8C] mb-2">Attempts</p>
                      <p className="text-3xl font-semibold text-[#1A261D]">
                        {lesson.quiz?.maxAttempts > 0 ? lesson.quiz.maxAttempts : "Unlimited"}
                      </p>
                    </div>
                  </div>

                  {lesson.attempts && lesson.attempts.length > 0 && (
                    <div className="mt-10 rounded-3xl bg-[#F8FAF7] border border-[#E4E8E0] p-6">
                      <h2 className="text-sm uppercase tracking-[0.22em] text-[#8A9E8C] mb-4 font-semibold">Recent attempts</h2>
                      <div className="grid gap-3 md:grid-cols-2">
                        {lesson.attempts.map((att: any, i: number) => (
                          <div key={att.id} className="rounded-3xl bg-white border border-[#E4E8E0] p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-[#8A9E8C]">Attempt {lesson.attempts.length - i}</span>
                              <span className={`text-xs uppercase font-semibold ${att.passed ? 'text-[#4A8C5C]' : 'text-[#8C3A3A]'}`}>
                                {att.passed ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                            <p className="text-2xl font-semibold text-[#1A261D]">{att.score.toFixed(1)}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start">
                    <button
                      onClick={startQuiz}
                      className="inline-flex items-center justify-center rounded-full bg-[#C9973A] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#1A261D] shadow-lg shadow-[#C9973A]/20 transition-colors hover:bg-[#A8792A]"
                    >
                      Start Quiz
                    </button>
                    <span className="text-sm text-[#6B7280] max-w-xl text-center sm:text-left">
                      Ready when you are. Your progress will be saved automatically as you go.
                    </span>
                  </div>
                </div>
              </section>

              {quizState === "in_progress" && quizData && quizData.quiz && quizData.quiz.questions && (
                <div className="rounded-[32px] border border-[#E4E8E0] bg-white p-6 md:p-10 shadow-xl">
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.22em] text-[#8A9E8C] mb-2">Question Progress</p>
                      <p className="text-lg font-semibold text-[#1A261D]">
                        {currentQuestionIdx + 1} of {quizData.quiz.questions.length}
                      </p>
                    </div>
                    <div className="w-full md:w-1/2 h-3 rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div className="h-full rounded-full bg-[#C9973A] transition-all" style={{ width: `${((currentQuestionIdx + 1) / quizData.quiz.questions.length) * 100}%` }} />
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[#E4E8E0] bg-[#F7F8F5] p-6 md:p-8">
                    {(() => {
                      const q = quizData.quiz.questions[currentQuestionIdx];
                      if (!q) return null;
                      return (
                        <div>
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
                            <div>
                              <p className="text-sm uppercase tracking-[0.22em] text-[#8A9E8C] mb-2">Question {currentQuestionIdx + 1}</p>
                              <h2 className="text-2xl md:text-3xl font-semibold text-[#1A261D]">{q.text}</h2>
                            </div>
                            <div className="rounded-3xl bg-white border border-[#E4E8E0] px-4 py-2 text-sm font-semibold text-[#1A261D]">
                              {q.points} pt{q.points > 1 ? 's' : ''}
                            </div>
                          </div>
                          {q.scriptureRef && (
                            <div className="mb-4 rounded-3xl bg-white border border-[#E4E8E0] px-4 py-3 text-sm text-[#4A8C5C]">
                              {q.scriptureRef}
                            </div>
                          )}

                          {(q.type === "MCQ" || q.type === "TRUE_FALSE") && (
                            <div className="space-y-4">
                              {q.answers.map((ans: any) => {
                                const isSelected = quizAnswers[q.id] === ans.id;
                                return (
                                  <button
                                    key={ans.id}
                                    onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: ans.id })}
                                    className={`w-full rounded-3xl border p-5 text-left transition-all ${isSelected ? 'border-[#C9973A] bg-[#FFF7E5]' : 'border-[#E4E8E0] bg-white hover:border-[#D4A35B]'}`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className={`h-5 w-5 rounded-full border-2 ${isSelected ? 'border-[#C9973A] bg-[#C9973A]' : 'border-[#D1D5DB]'}`}>
                                        {isSelected && <div className="m-1 h-2 w-2 rounded-full bg-white" />}
                                      </div>
                                      <span className={`text-base ${isSelected ? 'text-[#C9973A] font-semibold' : 'text-[#1A261D]'}`}>{ans.text}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "SHORT_ANSWER" && (
                            <div>
                              <textarea
                                value={quizAnswers[q.id] || ""}
                                onChange={e => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                                rows={6}
                                className="w-full rounded-[24px] border border-[#E4E8E0] bg-white px-5 py-4 text-[#1A261D] placeholder-[#9CA3AF] focus:border-[#C9973A] focus:outline-none"
                                placeholder="Type your answer here..."
                              />
                              <p className="mt-3 text-sm text-[#6B7280]">Your response will be reviewed by your instructor.</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <button
                      onClick={() => setCurrentQuestionIdx(i => Math.max(0, i - 1))}
                      disabled={currentQuestionIdx === 0}
                      className="rounded-full border border-[#E4E8E0] bg-white px-6 py-3 text-sm font-semibold text-[#1A261D] transition hover:border-[#C9973A] disabled:opacity-40"
                    >
                      <ArrowLeft className="inline-block w-4 h-4 mr-2" /> Previous
                    </button>
                    {currentQuestionIdx === quizData.quiz.questions.length - 1 ? (
                      <button
                        onClick={submitQuiz}
                        className="rounded-full bg-[#C9973A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#1A261D] transition hover:bg-[#A8792A]"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestionIdx(i => Math.min(quizData.quiz.questions.length - 1, i + 1))}
                        className="rounded-full bg-[#C9973A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#1A261D] transition hover:bg-[#A8792A] flex items-center justify-center gap-2"
                      >
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {quizState === "results" && quizResult && (
                <div className="space-y-8">
                  <div className="rounded-[32px] border border-[#E4E8E0] bg-white p-10 shadow-xl">
                    <div className="text-center">
                      {quizResult.passed ? (
                        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-[#4A8C5C]" />
                      ) : (
                        <XCircle className="mx-auto mb-4 h-16 w-16 text-[#8C3A3A]" />
                      )}
                      <h1 className={`font-serif text-4xl font-bold ${quizResult.passed ? 'text-[#4A8C5C]' : 'text-[#8C3A3A]'}`}>
                        {quizResult.passed ? 'You passed the quiz!' : 'Quiz complete'}
                      </h1>
                      <p className="mt-4 text-[#6B7280]">
                        {quizResult.passed ? 'Great work — your score is above the passing threshold.' : 'Review your score and try again to improve.'}
                      </p>
                    </div>

                    <div className="mt-10 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl bg-[#F7F8F5] border border-[#E4E8E0] p-6">
                        <p className="text-sm uppercase tracking-[0.18em] text-[#8A9E8C] mb-2">Final Score</p>
                        <p className="text-4xl font-bold text-[#111827]">{quizResult.score.toFixed(0)}%</p>
                      </div>
                      <div className="rounded-3xl bg-[#F7F8F5] border border-[#E4E8E0] p-6">
                        <p className="text-sm uppercase tracking-[0.18em] text-[#8A9E8C] mb-2">Points</p>
                        <p className="text-4xl font-bold text-[#111827]">{quizResult.earnedPoints}/{quizResult.totalPoints}</p>
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                      {quizResult.passed ? (
                        <button className="rounded-full bg-[#4A8C5C] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#3B7A54]">
                          Continue to Next Lesson &rarr;
                        </button>
                      ) : quizResult.canRetake ? (
                        <button onClick={startQuiz} className="rounded-full border border-[#C9973A] px-8 py-3 text-sm font-semibold text-[#C9973A] transition hover:bg-[#C9973A] hover:text-[#1A261D]">
                          Retake Quiz ({quizResult.attemptsLeft} left)
                        </button>
                      ) : (
                        <span className="text-[#8A9E8C]">No attempts left. Contact your instructor.</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-serif text-2xl text-[#1A261D]">Review Answers</h3>
                    {quizResult.results.map((r: any, i: number) => (
                      <div key={i} className="rounded-[28px] border border-[#E4E8E0] bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start mb-4">
                          <span className="text-sm font-semibold text-[#8A9E8C]">Question {i + 1}</span>
                          <span className="rounded-full bg-[#F7F8F5] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#4A8C5C]">
                            {r.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-[#1A261D] text-lg mb-4">{r.questionText}</p>
                        <div className="space-y-3 text-sm">
                          <div className="rounded-3xl bg-[#F7F8F5] border border-[#E4E8E0] p-4">
                            <p className="text-[#8A9E8C] mb-2">Your Answer</p>
                            <div className="flex items-center gap-2 text-[#1A261D]">
                              {r.isCorrect ? <CheckCircle className="w-4 h-4 text-[#4A8C5C]" /> : <XCircle className="w-4 h-4 text-[#8C3A3A]" />}
                              <span className={r.isCorrect ? 'font-semibold text-[#4A8C5C]' : 'line-through text-[#8C3A3A]'}>{r.yourAnswer || 'No answer'}</span>
                            </div>
                          </div>
                          {!r.isCorrect && r.correctAnswer && (
                            <div className="rounded-3xl bg-[#EBF7ED] border border-[#D1E7D1] p-4">
                              <p className="text-[#4A8C5C] mb-2">Correct Answer</p>
                              <p className="font-semibold text-[#1A261D]">{r.correctAnswer}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ASSIGNMENT LESSON */}
        {lesson.type === "ASSIGNMENT" && (
          <div className="w-full min-h-full bg-[#FAFAF7] text-[#1A261D] px-6 py-12 md:py-16">
            <div className="max-w-3xl mx-auto space-y-8">
              
              <div className="bg-white border border-[#E4E8E0] rounded-2xl p-8 md:p-10 shadow-sm">
                <div className="w-12 h-12 bg-[#4A8C5C]/10 rounded-full flex items-center justify-center mb-6">
                  <ClipboardCheck className="w-6 h-6 text-[#4A8C5C]" />
                </div>
                <h1 className="font-serif text-3xl md:text-4xl text-[#1A261D] font-bold mb-4">{lesson.assignment?.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-[#8A9E8C] mb-8 pb-8 border-b border-[#E4E8E0]">
                  {lesson.assignment?.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> 
                      Due: {new Date(lesson.assignment.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <span className="bg-[#FAFAF7]/5 px-2 py-0.5 rounded font-medium text-[#1A261D]">
                    Max Score: {lesson.assignment?.maxScore} pts
                  </span>
                </div>

                <div className="prose prose-sm max-w-none text-[#1A261D]/80" dangerouslySetInnerHTML={{ __html: lesson.assignment?.description || "" }} />

                {lesson.assignment?.attachmentUrl && (
                  <a href={lesson.assignment.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-6 px-4 py-2 border border-[#C9973A] text-[#C9973A] rounded-lg hover:bg-[#C9973A]/10 transition-colors text-sm font-semibold">
                    <Download className="w-4 h-4" /> Download Attached Resource
                  </a>
                )}
              </div>

              {!assignmentSub && (
                <div className="bg-white border border-[#E4E8E0] rounded-2xl p-8 md:p-10 shadow-sm">
                  <h2 className="font-serif text-2xl font-bold mb-6">Your Submission</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#1A261D] mb-2">Response</label>
                      <textarea 
                        rows={6}
                        className="w-full bg-[#FAFAF7]/50 border border-[#E4E8E0] rounded-xl p-4 focus:outline-none focus:border-[#C9973A] focus:ring-1 focus:ring-[#C9973A] transition-all placeholder:text-[#8A9E8C]"
                        placeholder="Write your response here..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A261D] mb-2">Upload File (Optional)</label>
                      <div className="border-2 border-dashed border-[#E4E8E0] rounded-xl p-8 text-center hover:border-[#C9973A] transition-colors cursor-pointer bg-[#FAFAF7]/30">
                        <div className="text-[#A8792A] mb-2">↑</div>
                        <div className="text-sm font-semibold text-[#1A261D]">Click to upload or drag and drop</div>
                        <div className="text-xs text-[#8A9E8C] mt-1">PDF, DOC, ZIP up to 50MB</div>
                      </div>
                    </div>
                    <button className="w-full md:w-auto px-8 py-4 bg-[#C9973A] text-[#1A261D] rounded-lg font-bold shadow-lg shadow-[#C9973A]/20 hover:bg-[#A8792A] transition-colors">
                      Submit Assignment
                    </button>
                  </div>
                </div>
              )}

              {assignmentSub && !assignmentSub.isGraded && (
                <div className="bg-white border-l-4 border-l-[#4A8C5C] rounded-2xl p-8 shadow-sm flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-[#4A8C5C] shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1A261D] mb-2">Assignment Submitted!</h3>
                    <p className="text-[#8A9E8C] text-sm leading-relaxed">
                      Your work has been successfully submitted and is awaiting instructor review. You will receive a notification once it has been graded.
                    </p>
                  </div>
                </div>
              )}

              {assignmentSub && assignmentSub.isGraded && (
                <div className="bg-white border border-[#E4E8E0] rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-[#FAFAF7] p-6 text-center text-[#1A261D] relative">
                    <div className="absolute top-4 right-4 bg-[#4A8C5C] text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Graded ✓</div>
                    <h3 className="text-sm uppercase tracking-wider text-[#8A9E8C] mb-2 font-semibold">Your Score</h3>
                    <div className="font-serif text-6xl text-[#C9973A] font-bold">
                      {assignmentSub.grade} <span className="text-2xl text-[#8A9E8C]">/ {lesson.assignment?.maxScore}</span>
                    </div>
                  </div>
                  {assignmentSub.feedback && (
                    <div className="p-8">
                      <div className="bg-[#C9973A]/5 border-l-4 border-[#C9973A] p-6 rounded-r-lg">
                        <h4 className="font-serif text-lg font-bold text-[#1A261D] mb-2">Instructor Feedback</h4>
                        <div className="text-sm text-[#1A261D]/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: assignmentSub.feedback }} />
                      </div>
                    </div>
                  )}
                  <div className="p-6 bg-[#FAFAF7]/50 border-t border-[#E4E8E0] text-center">
                    <button className="px-6 py-3 bg-[#4A8C5C] text-white rounded-lg font-bold">
                      Continue to Next Lesson &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PREV/NEXT NAV BOTTOM BAR */}
      <div className="h-16 shrink-0 bg-[#FFFFFF] border-t border-[#E4E8E0] flex items-center justify-between px-12 md:px-20 z-30">
        <button
          disabled={!previousLesson}
          onClick={() => previousLesson && goToLesson(previousLesson.id)}
          className="bg-[#F7E3B7] text-[#4A3F1F] border border-[#E0C17A] hover:bg-[#F2D685] flex items-center gap-2 text-sm font-semibold transition-colors px-7 py-3 rounded-full shadow-sm shadow-[#D8B657]/20 mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Previous Lesson</span>
        </button>
        <div className="text-xs text-[#8A9E8C] font-medium tracking-wide">
          Module · Lesson
        </div>
        <button 
          disabled={!nextLesson}
          onClick={handleNext}
          title={nextLesson ? "Continue to next lesson" : "No next lesson available"}
          className={`${nextButtonClasses} ml-4 ${!nextLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next Lesson <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

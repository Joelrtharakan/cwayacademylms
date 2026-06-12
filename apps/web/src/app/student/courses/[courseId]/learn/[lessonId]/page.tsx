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
  const [cheatStrikes, setCheatStrikes] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);

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
      await markComplete();
    } else if (lesson.type === "QUIZ" && quizResult?.passed && !lesson.isCompleted) {
      // Fallback in case submitQuiz failed to mark complete
      await markComplete();
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

  const startQuiz = async () => {
    if (!lesson) return;
    try {
      const res = await api.post(`/student/quizzes/${lesson.quiz.id}/attempt`);
      setQuizData(res.data.data);
      setQuizState("in_progress");
      setCurrentQuestionIdx(0);
      setQuizAnswers({});
      setCheatStrikes(0);
      setShowCheatWarning(false);
      
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.warn("Fullscreen request failed", e);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to start quiz");
    }
  };

  const submitQuiz = async () => {
    if (!quizData || !lesson) return;
    try {
      const res = await api.post(`/student/quizzes/${lesson.quiz.id}/submit`, {
        attemptId: quizData.attemptId,
        answers: quizAnswers
      });
      setQuizResult(res.data.data);
      setQuizState("results");
      
      if (res.data.data.passed || !res.data.data.canRetake) {
        try {
          await api.post(`/student/enrollments/${enrollment.id}/lessons/${lessonId}/complete`);
          setLesson((prev: any) => ({ ...prev, isCompleted: true }));
        } catch (err) { console.error(err); }
      }

      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch (e) {
        console.warn("Fullscreen exit failed", e);
      }
    } catch (err: any) {
      alert("Failed to submit");
    }
  };

  // Anti-cheat detection
  useEffect(() => {
    const handleViolation = () => {
      if (quizState === "in_progress") {
        setCheatStrikes(prev => {
          const newStrikes = prev + 1;
          if (newStrikes > 3) {
            submitQuiz();
            alert("Quiz automatically submitted due to maximum infractions. Cheating is not permitted.");
          } else {
            setShowCheatWarning(true);
          }
          return newStrikes;
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) handleViolation();
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [quizState, quizData, quizAnswers, lesson]);

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



  const nextButtonClasses = "px-7 py-3 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 min-w-[170px] justify-center bg-[#4A8C5C] text-white hover:bg-[#3B7A54] border border-transparent";

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-70px)] relative">
      <div className="flex-1 w-full relative">
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
          <div className="w-full min-h-full bg-[#FAFAF7] text-[#1A261D]" style={{ padding: '3rem 1.5rem' }}>
            <div className="mx-auto w-full" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {quizState === "not_started" && (
                <section className="relative overflow-hidden rounded-[24px] border border-[#E4E8E0] bg-white shadow-sm" style={{ padding: '1.5rem 2rem' }}>
                  <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#C9973A]/10 blur-3xl"></div>
                  <div className="pointer-events-none absolute left-0 bottom-0 h-40 w-40 rounded-full bg-[#4A8C5C]/10 blur-3xl"></div>
                  <div className="relative z-10" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <span className="inline-flex items-center rounded-md bg-[#4A8C5C]/10 text-[10px] font-bold uppercase tracking-widest text-[#4A8C5C]" style={{ padding: '4px 8px' }}>
                        Quiz Overview
                      </span>
                    </div>
                    
                    <h1 className="font-serif font-bold tracking-tight text-[#1A261D]" style={{ fontSize: 'clamp(24px, 4vw, 36px)', lineHeight: '1.2', margin: '0' }}>
                      {lesson.title}
                    </h1>
                    
                    {lesson.description && (
                      <p className="text-sm text-gray-600 max-w-2xl leading-relaxed" style={{ margin: '0' }}>
                        {lesson.description}
                      </p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '0.25rem' }}>
                      <div className="rounded-[16px] bg-[#FAFAF7] border border-[#E4E8E0] flex flex-col justify-center" style={{ padding: '16px 20px' }}>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500" style={{ marginBottom: '4px' }}>Passing score</p>
                        <p className="font-bold text-[#1A261D] leading-none" style={{ fontSize: '24px', margin: '0' }}>{lesson.quiz?.passingScore ?? 0}%</p>
                      </div>
                      <div className="rounded-[16px] bg-[#FAFAF7] border border-[#E4E8E0] flex flex-col justify-center" style={{ padding: '16px 20px' }}>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500" style={{ marginBottom: '4px' }}>Time limit</p>
                        <p className="font-bold text-[#1A261D] leading-none" style={{ fontSize: '24px', margin: '0' }}>
                          {lesson.quiz?.timeLimit ? `${lesson.quiz.timeLimit / 60} min` : "Unlimited"}
                        </p>
                      </div>
                      <div className="rounded-[16px] bg-[#FAFAF7] border border-[#E4E8E0] flex flex-col justify-center" style={{ padding: '16px 20px' }}>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500" style={{ marginBottom: '4px' }}>Attempts</p>
                        <p className="font-bold text-[#1A261D] leading-none" style={{ fontSize: '24px', margin: '0' }}>
                          {lesson.quiz?.maxAttempts > 0 ? lesson.quiz.maxAttempts : "Unlimited"}
                        </p>
                      </div>
                    </div>

                    {lesson.attempts && lesson.attempts.length > 0 && (
                      <div className="rounded-[20px] bg-[#FAFAF7] border border-[#E4E8E0]" style={{ padding: '20px', marginTop: '0.5rem' }}>
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Recent attempts</h2>
                          {lesson.attempts.some((a: any) => a.passed) && (
                            <span className="text-xs font-bold text-[#4A8C5C] bg-[#4A8C5C]/10 px-3 py-1 rounded-full">
                              Highest Score: {Math.max(...lesson.attempts.map((a: any) => a.score)).toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                          {lesson.attempts.map((att: any, i: number) => (
                            <div key={att.id} className="rounded-[12px] bg-white border border-[#E4E8E0]" style={{ padding: '12px' }}>
                              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                                <span className="text-xs font-medium text-gray-500">Attempt {lesson.attempts.length - i}</span>
                                <span className={`text-[10px] uppercase font-bold rounded-md ${att.passed ? 'bg-[#4A8C5C]/10 text-[#4A8C5C]' : 'bg-red-50 text-red-600'}`} style={{ padding: '4px 8px' }}>
                                  {att.passed ? 'Passed' : 'Failed'}
                                </span>
                              </div>
                              <p className="font-bold text-[#1A261D] leading-none" style={{ fontSize: '20px', margin: '0' }}>{att.score.toFixed(1)}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center border-t border-[#E4E8E0]" style={{ paddingTop: '20px', marginTop: '12px', gap: '16px' }}>
                      {(!lesson.quiz?.maxAttempts || !lesson.attempts || lesson.attempts.length < lesson.quiz.maxAttempts) ? (
                        <button
                          onClick={startQuiz}
                          className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#C9973A] text-sm font-bold text-white shadow-sm transition-all hover:bg-[#B8872A]"
                          style={{ padding: '12px 28px' }}
                        >
                          {lesson.attempts && lesson.attempts.length > 0 ? "Retake Quiz" : "Start Quiz"}
                        </button>
                      ) : (
                        <div className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-400 cursor-not-allowed" style={{ padding: '12px 28px' }}>
                          Maximum Attempts Reached
                        </div>
                      )}
                      
                      {lesson.isCompleted ? (
                        <div className="flex items-center gap-2 text-sm font-bold text-[#4A8C5C]">
                          <CheckCircle className="w-5 h-5" /> Quiz Completed
                        </div>
                      ) : (
                        (lesson.attempts?.some((a: any) => a.passed) || (lesson.quiz?.maxAttempts > 0 && lesson.attempts?.length >= lesson.quiz.maxAttempts)) && (
                          <button
                            onClick={async () => {
                              await markComplete();
                              router.refresh();
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#4A8C5C] text-sm font-bold text-white shadow-sm transition-all hover:bg-[#3B7A4A]"
                            style={{ padding: '12px 28px' }}
                          >
                            Mark as Completed
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </section>
              )}

              {quizState === "in_progress" && quizData && quizData.quiz && quizData.quiz.questions && (
                <div 
                  className="rounded-[24px] border border-[#E4E8E0] bg-white shadow-xl" 
                  style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', userSelect: 'none' }}
                  onCopy={e => e.preventDefault()}
                  onPaste={e => e.preventDefault()}
                  onContextMenu={e => e.preventDefault()}
                >
                  {showCheatWarning && (
                    <div 
                      className="rounded-[16px] bg-[#FEF2F2] border border-[#FCA5A5]" 
                      style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <XCircle className="text-[#DC2626]" style={{ width: '24px', height: '24px', flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <p className="font-bold text-[#991B1B]" style={{ fontSize: '14px', margin: 0 }}>Warning: Leaving fullscreen or switching tabs is not allowed ({cheatStrikes}/3 infractions).</p>
                          <p className="text-[#B91C1C]" style={{ fontSize: '12px', margin: 0 }}>If you violate this {4 - cheatStrikes} more time(s), your quiz will be automatically submitted.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setShowCheatWarning(false);
                          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen().catch(e => console.warn(e));
                          }
                        }} 
                        className="bg-white rounded-full font-bold text-[#DC2626] border border-[#FCA5A5] hover:bg-[#FEF2F2]"
                        style={{ padding: '8px 16px', fontSize: '12px', flexShrink: 0 }}
                      >
                        Resume Quiz
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between" style={{ gap: '0.75rem' }}>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8A9E8C]" style={{ marginBottom: '0.25rem' }}>Question Progress</p>
                      <p className="font-semibold text-[#1A261D]" style={{ fontSize: '1rem', margin: 0 }}>
                        {currentQuestionIdx + 1} of {quizData.quiz.questions.length}
                      </p>
                    </div>
                    <div className="w-full md:w-1/2 h-2 rounded-full bg-[#F3F4F6] overflow-hidden" style={{ position: 'relative' }}>
                      <div className="h-full rounded-full bg-[#C9973A] transition-all" style={{ width: `${((currentQuestionIdx + 1) / quizData.quiz.questions.length) * 100}%` }} />
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-[#E4E8E0] bg-[#FAFAF7]" style={{ padding: '1.25rem 1.5rem' }}>
                    {(() => {
                      const q = quizData.quiz.questions[currentQuestionIdx];
                      if (!q) return null;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between" style={{ gap: '1rem' }}>
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-[#8A9E8C]" style={{ marginBottom: '0.5rem' }}>Question {currentQuestionIdx + 1}</p>
                              <h2 className="font-semibold text-[#1A261D]" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', margin: 0, fontFamily: 'var(--font-serif)' }}>{q.text}</h2>
                            </div>
                            <div className="rounded-full bg-white border border-[#E4E8E0] font-semibold text-[#1A261D] shrink-0" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              {q.points} pt{q.points > 1 ? 's' : ''}
                            </div>
                          </div>
                          {q.scriptureRef && (
                            <div className="rounded-[12px] bg-white border border-[#E4E8E0] text-[#4A8C5C]" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
                              {q.scriptureRef}
                            </div>
                          )}

                          {(q.type === "MCQ" || q.type === "TRUE_FALSE") && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {q.answers.map((ans: any) => {
                                const isSelected = quizAnswers[q.id] === ans.id;
                                return (
                                  <button
                                    key={ans.id}
                                    onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: ans.id })}
                                    className={`w-full rounded-[16px] border text-left transition-all ${isSelected ? 'border-[#C9973A] bg-[#FFF7E5]' : 'border-[#E4E8E0] bg-white hover:border-[#D4A35B]'}`}
                                    style={{ padding: '0.875rem 1.25rem' }}
                                  >
                                    <div className="flex items-center" style={{ gap: '0.75rem' }}>
                                      <div className={`rounded-full border-2 ${isSelected ? 'border-[#C9973A] bg-[#C9973A]' : 'border-[#D1D5DB]'}`} style={{ width: '18px', height: '18px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {isSelected && <div className="rounded-full bg-white" style={{ width: '6px', height: '6px' }} />}
                                      </div>
                                      <span className={isSelected ? 'text-[#C9973A] font-medium' : 'text-[#1A261D]'} style={{ fontSize: '0.95rem' }}>{ans.text}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "SHORT_ANSWER" && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <textarea
                                value={quizAnswers[q.id] || ""}
                                onChange={e => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                                rows={5}
                                className="w-full rounded-[16px] border border-[#E4E8E0] bg-white text-[#1A261D] placeholder-[#9CA3AF] focus:border-[#C9973A] focus:outline-none"
                                style={{ padding: '1rem' }}
                                placeholder="Type your answer here..."
                              />
                              <p className="text-xs text-[#6B7280]" style={{ margin: 0 }}>Your response will be reviewed by your instructor.</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center" style={{ gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                      onClick={() => setCurrentQuestionIdx(i => Math.max(0, i - 1))}
                      disabled={currentQuestionIdx === 0}
                      className="rounded-full border border-[#E4E8E0] bg-white text-sm font-semibold text-[#1A261D] transition hover:border-[#C9973A] disabled:opacity-40"
                      style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center' }}
                    >
                      <ArrowLeft className="w-4 h-4" style={{ marginRight: '0.5rem' }} /> Previous
                    </button>
                    {currentQuestionIdx === quizData.quiz.questions.length - 1 ? (
                      <button
                        onClick={submitQuiz}
                        className="rounded-full bg-[#C9973A] text-sm font-semibold uppercase tracking-[0.12em] text-[#1A261D] transition hover:bg-[#A8792A]"
                        style={{ padding: '0.75rem 1.5rem' }}
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestionIdx(i => Math.min(quizData.quiz.questions.length - 1, i + 1))}
                        className="rounded-full bg-[#C9973A] text-sm font-semibold uppercase tracking-[0.12em] text-[#1A261D] transition hover:bg-[#A8792A]"
                        style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {quizState === "results" && quizResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="rounded-[24px] border border-[#E4E8E0] bg-white shadow-xl" style={{ padding: '2rem 1.5rem' }}>
                    <div className="text-center">
                      {quizResult.passed ? (
                        <CheckCircle className="mx-auto text-[#4A8C5C]" style={{ marginBottom: '1rem', width: '3rem', height: '3rem' }} />
                      ) : (
                        <XCircle className="mx-auto text-[#8C3A3A]" style={{ marginBottom: '1rem', width: '3rem', height: '3rem' }} />
                      )}
                      <h1 className={`font-serif font-bold ${quizResult.passed ? 'text-[#4A8C5C]' : 'text-[#8C3A3A]'}`} style={{ fontSize: 'clamp(24px, 3.5vw, 32px)' }}>
                        {quizResult.passed ? 'You passed the quiz!' : 'Quiz complete'}
                      </h1>
                      <p className="text-[#6B7280]" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                        {quizResult.passed ? 'Great work — your score is above the passing threshold.' : 'Review your score and try again to improve.'}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: '2rem' }}>
                      <div className="rounded-[16px] bg-[#FAFAF7] border border-[#E4E8E0]" style={{ padding: '16px' }}>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A9E8C]" style={{ marginBottom: '0.5rem' }}>Final Score</p>
                        <p className="font-bold text-[#111827]" style={{ fontSize: '1.75rem', margin: 0 }}>{quizResult.score.toFixed(0)}%</p>
                      </div>
                      <div className="rounded-[16px] bg-[#FAFAF7] border border-[#E4E8E0]" style={{ padding: '16px' }}>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A9E8C]" style={{ marginBottom: '0.5rem' }}>Points</p>
                        <p className="font-bold text-[#111827]" style={{ fontSize: '1.75rem', margin: 0 }}>{quizResult.earnedPoints}/{quizResult.totalPoints}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center sm:flex-row sm:justify-center" style={{ marginTop: '2rem', gap: '1rem' }}>
                      {quizResult.passed ? (
                        <button className="rounded-full bg-[#4A8C5C] text-sm font-semibold text-white transition hover:bg-[#3B7A54]" style={{ padding: '10px 24px' }}>
                          Continue to Next Lesson &rarr;
                        </button>
                      ) : quizResult.canRetake ? (
                        <button onClick={startQuiz} className="rounded-full border border-[#C9973A] text-sm font-semibold text-[#C9973A] transition hover:bg-[#C9973A] hover:text-[#1A261D]" style={{ padding: '10px 24px' }}>
                          Retake Quiz ({quizResult.attemptsLeft} left)
                        </button>
                      ) : (
                        <span className="text-[#8A9E8C] text-xs">No attempts left. Contact your instructor.</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 className="font-serif text-[#1A261D]" style={{ fontSize: '1.25rem', margin: 0 }}>Review Answers</h3>
                    {quizResult.results.map((r: any, i: number) => (
                      <div key={i} className="rounded-[20px] border border-[#E4E8E0] bg-white shadow-sm" style={{ padding: '1.25rem' }}>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start" style={{ marginBottom: '0.75rem', gap: '0.5rem' }}>
                          <span className="text-xs font-semibold text-[#8A9E8C]">Question {i + 1}</span>
                          <span className="rounded-full bg-[#FAFAF7] text-[10px] uppercase tracking-[0.2em] text-[#4A8C5C]" style={{ padding: '4px 8px' }}>
                            {r.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-[#1A261D]" style={{ fontSize: '1rem', marginBottom: '1rem' }}>{r.questionText}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                          <div className="rounded-[12px] bg-[#FAFAF7] border border-[#E4E8E0]" style={{ padding: '12px' }}>
                            <p className="text-[#8A9E8C] text-[10px] uppercase" style={{ marginBottom: '0.5rem' }}>Your Answer</p>
                            <div className="flex items-center text-[#1A261D]" style={{ gap: '0.5rem' }}>
                              {r.isCorrect ? <CheckCircle className="text-[#4A8C5C]" style={{ width: '1rem', height: '1rem' }} /> : <XCircle className="text-[#8C3A3A]" style={{ width: '1rem', height: '1rem' }} />}
                              <span className={r.isCorrect ? 'font-semibold text-[#4A8C5C]' : 'line-through text-[#8C3A3A]'}>{r.yourAnswer || 'No answer'}</span>
                            </div>
                          </div>
                          {!r.isCorrect && r.correctAnswer && (
                            <div className="rounded-[12px] bg-[#EBF7ED] border border-[#D1E7D1]" style={{ padding: '12px' }}>
                              <p className="text-[#4A8C5C] text-[10px] uppercase" style={{ marginBottom: '0.5rem' }}>Correct Answer</p>
                              <p className="font-semibold text-[#1A261D]" style={{ margin: 0 }}>{r.correctAnswer}</p>
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
          <div className="w-full min-h-full bg-white text-[#1A261D]" style={{ padding: "40px 8%" }}>
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 xl:gap-24">
              
              {/* Left Column: Instructions */}
              <div className="flex-1 lg:max-w-[60%]">
                <div className="mb-12 pb-10 border-b border-[#E4E8E0]" style={{ marginBottom: "48px" }}>
                  <div className="inline-flex items-center gap-2 bg-[#FAFAF7] border border-[#E4E8E0] rounded-md text-[11px] font-bold uppercase tracking-[0.15em] text-[#4A8C5C] mb-6" style={{ padding: "8px 16px" }}>
                    <ClipboardCheck className="w-3.5 h-3.5" /> Assignment
                  </div>
                  
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1A261D] font-bold mb-8 leading-[1.15] tracking-tight">
                    {lesson.assignment?.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-[#8A9E8C]">
                    {lesson.assignment?.dueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#C9973A]" /> 
                        <span className="font-semibold text-[#1A261D]">Due {new Date(lesson.assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1A261D] uppercase tracking-wider text-[11px] bg-[#FAFAF7] border border-[#E4E8E0] rounded-md" style={{ padding: "8px 16px" }}>
                        Max Score: {lesson.assignment?.maxScore} pts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none text-[#1A261D]/80 leading-[1.8] whitespace-pre-wrap font-medium" 
                     style={{ fontSize: "17px", marginTop: "40px" }}
                     dangerouslySetInnerHTML={{ __html: lesson.assignment?.description || "" }} />

                {lesson.assignment?.attachmentUrl && (
                  <div className="mt-16 pt-10 border-t border-[#E4E8E0]">
                    <h3 className="text-xs font-bold text-[#8A9E8C] uppercase tracking-[0.15em] mb-6">Included Resources</h3>
                    <a href={lesson.assignment.attachmentUrl} target="_blank" rel="noreferrer" 
                       className="inline-flex items-center gap-3 px-6 py-4 bg-[#FAFAF7] border border-[#E4E8E0] text-[#1A261D] rounded-xl hover:bg-white hover:border-[#C9973A] hover:text-[#C9973A] hover:shadow-sm transition-all duration-300 text-[15px] font-bold">
                      <Download className="w-5 h-5" /> Download Attached File
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column: Submission Area */}
              <div className="flex-1 lg:max-w-[40%]">
                <div className="sticky top-24">
                  {!assignmentSub && (
                    <div className="bg-white rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-[#E4E8E0]/60 relative overflow-hidden" style={{ padding: "48px" }}>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C9973A] to-[#E0C17A]" />
                      <h2 className="font-serif text-3xl font-bold mb-8 text-[#1A261D]">Your Submission</h2>
                      
                      <div className="space-y-8">
                        <div>
                          <label className="block text-[11px] font-bold text-[#8A9E8C] mb-3 uppercase tracking-[0.15em]">Response</label>
                          <textarea 
                            rows={8}
                            className="w-full bg-[#FAFAF7] rounded-2xl p-6 text-[15px] text-[#1A261D] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#C9973A]/50 transition-all duration-300 placeholder:text-[#8A9E8C]/50 border border-transparent focus:border-[#C9973A]/30 resize-none"
                            placeholder="Type your thoughtful response here..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[11px] font-bold text-[#8A9E8C] uppercase tracking-[0.15em]" style={{ marginBottom: "16px" }}>Attached File <span className="lowercase font-medium tracking-normal">(Optional)</span></label>
                          <label className="block rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer bg-[#FAFAF7] border border-[#E4E8E0] hover:border-[#C9973A]/50 hover:bg-[#FDFBF7] group">
                            <input type="file" className="hidden" />
                            <div className="text-[15px] font-bold text-[#1A261D]">Click to browse or drag & drop</div>
                            <div className="text-sm text-[#8A9E8C] mt-2 font-medium">PDF, DOC, ZIP up to 50MB</div>
                          </label>
                        </div>
                        
                        <div style={{ marginTop: "32px" }}>
                          <button className="w-full bg-[#C9973A] text-white rounded-2xl font-bold hover:bg-[#A8792A] hover:shadow-[0_8px_20px_rgba(201,151,58,0.3)] transition-all duration-300 hover:-translate-y-1" style={{ fontSize: "14px", padding: "14px 0", letterSpacing: "0.02em" }}>
                            Submit Assignment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {assignmentSub && !assignmentSub.isGraded && (
                    <div className="bg-[#FAFAF7] border border-[#E4E8E0] rounded-[32px] p-12 text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-[#4A8C5C]" />
                      <div className="w-20 h-20 bg-white border border-[#E4E8E0] shadow-sm rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle className="w-10 h-10 text-[#4A8C5C]" />
                      </div>
                      <h3 className="font-serif text-3xl font-bold text-[#1A261D] mb-4">Submitted!</h3>
                      <p className="text-[#8A9E8C] text-[16px] leading-relaxed font-medium">
                        Your work is securely uploaded and awaiting instructor review. We will notify you once it has been graded.
                      </p>
                    </div>
                  )}

                  {assignmentSub && assignmentSub.isGraded && (
                    <div className="bg-[#FAFAF7] border border-[#E4E8E0] rounded-[32px] overflow-hidden">
                      <div className="p-12 text-center border-b border-[#E4E8E0] bg-white">
                        <div className="inline-block bg-[#4A8C5C] text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">Graded ✓</div>
                        <h3 className="text-xs uppercase tracking-[0.2em] text-[#8A9E8C] mb-4 font-bold">Your Official Score</h3>
                        <div className="font-serif text-7xl text-[#1A261D] font-bold tracking-tight">
                          {assignmentSub.grade} <span className="text-3xl text-[#8A9E8C]">/ {lesson.assignment?.maxScore}</span>
                        </div>
                      </div>
                      
                      {assignmentSub.feedback && (
                        <div className="p-10 bg-[#FAFAF7]">
                          <h4 className="text-[11px] font-bold text-[#8A9E8C] uppercase tracking-[0.15em] mb-5 flex items-center gap-3">
                            <span className="text-[#C9973A] text-lg">✍️</span> Instructor Feedback
                          </h4>
                          <div className="text-[16px] text-[#1A261D]/85 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: assignmentSub.feedback }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PREV/NEXT NAV BOTTOM BAR */}
      <div className="h-16 shrink-0 bg-[#FFFFFF] border-t border-[#E4E8E0] flex items-center justify-between px-12 md:px-20 z-30 sticky bottom-0">
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

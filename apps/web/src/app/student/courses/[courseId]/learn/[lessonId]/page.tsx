"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore, api } from "@/store/auth.store";
import { CheckCircle, XCircle, HelpCircle, ClipboardCheck, ArrowLeft, ArrowRight, Download, Calendar, MessageSquare, Send, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const enrollmentId = "mock-enr-id"; // Will be fetched
  const { user } = useAuthStore();

  const [lesson, setLesson] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  // Forum state
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPostingForum, setIsPostingForum] = useState(false);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState<Record<string, boolean>>({});
  const [loadingForum, setLoadingForum] = useState(false);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState("");
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState("");
  
  const handleEditPost = async (postId: string) => {
    try {
      const res = await api.put(`/forums/discussions/${postId}`, { content: editingPostContent });
      setForumPosts(prev => prev.map(p => p.id === postId ? { ...p, content: res.data.data.content } : p));
      setEditingPostId(null);
      toast.success("Reply updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update reply");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    try {
      await api.delete(`/forums/discussions/${postId}`);
      setForumPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Reply deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete reply");
    }
  };

  const handleEditReply = async (postId: string, replyId: string) => {
    try {
      const res = await api.put(`/forums/replies/${replyId}`, { content: editingReplyContent });
      setForumPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            replies: p.replies.map((r: any) => r.id === replyId ? { ...r, content: res.data.data.content } : r)
          };
        }
        return p;
      }));
      setEditingReplyId(null);
      toast.success("Reply updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update reply");
    }
  };

  const handleDeleteReply = async (postId: string, replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    try {
      await api.delete(`/forums/replies/${replyId}`);
      setForumPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            replies: p.replies.filter((r: any) => r.id !== replyId)
          };
        }
        return p;
      }));
      toast.success("Reply deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete reply");
    }
  };

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
  const [submissionResponse, setSubmissionResponse] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmittingAssig, setIsSubmittingAssig] = useState(false);

  const onSubmitAssignment = async () => {
    if (!lesson?.assignment?.id || (!submissionResponse.trim() && !submissionFile)) return;
    setIsSubmittingAssig(true);
    try {
      const formData = new FormData();
      formData.append("content", submissionResponse);
      if (submissionFile) {
        formData.append("file", submissionFile);
      }
      const res = await api.post(`/student/assignments/${lesson.assignment.id}/submit`, formData);
      setAssignmentSub(res.data.data);
      // Mark as complete in progress
      markComplete();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit assignment");
    } finally {
      setIsSubmittingAssig(false);
    }
  };

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        // Get enrollment
        const enrRes = await api.get(`/student/courses/${courseId}/learn`);
        const enr = enrRes.data.data;
        setEnrollment(enr);

        // Fetch instructor explicitly just in case enrollment doesn't have it
        try {
          const cRes = await api.get(`/courses/${courseId}`);
          setInstructor(cRes.data.data.instructor);
        } catch {}
        
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
          }
          // If forum, fetch existing posts
          else if (foundLesson.type === "FORUM") {
             setLesson({ ...foundLesson, section: foundSection });
             setLoadingForum(true);
             try {
               const postsRes = await api.get(`/forums/lessons/${foundLesson.id}`);
               setForumPosts(postsRes.data.data || []);
             } catch { /* no posts yet */ } finally {
               setLoadingForum(false);
             }
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
      setEnrollment((prev: any) => {
        if (!prev) return prev;
        const newProgress = [...(prev.lessonProgress || [])];
        if (lesson.type === "READING_MATERIAL") {
          const newRmProgress = [...(prev.readingMaterialProgress || [])];
          if (!newRmProgress.find((p: any) => p.readingMaterialId === lesson.id)) {
            newRmProgress.push({ readingMaterialId: lesson.id, completedAt: new Date() });
          }
          return { ...prev, readingMaterialProgress: newRmProgress };
        } else {
          if (!newProgress.find((p: any) => p.lessonId === lesson.id)) {
            newProgress.push({ lessonId: lesson.id, completedAt: new Date() });
          }
          return { ...prev, lessonProgress: newProgress };
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNext = async () => {
    if (!enrollment || !lesson) return;
    
    if (lesson.type === "READING_MATERIAL") {
      await markComplete();
    } else if (lesson.type === "QUIZ" && quizResult?.passed && !lesson.isCompleted) {
      // Fallback in case submitQuiz failed to mark complete
      await markComplete();
    }
    
    if (!nextItem) {
      if (enrollment.completedAt || enrollment.status === "COMPLETED") {
        router.push(`/student/dashboard`);
      } else {
        toast.success("Congratulations! You have completed the course.", { duration: 5000 });
        router.push(`/student/dashboard`);
      }
      return;
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
                            value={submissionResponse}
                            onChange={(e) => setSubmissionResponse(e.target.value)}
                            className="w-full bg-[#FAFAF7] rounded-2xl p-6 text-[15px] text-[#1A261D] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#C9973A]/50 transition-all duration-300 placeholder:text-[#8A9E8C]/50 border border-transparent focus:border-[#C9973A]/30 resize-none"
                            placeholder="Type your thoughtful response here..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[11px] font-bold text-[#8A9E8C] uppercase tracking-[0.15em]" style={{ marginBottom: "16px" }}>Attached File <span className="lowercase font-medium tracking-normal">(Optional)</span></label>
                          <label className="block rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer bg-[#FAFAF7] border border-[#E4E8E0] hover:border-[#C9973A]/50 hover:bg-[#FDFBF7] group">
                            <input type="file" className="hidden" onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)} />
                            <div className="text-[15px] font-bold text-[#1A261D]">
                              {submissionFile ? submissionFile.name : "Click to browse or drag & drop"}
                            </div>
                            {!submissionFile && (
                              <div className="text-sm text-[#8A9E8C] mt-2 font-medium">PDF, DOC, ZIP up to 50MB</div>
                            )}
                          </label>
                        </div>
                        
                        <div style={{ marginTop: "32px" }}>
                          <button 
                            onClick={onSubmitAssignment}
                            disabled={isSubmittingAssig || (!submissionResponse.trim() && !submissionFile)}
                            className="w-full bg-[#C9973A] text-white rounded-2xl font-bold hover:bg-[#A8792A] hover:shadow-[0_8px_20px_rgba(201,151,58,0.3)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0" style={{ fontSize: "14px", padding: "14px 0", letterSpacing: "0.02em" }}>
                            {isSubmittingAssig ? "Submitting..." : "Submit Assignment"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {assignmentSub && !assignmentSub.isGraded && (
                    <div className="bg-white rounded-3xl shadow-sm border border-[#E4E8E0] relative overflow-hidden flex flex-col items-center justify-center text-center" style={{ padding: "48px" }}>
                      <div className="w-20 h-20 bg-[#F2F6F3] rounded-full flex items-center justify-center mb-6 ring-8 ring-[#FAFAF7]">
                        <CheckCircle className="w-10 h-10 text-[#4A8C5C]" strokeWidth={2.5} />
                      </div>
                      <h3 className="font-serif text-3xl font-bold text-[#1A261D] mb-3">Submission Received</h3>
                      <p className="text-[#8A9E8C] text-[16px] leading-relaxed font-medium max-w-sm mb-8">
                        Your work is safely uploaded and awaiting review. We will notify you once your instructor posts a grade.
                      </p>
                      <button 
                        onClick={() => {
                          setSubmissionResponse(assignmentSub.content || "");
                          setAssignmentSub(null);
                        }}
                        className="bg-white border border-[#E4E8E0] text-[#1A261D] rounded-xl font-bold hover:bg-[#FAFAF7] hover:border-[#C9973A] transition-all duration-300" style={{ fontSize: "14px", padding: "12px 28px", letterSpacing: "0.02em" }}>
                        Resubmit Assignment
                      </button>
                    </div>
                  )}

                  {assignmentSub && assignmentSub.isGraded && (
                    <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E4E8E0", overflow: "hidden" }}>
                      {/* Top: Score row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "36px 36px", borderBottom: "1px solid #E4E8E0" }}>
                        {/* Score number */}
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: "var(--font-cormorant, Georgia, serif)", fontWeight: 700, color: "#1A261D", lineHeight: 1, flexShrink: 0 }}>
                          <span style={{ fontSize: 64 }}>{assignmentSub.grade}</span>
                          <span style={{ fontSize: 22, color: "#8A9E8C", fontWeight: 400 }}>/ {lesson.assignment?.maxScore}</span>
                        </div>

                        {/* Divider */}
                        <div style={{ width: 1, height: 52, background: "#E4E8E0", flexShrink: 0, marginLeft: 8 }} />

                        {/* Score label + badge */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, paddingLeft: 8 }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#4A8C5C", fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                            <CheckCircle size={13} strokeWidth={2.5} /> Graded
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1A261D", whiteSpace: "nowrap" }}>Your Official Score</div>
                          <div style={{ fontSize: 12, color: "#8A9E8C", whiteSpace: "nowrap" }}>
                            {assignmentSub.grade >= (lesson.assignment?.maxScore * 0.9) ? "Excellent work!" :
                             assignmentSub.grade >= (lesson.assignment?.maxScore * 0.75) ? "Good job!" :
                             "Keep it up!"}
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Feedback */}
                      <div style={{ padding: "32px 36px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#8A9E8C", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
                          Instructor Feedback
                        </div>
                        {assignmentSub.feedback ? (
                          <div style={{ fontSize: 15, color: "#1A261D", lineHeight: 1.8, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: assignmentSub.feedback }} />
                        ) : (
                          <div style={{ fontSize: 15, color: "#8A9E8C", fontStyle: "italic", lineHeight: 1.7 }}>No additional feedback provided.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FORUM LESSON */}
        {lesson.type === "FORUM" && (() => {
          const getInitials = (name: string | undefined | null) => {
            if (!name) return "U";
            const parts = name.trim().split(" ");
            if (parts.length >= 2) {
              return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return name.slice(0, 2).toUpperCase();
          };

          return (
            <div className="w-full min-h-full bg-[#FAFAF7] text-[#1A261D]" style={{ padding: "56px 8%" }}>
              <div className="max-w-3xl mx-auto">
                
                {/* Instructor Question Block */}
                <div className="bg-white border border-[#E4E8E0] rounded-[24px] shadow-sm overflow-hidden" style={{ marginBottom: '48px' }}>
                  <div style={{ padding: '32px 40px' }}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-full bg-[#1A261D] flex items-center justify-center text-[#C9973A] font-bold text-[15px] shadow-sm border-2 border-white">
                        {getInitials(instructor?.name || enrollment?.course?.instructor?.name || "Course Instructor")}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1A261D] text-[16px] flex items-center gap-2">
                          {instructor?.name || enrollment?.course?.instructor?.name || "Course Instructor"}
                          <span className="px-2 py-0.5 bg-[#FBF6EC] border border-[#C9973A]/20 text-[#C9973A] text-[9px] font-bold uppercase tracking-widest rounded-md">Instructor</span>
                        </h4>
                        <div className="text-[13px] text-[#8A9E8C] mt-0.5">Posted a discussion prompt</div>
                      </div>
                    </div>

                    <h1 className="font-serif text-3xl md:text-4xl text-[#1A261D] font-bold mb-6 leading-tight tracking-tight">{lesson.title}</h1>
                    {lesson.content && (
                      <div className="text-[#2C3E30] text-[17px] leading-[1.8]">
                        {lesson.content}
                      </div>
                    )}
                  </div>

                  {/* Direct Reply to Instructor Input */}
                  <div className="bg-[#FAFAF7] border-t border-[#E4E8E0]" style={{ padding: '24px 40px' }}>
                    <div className="flex gap-5">
                      <div className="w-11 h-11 rounded-full bg-white border border-[#E4E8E0] flex items-center justify-center text-[#526658] font-bold text-[13px] shrink-0 shadow-sm">
                        ME
                      </div>
                      <div className="flex-1">
                        <div className="bg-white rounded-[20px] border border-[#E4E8E0] shadow-sm overflow-hidden focus-within:border-[#C9973A] focus-within:ring-1 focus-within:ring-[#C9973A] transition-all relative">
                          <textarea
                            value={newPostContent}
                            onChange={e => setNewPostContent(e.target.value)}
                            placeholder="Write your reply to this prompt..."
                            rows={4}
                            className="w-full bg-transparent text-[15px] text-[#1A261D] placeholder-[#8A9E8C] outline-none resize-none leading-relaxed"
                            style={{ padding: '24px 24px 64px 24px', overflowY: "auto" }}
                            onWheel={(e) => {
                              const target = e.currentTarget;
                              const isScrollingDown = e.deltaY > 0;
                              const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;
                              const isAtTop = target.scrollTop <= 0;
                              
                              if ((isScrollingDown && !isAtBottom) || (!isScrollingDown && !isAtTop)) {
                                e.stopPropagation();
                              }
                            }}
                          />
                          <div className="absolute bottom-3 right-3 flex items-center gap-3 z-10">
                            <span className="text-[12px] text-[#8A9E8C] font-medium">{newPostContent.length > 0 ? `${newPostContent.length} chars` : ""}</span>
                            <button
                              disabled={!newPostContent.trim() || isPostingForum}
                              onClick={async () => {
                                if (!newPostContent.trim()) return;
                                setIsPostingForum(true);
                                try {
                                  const res = await api.post(`/forums/lessons/${lesson.id}`, { content: newPostContent });
                                  setForumPosts(prev => [res.data.data, ...prev]);
                                  setNewPostContent("");
                                  
                                  // Mark lesson as complete since student replied
                                  if (!lesson.isCompleted) {
                                    await markComplete();
                                  }
                                } catch (err: any) {
                                  console.error(err);
                                  toast.error(err.response?.data?.message || "Failed to post reply");
                                } finally {
                                  setIsPostingForum(false);
                                }
                              }}
                              className="flex items-center justify-center w-10 h-10 bg-[#1A261D] text-white rounded-xl hover:bg-[#2C3E30] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Classmate Replies Header */}
                <div className="flex items-center gap-4" style={{ marginTop: '32px', marginBottom: '32px' }}>
                  <h3 className="font-serif text-2xl font-bold text-[#1A261D]">Classmate Replies</h3>
                  <span className="px-3 py-1 bg-white border border-[#E4E8E0] text-[#526658] text-[13px] font-bold rounded-full shadow-sm">{forumPosts.length}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#E4E8E0] to-transparent" />
                </div>

                {/* Discussions Section */}
                <div>
                  {loadingForum ? (
                    <div className="py-20 flex flex-col items-center justify-center text-[#8A9E8C]">
                      <div className="w-8 h-8 border-2 border-[#E4E8E0] border-t-[#C9973A] rounded-full animate-spin mb-4" />
                      <p className="font-medium text-[15px]">Loading replies...</p>
                    </div>
                  ) : forumPosts.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-dashed border-[#E4E8E0] shadow-sm">
                      <div className="w-16 h-16 rounded-full bg-[#FAFAF7] border border-[#E4E8E0] flex items-center justify-center mb-6">
                        <MessageSquare size={24} className="text-[#8A9E8C]" />
                      </div>
                      <h4 className="font-serif text-2xl text-[#1A261D] font-bold mb-3">No replies yet</h4>
                      <p className="text-[#8A9E8C] text-[15px] max-w-sm mx-auto leading-relaxed">Be the first to share your thoughts and answer the instructor's prompt!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {forumPosts.map((post: any) => (
                        <div key={post.id} className="group bg-white rounded-[24px] border border-[#E4E8E0] shadow-sm" style={{ padding: '28px 36px' }}>
                          {/* Post Header */}
                          <div className="flex items-center gap-4 mb-5">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F5E6C8] to-[#EDD9A3] flex items-center justify-center text-[#9A6C1A] font-bold text-[14px] border-2 border-white shadow-sm">
                              {getInitials(post.author?.name)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-[#1A261D] text-[15px]">{post.author?.name}</h4>
                                {post.author?.role !== "STUDENT" && (
                                  <span className="px-2 py-0.5 bg-[#FBF6EC] text-[#C9973A] text-[9px] font-bold uppercase tracking-wider rounded-md">{post.author?.role}</span>
                                )}
                              </div>
                              <div className="text-[12px] text-[#8A9E8C] mt-0.5">
                                {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                              </div>
                            </div>
                            
                            {/* Edit/Delete Actions for Author */}
                            {(post.authorId === user?.id || post.author?.id === user?.id) && (
                              <div className="flex items-center gap-2 self-start opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingPostId(post.id);
                                    setEditingPostContent(post.content);
                                  }}
                                  className="p-1.5 text-[#8A9E8C] hover:text-[#B88645] hover:bg-[#FBF6EC] rounded-md transition-colors"
                                  title="Edit Post"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="p-1.5 text-[#8A9E8C] hover:text-[#B03A2E] hover:bg-[#FDF0EE] rounded-md transition-colors"
                                  title="Delete Post"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Post Content */}
                          {editingPostId === post.id ? (
                            <div className="mb-6 pl-[60px]">
                              <textarea
                                value={editingPostContent}
                                onChange={e => setEditingPostContent(e.target.value)}
                                className="w-full bg-white border border-[#E4E8E0] rounded-[16px] text-[15px] text-[#1A261D] outline-none focus:border-[#C9973A] transition-all p-4 min-h-[100px]"
                              />
                              <div className="flex gap-2 mt-2 justify-end">
                                <button onClick={() => setEditingPostId(null)} className="px-4 py-2 text-sm font-medium text-[#526658] hover:bg-[#F7F8F5] rounded-xl transition-colors">Cancel</button>
                                <button onClick={() => handleEditPost(post.id)} className="px-4 py-2 text-sm font-bold text-white bg-[#1A261D] hover:bg-[#2C3E30] rounded-xl transition-colors">Save</button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[16px] text-[#2C3E30] leading-[1.8] mb-6 pl-[60px]">{post.content}</p>
                          )}

                          {/* Replies Section */}
                          <div className="ml-[60px]">
                            <button
                              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                              className="flex items-center gap-1.5 text-[13px] font-bold text-[#8A9E8C] hover:text-[#1A261D] transition-colors mb-4"
                            >
                              <ChevronDown size={14} className={`transition-transform duration-300 ${expandedPost === post.id ? "rotate-180" : ""}`} />
                              {post.replies?.length || 0} {post.replies?.length === 1 ? "Reply" : "Replies"}
                            </button>

                            {expandedPost === post.id && (
                              <div className="space-y-4">
                                {/* Existing Replies */}
                                {post.replies?.map((reply: any) => (
                                  <div key={reply.id} className="group flex gap-4 bg-[#FAFAF7] p-5 rounded-[20px] border border-[#E4E8E0]">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 border-2 border-white shadow-sm ${reply.isInstructor ? "bg-[#1A261D] text-[#C9973A]" : "bg-gradient-to-br from-[#F5E6C8] to-[#EDD9A3] text-[#9A6C1A]"}`}>
                                      {getInitials(reply.author?.name)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span className="font-bold text-[#1A261D] text-[14px]">{reply.author?.name}</span>
                                        {reply.isInstructor && (
                                          <span className="px-1.5 py-0.5 rounded-md bg-[#1A261D] text-[#C9973A] text-[9px] font-bold uppercase tracking-wider">Instructor</span>
                                        )}
                                        <span className="text-[11px] text-[#8A9E8C] ml-auto">
                                          {new Date(reply.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                        </span>
                                      </div>
                                      
                                      {editingReplyId === reply.id ? (
                                        <div className="mt-2">
                                          <textarea
                                            value={editingReplyContent}
                                            onChange={e => setEditingReplyContent(e.target.value)}
                                            className="w-full bg-white border border-[#E4E8E0] rounded-[12px] text-[14px] text-[#1A261D] outline-none focus:border-[#C9973A] transition-all p-3 min-h-[60px]"
                                          />
                                          <div className="flex gap-2 mt-2 justify-end">
                                            <button onClick={() => setEditingReplyId(null)} className="px-3 py-1.5 text-xs font-medium text-[#526658] hover:bg-[#F7F8F5] rounded-lg transition-colors">Cancel</button>
                                            <button onClick={() => handleEditReply(post.id, reply.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-[#1A261D] hover:bg-[#2C3E30] rounded-lg transition-colors">Save</button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-[15px] text-[#526658] leading-relaxed">{reply.content}</p>
                                      )}
                                    </div>
                                    
                                    {/* Edit/Delete Actions for Reply Author */}
                                    {(reply.authorId === user?.id || reply.author?.id === user?.id) && (
                                      <div className="flex flex-col items-center gap-1 self-start opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => {
                                            setEditingReplyId(reply.id);
                                            setEditingReplyContent(reply.content);
                                          }}
                                          className="p-1 text-[#8A9E8C] hover:text-[#B88645] hover:bg-[#FBF6EC] rounded-md transition-colors"
                                          title="Edit Reply"
                                        >
                                          <Pencil size={13} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteReply(post.id, reply.id)}
                                          className="p-1 text-[#8A9E8C] hover:text-[#B03A2E] hover:bg-[#FDF0EE] rounded-md transition-colors"
                                          title="Delete Reply"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}

                                {/* Reply Input */}
                                <div className="flex gap-4 items-start mt-4">
                                  <div className="w-9 h-9 rounded-full bg-white border border-[#E4E8E0] flex items-center justify-center text-[#526658] font-bold text-[12px] shrink-0 mt-1 shadow-sm">
                                    ME
                                  </div>
                                  <div className="flex-1 relative">
                                    <textarea
                                      value={replyContent[post.id] || ""}
                                      onChange={e => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      placeholder="Write a reply..."
                                      rows={2}
                                      className="w-full bg-white border border-[#E4E8E0] rounded-[16px] text-[15px] text-[#1A261D] placeholder-[#8A9E8C] outline-none resize-none focus:border-[#C9973A] transition-all p-4 pr-14 min-h-[52px]"
                                      style={{ overflowY: "auto" }}
                                      onWheel={(e) => {
                                        const target = e.currentTarget;
                                        const isScrollingDown = e.deltaY > 0;
                                        const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;
                                        const isAtTop = target.scrollTop <= 0;
                                        
                                        if ((isScrollingDown && !isAtBottom) || (!isScrollingDown && !isAtTop)) {
                                          e.stopPropagation();
                                        }
                                      }}
                                    />
                                    <button
                                      disabled={!replyContent[post.id]?.trim() || isReplying[post.id]}
                                      onClick={async () => {
                                        const content = replyContent[post.id]?.trim();
                                        if (!content) return;
                                        setIsReplying(prev => ({ ...prev, [post.id]: true }));
                                        try {
                                          const res = await api.post(`/forums/discussions/${post.id}/replies`, { content });
                                          setForumPosts(prev => prev.map(p => p.id === post.id ? { ...p, replies: [...(p.replies || []), res.data.data] } : p));
                                          setReplyContent(prev => ({ ...prev, [post.id]: "" }));
                                        } catch {}
                                        setIsReplying(prev => ({ ...prev, [post.id]: false }));
                                      }}
                                      className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-[#1A261D] text-white rounded-xl hover:bg-[#2C3E30] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      <Send size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })()}

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
          onClick={handleNext}
          title={nextLesson ? "Continue to next lesson" : (enrollment?.completedAt || enrollment?.status === "COMPLETED" ? "Return to Dashboard" : "You have reached the end of the course")}
          className={`${nextButtonClasses} ml-4`}
        >
          {nextLesson ? "Next Lesson" : (enrollment?.completedAt || enrollment?.status === "COMPLETED" ? "Exit Course" : "End of Course")} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

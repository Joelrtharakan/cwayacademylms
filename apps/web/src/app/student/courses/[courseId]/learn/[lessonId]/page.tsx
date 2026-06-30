"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore, api, fetchWithCache } from "@/store/auth.store";
import { CheckCircle, XCircle, HelpCircle, ClipboardCheck, ArrowLeft, ArrowRight, Download, Calendar, MessageSquare, Send, ChevronDown, Pencil, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/shared/ConfirmContext";

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
  const confirm = useConfirm();

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
    if (!(await confirm("Are you sure you want to delete this reply?"))) return;
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
    if (!(await confirm("Are you sure you want to delete this reply?"))) return;
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
  const quizAnswersRef = useRef<any>({});
  useEffect(() => { quizAnswersRef.current = quizAnswers; }, [quizAnswers]);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizResult, setQuizResult] = useState<any>(null);
  const lastSavedSecond = useRef<number>(0);
  const [cheatStrikes, setCheatStrikes] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

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
  const [isUnsubmittingAssig, setIsUnsubmittingAssig] = useState(false);
  const [extensions, setExtensions] = useState<any[]>([]);
  const [extensionRequests, setExtensionRequests] = useState<any[]>([]);
  const [isRequestingExtension, setIsRequestingExtension] = useState(false);
  const [extensionReason, setExtensionReason] = useState("");
  const [extensionRequestedDate, setExtensionRequestedDate] = useState("");

  const requestExtensionMut = useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: string, itemType: string }) => {
      return await api.post(`/courses/${courseId}/extensions/request`, {
        itemId,
        itemType,
        reason: extensionReason,
        requestedDate: extensionRequestedDate || undefined
      });
    },
    onSuccess: () => {
      toast.success("Extension requested successfully");
      setIsRequestingExtension(false);
      setExtensionReason("");
      setExtensionRequestedDate("");
      // Refetch extensions
      api.get(`/courses/${courseId}/extensions/my-requests`).then(r => {
        setExtensions(r.data.data.granted);
        setExtensionRequests(r.data.data.requests);
      });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to request extension")
  });

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

  const onUnsubmitAssignment = async () => {
    if (!lesson?.assignment?.id) return;
    setIsUnsubmittingAssig(true);
    try {
      await api.delete(`/student/assignments/${lesson.assignment.id}/unsubmit`);
      setAssignmentSub(null);
      setSubmissionResponse("");
      setSubmissionFile(null);
      toast.success("Assignment unsubmitted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to unsubmit assignment");
    } finally {
      setIsUnsubmittingAssig(false);
    }
  };

  // Fetch course-level data ONCE (enrollment, instructor, extensions)
  const enrollmentRef = useRef<any>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      try {
        const enrRes = await fetchWithCache(`/student/courses/${courseId}/learn`);
        const enr = enrRes.data.data;
        enrollmentRef.current = enr;
        setEnrollment(enr);

        // Fetch instructor
        try {
          const cRes = await api.get(`/courses/${courseId}`);
          setInstructor(cRes.data.data.instructor);
        } catch {}

        // Fetch extensions
        try {
          const extRes = await api.get(`/courses/${courseId}/extensions/my-requests`);
          setExtensions(extRes.data.data.granted || []);
          setExtensionRequests(extRes.data.data.requests || []);
        } catch {}
      } catch (err) {
        console.error("Failed to load course data", err);
      }
    };
    fetchCourseData();
  }, [courseId]);

  // Fetch lesson-specific data when lessonId changes (uses cached enrollment)
  useEffect(() => {
    const fetchLesson = async () => {
      // Wait for enrollment to be available
      let enr = enrollmentRef.current;
      if (!enr) {
        // If enrollment hasn't loaded yet, fetch it
        try {
          const enrRes = await fetchWithCache(`/student/courses/${courseId}/learn`);
          enr = enrRes.data.data;
          enrollmentRef.current = enr;
          setEnrollment(enr);
        } catch (err) {
          console.error("Failed to load lesson", err);
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);
        
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
    
    // Optimistic UI Update: Update state immediately so the button feels instant
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

    // Fire API request in the background
    try {
      if (lesson.type === "READING_MATERIAL") {
        await api.post(`/student/enrollments/${enrollment.id}/reading-materials/${lesson.id}/complete`);
      } else {
        await api.post(`/student/enrollments/${enrollment.id}/lessons/${lessonId}/complete`);
      }
      
      // Dispatch event to sync sidebar layout
      window.dispatchEvent(new Event('lessonCompleted'));
      
    } catch (err) {
      console.error("Failed to mark complete. Reverting optimistic update.", err);
      setLesson((prev: any) => ({ ...prev, isCompleted: false }));
    }
  };

  const [isNavigating, setIsNavigating] = useState(false);
  const handleNext = async () => {
    if (!enrollment || !lesson) return;
    setIsNavigating(true);
    
    if (lesson.type === "READING_MATERIAL" && !lesson.isCompleted) {
      markComplete();
    } else if (lesson.type === "QUIZ" && !lesson.isCompleted) {
      const hasPassed = lesson.attempts?.some((a: any) => a.passed) || quizResult?.passed;
      const maxReached = lesson.quiz?.maxAttempts > 0 && lesson.attempts?.length >= lesson.quiz.maxAttempts;
      if (hasPassed || maxReached) {
        markComplete();
      }
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
    
    // If the next item is in a new section/module, route to the Week Description page first
    if (lesson.section && nextItem.section && nextItem.section.id !== lesson.section.id) {
      router.push(`/student/courses/${courseId}/learn/week/${nextItem.section.id}`);
      return;
    }
    
    goToItem(nextItem);
    // Don't reset isNavigating, let the component unmount or let Next.js handle the transition.
  };

  const previousLesson = previousItem;
  const nextLesson = nextItem;

  useEffect(() => {
    if (nextLesson) {
      router.prefetch(`/student/courses/${courseId}/learn/${nextLesson.id}`);
    }
  }, [nextLesson, courseId, router]);

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
    setIsStartingQuiz(true);
    try {
      const res = await api.post(`/student/quizzes/${lesson.quiz.id}/attempt`);
      setQuizData(res.data.data);
      setQuizState("in_progress");
      setCurrentQuestionIdx(0);
      setQuizAnswers({});
      setCheatStrikes(0);
      setShowCheatWarning(false);
      setTimeLeft(res.data.data.timeLimit || null);
      
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.warn("Fullscreen request failed", e);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to start quiz");
    } finally {
      setIsStartingQuiz(false);
    }
  };

  const submitQuiz = async () => {
    if (!quizData || !lesson) return;
    setIsSubmittingQuiz(true);
    try {
      const res = await api.post(`/student/quizzes/${lesson.quiz.id}/submit`, {
        attemptId: quizData.attemptId,
        answers: quizAnswersRef.current
      });
      setQuizResult(res.data.data);
      setQuizState("results");
      
      if (res.data.data.passed || !res.data.data.canRetake) {
        await markComplete();
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
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Anti-cheat detection
  useEffect(() => {
    const handleViolation = () => {
      if (quizState === "in_progress") {
        setCheatStrikes(prev => prev + 1);
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

  useEffect(() => {
    const handleCheat = async () => {
      if (cheatStrikes > 3 && quizState === "in_progress") {
        toast.error("Quiz automatically submitted due to maximum infractions. Cheating is not permitted.");
        await submitQuiz();
        await markComplete();
        handleNext();
      } else if (cheatStrikes > 0 && cheatStrikes <= 3 && quizState === "in_progress") {
        setShowCheatWarning(true);
      }
    };
    handleCheat();
  }, [cheatStrikes, quizState]);

  // Countdown timer
  useEffect(() => {
    let timer: any;
    if (quizState === "in_progress" && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== null && prev <= 1) {
            clearInterval(timer);
            submitQuiz();
            toast.error("Time is up! Your quiz has been automatically submitted.");
            return 0;
          }
          return prev !== null ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizState, timeLeft !== null]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
    <div className="w-full flex flex-col h-[calc(100vh-70px)] relative overflow-hidden bg-[#FAFAF7]">
      <div data-lenis-prevent="true" className="flex-1 w-full relative overflow-y-auto overflow-x-hidden">
        {/* VIDEO LESSON */}
        {lesson.type === "VIDEO" && (
          <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center [&_iframe]:!w-full [&_iframe]:!h-full [&_video]:!w-full [&_video]:!h-full [&_video]:!object-contain">
            <div className="w-full h-full relative max-w-7xl mx-auto flex items-center justify-center">
              {lesson.videoUrl ? (
                lesson.videoUrl.includes('youtu') ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${
                      (() => {
                        const match = lesson.videoUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/);
                        return (match && match[2].length === 11) ? match[2] : '';
                      })()
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
            {/* Button moved to bottom bar */}
          </div>
        )}

        {/* READING MATERIAL */}
        {lesson.type === "READING_MATERIAL" && (
          <div className="w-full min-h-full bg-[#F7F8F5] text-[#1A261D] px-6 pt-16 pb-32 md:px-12 md:pt-20 md:pb-40">
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
          <div className="w-full min-h-full bg-[#FAFAF7] text-[#1A261D] pb-[120px]" style={{ padding: '3rem 1.5rem 8rem 1.5rem' }}>
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
                          disabled={isStartingQuiz}
                          className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#C9973A] text-sm font-bold text-white shadow-sm transition-all hover:bg-[#B8872A] disabled:opacity-70 disabled:cursor-wait"
                          style={{ padding: '12px 28px' }}
                        >
                          {isStartingQuiz ? "Starting..." : (lesson.attempts && lesson.attempts.length > 0 ? "Retake Quiz" : "Start Quiz")}
                        </button>
                      ) : (
                        <div className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#B8872A] text-sm font-bold text-white cursor-not-allowed opacity-80" style={{ padding: '12px 28px' }}>
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
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-[#1A261D]" style={{ fontSize: '1rem', margin: 0 }}>
                          {currentQuestionIdx + 1} of {quizData.quiz.questions.length}
                        </p>
                        {timeLeft !== null && (
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${timeLeft < 60 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[#FFF7E5] text-[#C9973A] border border-[#FDE6B5]'}`}>
                            <Clock size={14} /> {formatTime(timeLeft)}
                          </div>
                        )}
                      </div>
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
                        disabled={isSubmittingQuiz}
                        className="rounded-full bg-[#C9973A] text-sm font-semibold uppercase tracking-[0.12em] text-[#1A261D] transition hover:bg-[#A8792A] disabled:opacity-70 disabled:cursor-wait"
                        style={{ padding: '0.75rem 1.5rem' }}
                      >
                        {isSubmittingQuiz ? "Submitting..." : "Submit Quiz"}
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
                        <button onClick={startQuiz} disabled={isStartingQuiz} className="rounded-full border border-[#C9973A] text-sm font-semibold text-[#C9973A] transition hover:bg-[#C9973A] hover:text-[#1A261D] disabled:opacity-70 disabled:cursor-wait" style={{ padding: '10px 24px' }}>
                          {isStartingQuiz ? "Starting..." : `Retake Quiz (${quizResult.attemptsLeft} left)`}
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

        {lesson.type === "ASSIGNMENT" && (() => {
          const dueDate = lesson.assignment?.dueDate ? new Date(lesson.assignment.dueDate) : null;
          const assignmentId = lesson.assignment?.id;
          const grantedExtension = extensions.find(e => e.itemId === assignmentId);
          const pendingRequest = extensionRequests.find(r => r.itemId === assignmentId && r.status === "PENDING");
          
          let effectiveDueDate = dueDate;
          if (grantedExtension) effectiveDueDate = new Date(grantedExtension.extendedDate);
          
          const isPastDue = dueDate ? new Date() > dueDate : false;
          const isEffectivelyPastDue = effectiveDueDate ? new Date() > effectiveDueDate : false;

          return (
          <div className="w-full flex-1 bg-white text-gray-900" style={{ minHeight: "calc(100vh - 70px)", padding: "56px 5% 120px 5%" }}>
            <div className="max-w-6xl mx-auto">
              
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                
                {/* Left Column: Header & Instructions */}
                <div className="flex-1 lg:max-w-[60%] xl:max-w-[65%] w-full">
                  
                  <div style={{ marginBottom: "32px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#8F9E93", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
                      <ClipboardCheck size={14} /> Assignment
                    </div>
                    
                    <h1 style={{ fontFamily: "var(--font-sans), sans-serif", fontSize: "32px", color: "#1A261D", fontWeight: 700, marginBottom: "24px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                      {lesson.assignment?.title}
                    </h1>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px", fontSize: "14px", color: "#526658", borderBottom: "1px solid #DCE0D5", paddingBottom: "24px", marginBottom: "32px" }}>
                      {lesson.assignment?.dueDate && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Calendar size={16} /> 
                          <span>Due {new Date(lesson.assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "10px", color: "#8F9E93" }}>Points</span>
                        <span style={{ fontWeight: 600, color: "#1A261D" }}>{lesson.assignment?.maxScore}</span>
                      </div>
                    </div>
                  </div>

                  <div 
                       style={{ fontSize: "16px", color: "#1A261D", lineHeight: 1.7 }}
                       className="prose prose-slate max-w-none"
                       dangerouslySetInnerHTML={{ __html: lesson.assignment?.description || "" }} />

                  {lesson.assignment?.attachmentUrl && (
                    <div className="mt-12 pt-8 border-t border-gray-100">
                      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Resources</h3>
                      <a href={lesson.assignment.attachmentUrl} target="_blank" rel="noreferrer" 
                         className="inline-flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-[14px] font-medium shadow-sm">
                        <Download className="w-4 h-4 text-gray-400" /> 
                        Download Attached File
                      </a>
                    </div>
                  )}
                </div>

              {/* Right Column: Submission Area */}
              <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0">
                <div className="sticky top-24">
                  {!assignmentSub && (
                    <div style={{ background: "#FAFAF7", border: "1px solid #DCE0D5", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.03)" }}>
                      <h2 style={{ fontFamily: "var(--font-sans), sans-serif", fontSize: "20px", fontWeight: 700, color: "#1A261D", marginBottom: "24px" }}>
                        Your Submission
                      </h2>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#526658", marginBottom: "8px" }}>Response</label>
                          <textarea 
                            rows={6}
                            value={submissionResponse}
                            onChange={(e) => setSubmissionResponse(e.target.value)}
                            disabled={isEffectivelyPastDue}
                            data-lenis-prevent="true"
                            style={{ 
                              width: "100%", background: "#FFFFFF", borderRadius: "12px", padding: "16px", 
                              fontSize: "14px", color: "#1A261D", border: "1px solid #DCE0D5", 
                              resize: "vertical", minHeight: "140px", outline: "none", transition: "border-color 0.2s" 
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#B88645"}
                            onBlur={(e) => e.target.style.borderColor = "#DCE0D5"}
                            placeholder="Type your thoughtful response here..."
                          />
                        </div>
                        
                        <div>
                          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#526658", marginBottom: "8px" }}>
                            Attached File <span style={{ fontWeight: 400, color: "#8F9E93" }}>(Optional)</span>
                          </label>
                          <label 
                            style={{ 
                              display: "block", background: "#FFFFFF", border: "2px dashed #DCE0D5", 
                              borderRadius: "12px", padding: "32px 24px", textAlign: "center", cursor: isEffectivelyPastDue ? "not-allowed" : "pointer",
                              opacity: isEffectivelyPastDue ? 0.6 : 1, transition: "background 0.2s, border-color 0.2s"
                            }}
                            onMouseEnter={e => { if(!isEffectivelyPastDue) { e.currentTarget.style.background = "#F7F8F5"; e.currentTarget.style.borderColor = "#B88645"; } }}
                            onMouseLeave={e => { if(!isEffectivelyPastDue) { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.borderColor = "#DCE0D5"; } }}
                          >
                            <input type="file" className="hidden" disabled={isEffectivelyPastDue} onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)} />
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1A261D" }}>
                              {submissionFile ? submissionFile.name : "Click to browse or drag & drop"}
                            </div>
                            {!submissionFile && (
                              <div style={{ fontSize: "12px", color: "#8F9E93", marginTop: "6px" }}>PDF, DOC, ZIP up to 50MB</div>
                            )}
                          </label>
                        </div>
                        
                        <div style={{ marginTop: "8px" }}>
                          <button 
                            onClick={onSubmitAssignment}
                            disabled={isSubmittingAssig || isEffectivelyPastDue || (!submissionResponse.trim() && !submissionFile)}
                            style={{
                              width: "100%", background: (isSubmittingAssig || isEffectivelyPastDue || (!submissionResponse.trim() && !submissionFile)) ? "#A0A0A0" : "#1A261D",
                              color: "#FFFFFF", padding: "16px", borderRadius: "12px", fontSize: "15px", fontWeight: 700,
                              border: "none", cursor: (isSubmittingAssig || isEffectivelyPastDue || (!submissionResponse.trim() && !submissionFile)) ? "not-allowed" : "pointer",
                              transition: "background 0.2s"
                            }}>
                            {isSubmittingAssig ? "Submitting..." : "Submit Assignment"}
                          </button>
                        </div>
                      </div>
                      
                      {/* Extension Logic */}
                      {lesson.assignment?.dueDate && (
                        <div style={{ marginTop: "24px" }}>
                          {(() => {
                            if (!isPastDue && !isEffectivelyPastDue) return null;

                            if (grantedExtension && !isEffectivelyPastDue) {
                              return (
                                <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "12px", padding: "16px", color: "#065F46", fontSize: "14px" }}>
                                  <span style={{ fontWeight: 600 }}>Extension granted until</span> {effectiveDueDate?.toLocaleDateString()}
                                </div>
                              );
                            }

                            if (pendingRequest) {
                              return (
                                <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px", padding: "16px", color: "#92400E", fontSize: "14px" }}>
                                  <span style={{ fontWeight: 600 }}>Extension requested</span> (Pending approval)
                                </div>
                              );
                            }

                            if (isEffectivelyPastDue) {
                              return (
                                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "20px" }}>
                                  <p style={{ color: "#B91C1C", fontSize: "14px", marginBottom: "16px", fontWeight: 500 }}>This assignment is past due. You must request an extension to submit.</p>
                                  {!isRequestingExtension ? (
                                    <button 
                                      onClick={() => setIsRequestingExtension(true)} 
                                      style={{ background: "#FFFFFF", border: "1px solid #FECACA", color: "#DC2626", padding: "10px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                                      Request Extension
                                    </button>
                                  ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #FEE2E2" }}>
                                      <textarea data-lenis-prevent="true" value={extensionReason} onChange={e => setExtensionReason(e.target.value)} placeholder="Reason for extension..." rows={3} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", outline: "none" }} />
                                      <input type="date" value={extensionRequestedDate} onChange={e => setExtensionRequestedDate(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", outline: "none" }} />
                                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                                        <button onClick={() => requestExtensionMut.mutate({ itemId: assignmentId, itemType: "ASSIGNMENT" })} disabled={!extensionReason || requestExtensionMut.isPending} style={{ background: "#DC2626", color: "#FFFFFF", border: "none", padding: "10px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: (!extensionReason || requestExtensionMut.isPending) ? 0.5 : 1 }}>Submit Request</button>
                                        <button onClick={() => setIsRequestingExtension(false)} style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", color: "#4B5563", padding: "10px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {assignmentSub && !assignmentSub.isGraded && (
                    <div style={{ background: "#FAFAF7", border: "1px solid #DCE0D5", borderRadius: "16px", padding: "40px 32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.03)" }}>
                      <div style={{ marginBottom: "16px" }}>
                        <CheckCircle size={48} color="#10B981" strokeWidth={2} />
                      </div>
                      <h3 style={{ fontFamily: "var(--font-sans), sans-serif", fontSize: "22px", fontWeight: 700, color: "#1A261D", marginBottom: "12px" }}>Submission Received</h3>
                      <p style={{ fontSize: "15px", color: "#526658", maxWidth: "280px", margin: "0 auto 28px auto", lineHeight: 1.5 }}>
                        Your work is successfully uploaded and awaiting review.
                      </p>
                      
                      {!isEffectivelyPastDue ? (
                        <button 
                          onClick={onUnsubmitAssignment}
                          disabled={isUnsubmittingAssig}
                          style={{
                            background: "#FFFFFF", border: "1px solid #DCE0D5", color: "#1A261D", padding: "12px 24px", 
                            borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: isUnsubmittingAssig ? "not-allowed" : "pointer",
                            opacity: isUnsubmittingAssig ? 0.6 : 1, transition: "background 0.2s, border-color 0.2s"
                          }}
                          onMouseEnter={e => { if(!isUnsubmittingAssig) e.currentTarget.style.borderColor = "#EF4444"; e.currentTarget.style.color = "#EF4444"; }}
                          onMouseLeave={e => { if(!isUnsubmittingAssig) e.currentTarget.style.borderColor = "#DCE0D5"; e.currentTarget.style.color = "#1A261D"; }}
                        >
                          {isUnsubmittingAssig ? "Unsubmitting..." : "Unsubmit Assignment"}
                        </button>
                      ) : (
                        <div style={{ marginTop: "12px", fontSize: "13px", color: "#92400E", background: "#FEF3C7", border: "1px solid #FDE68A", padding: "10px 16px", borderRadius: "8px" }}>
                          Due date has passed. Unsubmitting is disabled.
                        </div>
                      )}
                    </div>
                  )}

                  {assignmentSub && assignmentSub.isGraded && (
                    <div style={{ background: "#FFFFFF", border: "1px solid #DCE0D5", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.03)" }}>
                      {/* Top: Score row */}
                      <div style={{ display: "flex", alignItems: "center", padding: "24px 32px", borderBottom: "1px solid #DCE0D5", background: "#FAFAF7" }}>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Status</span>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#10B981", fontWeight: 600, fontSize: "15px" }}>
                              <CheckCircle size={18} /> Graded
                            </div>
                          </div>
                          
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Your Score</span>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                              <span style={{ fontSize: "32px", fontWeight: 800, color: "#1A261D", lineHeight: 1 }}>{assignmentSub.grade}</span>
                              <span style={{ fontSize: "14px", color: "#526658", fontWeight: 600 }}>/ {lesson.assignment?.maxScore}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Feedback */}
                      <div style={{ padding: "32px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#8F9E93", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
                          Instructor Feedback
                        </div>
                        {assignmentSub.feedback ? (
                          <div style={{ fontSize: "15px", color: "#1A261D", lineHeight: 1.6, background: "#FAFAF7", padding: "20px", borderRadius: "12px", border: "1px solid #DCE0D5" }} dangerouslySetInnerHTML={{ __html: assignmentSub.feedback }} />
                        ) : (
                          <div style={{ fontSize: "14px", color: "#8F9E93", fontStyle: "italic", background: "#FAFAF7", padding: "20px", borderRadius: "12px", border: "1px solid #F3F4F0" }}>No feedback provided.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
          );
        })()}

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

          const hasPostedDiscussion = forumPosts.some(p => p.authorId === user?.id || p.author?.id === user?.id);
          const myRepliesToOthers = forumPosts.flatMap(p => 
            (p.authorId !== user?.id && p.author?.id !== user?.id) ? 
            (p.replies || []).filter((r: any) => r.authorId === user?.id || r.author?.id === user?.id).map((r: any) => p.authorId || p.author?.id) : []
          );
          const uniqueOtherAuthorsRepliedTo = new Set(myRepliesToOthers);
          const hasReachedReplyLimit = uniqueOtherAuthorsRepliedTo.size >= 2;

          return (
            <div style={{ width: "100%", minHeight: "100%", background: "#FAFAF7", display: "flex", justifyContent: "center", padding: "48px 24px 120px 24px" }}>
              <div style={{ width: "100%", maxWidth: "720px" }}>
                
                {/* ─── Instructor Prompt Card ─── */}
                <div style={{ background: "#FFFFFF", borderRadius: "20px", border: "1px solid #DCE0D5", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: "32px" }}>
                  {/* Gold top accent */}
                  <div style={{ height: "4px", background: "linear-gradient(90deg, #C9973A, #E3B864)" }} />
                  
                  <div style={{ padding: "36px 32px 32px 32px" }}>
                    {/* Instructor info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#1A261D", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9973A", fontWeight: 700, fontSize: "15px", flexShrink: 0 }}>
                        {getInitials(instructor?.name || enrollment?.course?.instructor?.name || "I")}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 700, fontSize: "16px", color: "#1A261D" }}>{instructor?.name || enrollment?.course?.instructor?.name || "Instructor"}</span>
                          <span style={{ background: "#FBF6EC", color: "#C9973A", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 8px", borderRadius: "4px" }}>Instructor</span>
                        </div>
                        <div style={{ fontSize: "13px", color: "#8A9E8C", marginTop: "2px" }}>Discussion Prompt</div>
                      </div>
                    </div>

                    {/* Title */}
                    <h1 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "28px", fontWeight: 700, color: "#1A261D", margin: "0 0 16px 0", lineHeight: 1.3 }}>{lesson.title}</h1>
                    
                    {/* Content */}
                    {lesson.content && (
                      <p style={{ fontSize: "16px", color: "#3A4D3F", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{lesson.content}</p>
                    )}
                  </div>
                </div>

                {/* ─── Your Response Card ─── */}
                <div style={{ background: "#FFFFFF", borderRadius: "20px", border: "1px solid #DCE0D5", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", padding: "32px", marginBottom: "48px" }}>
                  {(() => {
                    let isEffectivelyPastDue = false;
                    let showRequestExtension = false;
                    let showPending = false;
                    let showGranted = false;
                    let effectiveDueDate: Date | null = null;

                    if (lesson.dueDate) {
                      const dueDate = new Date(lesson.dueDate);
                      const isPastDue = new Date() > dueDate;
                      const grantedExtension = extensions.find(e => e.itemId === lesson.id);
                      const pendingRequest = extensionRequests.find(r => r.itemId === lesson.id && r.status === "PENDING");
                      
                      effectiveDueDate = dueDate;
                      if (grantedExtension) effectiveDueDate = new Date(grantedExtension.extendedDate);
                      isEffectivelyPastDue = new Date() > effectiveDueDate;

                      if (isPastDue && !isEffectivelyPastDue) {
                        showGranted = !!grantedExtension;
                      }
                      if (isEffectivelyPastDue) {
                        if (pendingRequest) showPending = true;
                        else showRequestExtension = true;
                      }
                    }

                    if (isEffectivelyPastDue && showRequestExtension) {
                      return (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <XCircle size={20} style={{ color: "#DC2626", flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "15px", color: "#DC2626" }}>Discussion Locked</div>
                              <div style={{ fontSize: "13px", color: "#8A9E8C", marginTop: "4px" }}>This forum is past due. Request an extension to participate.</div>
                            </div>
                          </div>
                          {!isRequestingExtension ? (
                            <button onClick={() => setIsRequestingExtension(true)} style={{ padding: "10px 20px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Request Extension</button>
                          ) : (
                            <div style={{ background: "#FAFAF7", padding: "20px", borderRadius: "12px", border: "1px solid #E4E8E0", marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                              <textarea value={extensionReason} onChange={e => setExtensionReason(e.target.value)} placeholder="Why do you need an extension?" rows={2} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "13px", fontFamily: "inherit", outline: "none", resize: "none" }} />
                              <input type="date" value={extensionRequestedDate} onChange={e => setExtensionRequestedDate(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E4E8E0", fontSize: "13px", fontFamily: "inherit" }} />
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => requestExtensionMut.mutate({ itemId: lesson.id, itemType: "FORUM" })} disabled={!extensionReason || requestExtensionMut.isPending} style={{ padding: "10px 20px", background: "#1A261D", color: "#fff", borderRadius: "8px", fontWeight: 700, fontSize: "13px", border: "none", cursor: "pointer", opacity: (!extensionReason || requestExtensionMut.isPending) ? 0.5 : 1 }}>Submit</button>
                                <button onClick={() => setIsRequestingExtension(false)} style={{ padding: "10px 20px", background: "transparent", color: "#526658", fontWeight: 600, fontSize: "13px", border: "none", cursor: "pointer" }}>Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (showPending) {
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#FEF3C7", padding: "16px 20px", borderRadius: "12px", border: "1px solid #FDE68A" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#D97706", flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "14px", color: "#92400E" }}>Extension Requested</div>
                            <div style={{ fontSize: "13px", color: "#92400E", marginTop: "2px" }}>Pending instructor approval.</div>
                          </div>
                        </div>
                      );
                    }

                    if (hasPostedDiscussion) {
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#F0FAF2", padding: "20px 24px", borderRadius: "14px", border: "1px solid #BBF7D0" }}>
                          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <CheckCircle size={22} style={{ color: "#16A34A" }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "15px", color: "#15803D" }}>Response Submitted</div>
                            <div style={{ fontSize: "13px", color: "#4B5563", marginTop: "4px" }}>You've posted your thoughts. Engage with classmates below!</div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                          <span style={{ fontWeight: 700, fontSize: "16px", color: "#1A261D" }}>Your Response</span>
                          {showGranted && effectiveDueDate && (
                            <span style={{ background: "#F0FAF2", color: "#16A34A", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px" }}>Extended to {effectiveDueDate.toLocaleDateString()}</span>
                          )}
                        </div>
                        <textarea
                          value={newPostContent}
                          onChange={e => setNewPostContent(e.target.value)}
                          placeholder="Write your thoughtful response here..."
                          rows={5}
                          style={{ width: "100%", padding: "16px 20px", borderRadius: "14px", border: "1px solid #DCE0D5", fontSize: "15px", fontFamily: "inherit", outline: "none", resize: "none", background: "#FAFAF7", lineHeight: 1.7, color: "#1A261D", boxSizing: "border-box" }}
                        />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px" }}>
                          <span style={{ fontSize: "12px", color: "#8A9E8C" }}>{newPostContent.length} characters</span>
                          <button
                            disabled={!newPostContent.trim() || isPostingForum}
                            onClick={async () => {
                              if (!newPostContent.trim()) return;
                              setIsPostingForum(true);
                              try {
                                const res = await api.post(`/forums/lessons/${lesson.id}`, { content: newPostContent });
                                setForumPosts(prev => [res.data.data, ...prev]);
                                setNewPostContent("");
                                if (!lesson.isCompleted) await markComplete();
                              } catch (err: any) {
                                console.error(err);
                                toast.error(err.response?.data?.message || "Failed to post");
                              } finally {
                                setIsPostingForum(false);
                              }
                            }}
                            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px", background: "#1A261D", color: "#FFFFFF", borderRadius: "999px", fontWeight: 700, fontSize: "14px", border: "none", cursor: "pointer", opacity: (!newPostContent.trim() || isPostingForum) ? 0.4 : 1, transition: "opacity 0.2s" }}
                          >
                            Post Response <Send size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* ─── Discussion Section ─── */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <span style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "22px", fontWeight: 700, color: "#1A261D" }}>Discussion</span>
                    <span style={{ background: "#1A261D", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, padding: "2px 10px", borderRadius: "999px", minWidth: "24px", textAlign: "center" }}>{forumPosts.length}</span>
                  </div>

                  {loadingForum ? (
                    <div style={{ padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", color: "#8A9E8C" }}>
                      <div style={{ width: "32px", height: "32px", border: "3px solid #E4E8E0", borderTopColor: "#C9973A", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "16px" }} />
                      <span style={{ fontSize: "14px", fontWeight: 500 }}>Loading discussion...</span>
                    </div>
                  ) : forumPosts.length === 0 ? (
                    <div style={{ padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: "#FFFFFF", borderRadius: "20px", border: "2px dashed #DCE0D5" }}>
                      <MessageSquare size={32} style={{ color: "#C9973A", marginBottom: "16px" }} />
                      <div style={{ fontWeight: 700, fontSize: "18px", color: "#1A261D", marginBottom: "8px" }}>No replies yet</div>
                      <div style={{ fontSize: "14px", color: "#8A9E8C", maxWidth: "320px" }}>Be the first to share your thoughts!</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {forumPosts.map((post: any) => (
                        <div key={post.id} style={{ background: "#FFFFFF", borderRadius: "18px", border: "1px solid #DCE0D5", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", overflow: "hidden" }}>
                          <div style={{ padding: "24px 28px" }}>
                            {/* Author Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, #E3B864, #C9973A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
                                  {getInitials(post.author?.name)}
                                </div>
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontWeight: 700, fontSize: "15px", color: "#1A261D" }}>{post.author?.name}</span>
                                    {post.author?.role !== "STUDENT" && (
                                      <span style={{ background: "#FBF6EC", color: "#C9973A", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 6px", borderRadius: "4px" }}>{post.author?.role}</span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#8A9E8C", marginTop: "2px" }}>
                                    {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Edit/Delete */}
                              {(post.authorId === user?.id || post.author?.id === user?.id) && (
                                <div style={{ display: "flex", gap: "4px" }}>
                                  <button onClick={() => { setEditingPostId(post.id); setEditingPostContent(post.content); }} style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "#8A9E8C", borderRadius: "6px" }} title="Edit"><Pencil size={14} /></button>
                                  <button onClick={() => handleDeletePost(post.id)} style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "#8A9E8C", borderRadius: "6px" }} title="Delete"><Trash2 size={14} /></button>
                                </div>
                              )}
                            </div>

                            {/* Post Body */}
                            {editingPostId === post.id ? (
                              <div>
                                <textarea value={editingPostContent} onChange={e => setEditingPostContent(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #DCE0D5", fontSize: "15px", fontFamily: "inherit", outline: "none", minHeight: "80px", resize: "none", boxSizing: "border-box" }} />
                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "10px" }}>
                                  <button onClick={() => setEditingPostId(null)} style={{ padding: "8px 16px", background: "transparent", border: "none", fontWeight: 600, fontSize: "13px", color: "#526658", cursor: "pointer", borderRadius: "8px" }}>Cancel</button>
                                  <button onClick={() => handleEditPost(post.id)} style={{ padding: "8px 16px", background: "#1A261D", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", borderRadius: "8px" }}>Save</button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: "15px", color: "#2C3E30", lineHeight: 1.7, padding: "16px 20px", background: "#FAFAF7", borderRadius: "14px", border: "1px solid #F0F1ED" }}>
                                {post.content}
                              </div>
                            )}
                          </div>

                          {/* Replies Section */}
                          <div style={{ borderTop: "1px solid #F0F1ED", background: "#FAFAF7" }}>
                            {/* Toggle button */}
                            <button
                              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 28px", width: "100%", background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: "#8A9E8C", fontFamily: "inherit", textAlign: "left" }}
                            >
                              <ChevronDown size={14} style={{ transform: expandedPost === post.id ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                              {post.replies?.length || 0} {(post.replies?.length || 0) === 1 ? "Reply" : "Replies"}
                            </button>

                            {expandedPost === post.id && (
                              <div style={{ padding: "0 28px 24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
                                {/* Existing replies */}
                                {post.replies?.map((reply: any) => (
                                  <div key={reply.id} style={{ display: "flex", gap: "12px", padding: "16px", background: "#FFFFFF", borderRadius: "14px", border: "1px solid #E4E8E0" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: reply.isInstructor ? "#1A261D" : "#E4E8E0", color: reply.isInstructor ? "#C9973A" : "#526658", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                                      {getInitials(reply.author?.name)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                                        <span style={{ fontWeight: 700, fontSize: "13px", color: "#1A261D" }}>{reply.author?.name}</span>
                                        {reply.isInstructor && <span style={{ background: "#1A261D", color: "#C9973A", fontSize: "8px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 6px", borderRadius: "4px" }}>Instructor</span>}
                                        <span style={{ fontSize: "11px", color: "#8A9E8C" }}>
                                          {new Date(reply.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                        </span>
                                        {(reply.authorId === user?.id || reply.author?.id === user?.id) && (
                                          <span style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
                                            <button onClick={() => { setEditingReplyId(reply.id); setEditingReplyContent(reply.content); }} style={{ padding: "3px", background: "none", border: "none", cursor: "pointer", color: "#8A9E8C" }}><Pencil size={12} /></button>
                                            <button onClick={() => handleDeleteReply(post.id, reply.id)} style={{ padding: "3px", background: "none", border: "none", cursor: "pointer", color: "#8A9E8C" }}><Trash2 size={12} /></button>
                                          </span>
                                        )}
                                      </div>
                                      
                                      {editingReplyId === reply.id ? (
                                        <div>
                                          <textarea value={editingReplyContent} onChange={e => setEditingReplyContent(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #DCE0D5", fontSize: "13px", fontFamily: "inherit", outline: "none", minHeight: "50px", resize: "none", boxSizing: "border-box" }} />
                                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", marginTop: "8px" }}>
                                            <button onClick={() => setEditingReplyId(null)} style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 600, background: "transparent", border: "none", color: "#526658", cursor: "pointer" }}>Cancel</button>
                                            <button onClick={() => handleEditReply(post.id, reply.id)} style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 700, background: "#1A261D", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Save</button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div style={{ fontSize: "14px", color: "#3A4D3F", lineHeight: 1.6 }}>{reply.content}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {/* Reply Input */}
                                {hasReachedReplyLimit && post.authorId !== user?.id && post.author?.id !== user?.id && !uniqueOtherAuthorsRepliedTo.has(post.authorId || post.author?.id) ? (
                                  <div style={{ fontSize: "13px", color: "#DC2626", fontWeight: 600, background: "#FEF2F2", padding: "14px 18px", borderRadius: "12px", border: "1px solid #FECACA", textAlign: "center" }}>
                                    You have reached the maximum reply limit (2 students).
                                  </div>
                                ) : (
                                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#FFFFFF", border: "1px solid #DCE0D5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", color: "#526658", flexShrink: 0 }}>ME</div>
                                    <div style={{ flex: 1, background: "#FFFFFF", border: "1px solid #DCE0D5", borderRadius: "14px", overflow: "hidden" }}>
                                      <textarea
                                        value={replyContent[post.id] || ""}
                                        onChange={e => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                                        placeholder="Write a reply..."
                                        rows={2}
                                        style={{ width: "100%", padding: "12px 16px", border: "none", fontSize: "14px", fontFamily: "inherit", outline: "none", resize: "none", background: "transparent", boxSizing: "border-box" }}
                                      />
                                      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 12px 10px 12px" }}>
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
                                          style={{ padding: "6px 18px", background: "#1A261D", color: "#FFFFFF", borderRadius: "999px", fontWeight: 700, fontSize: "12px", border: "none", cursor: "pointer", opacity: (!replyContent[post.id]?.trim() || isReplying[post.id]) ? 0.35 : 1, transition: "opacity 0.2s" }}
                                        >
                                          Reply
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
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
      <div className="h-20 shrink-0 bg-[#FFFFFF] border-t border-[#E4E8E0] flex items-center justify-between z-30 sticky bottom-0 w-full transition-all duration-300 mt-auto" style={{ paddingLeft: "32px", paddingRight: "32px" }}>
        <button
          disabled={!previousLesson}
          onClick={() => previousLesson && goToLesson(previousLesson.id)}
          className="bg-[#F7E3B7] text-[#4A3F1F] border border-[#E0C17A] hover:bg-[#F2D685] flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm shadow-[#D8B657]/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          style={{ padding: "12px 24px", borderRadius: "999px" }}
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Previous Lesson</span>
        </button>
        
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <div className="text-xs text-[#8A9E8C] font-bold tracking-widest uppercase">
            Module · Lesson
          </div>
          {lesson?.type === "VIDEO" && !lesson.isCompleted && (
            <div className="flex flex-col items-center gap-1.5 mt-1">
              <button
                onClick={markComplete}
                className="bg-gradient-to-r from-[#C9973A] to-[#B88645] text-white rounded-full font-bold text-[13px] hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-1.5 shadow-sm border border-[#E3B864]/40"
                style={{ padding: "6px 16px" }}
              >
                <CheckCircle size={15} /> Mark as Complete
              </button>
            </div>
          )}
        </div>
        <button 
          onClick={handleNext}
          disabled={isNavigating}
          title={nextLesson ? "Continue to next lesson" : (enrollment?.completedAt || enrollment?.status === "COMPLETED" ? "Return to Dashboard" : "You have reached the end of the course")}
          className={`${nextButtonClasses} disabled:opacity-70 disabled:cursor-wait`}
          style={{ padding: "12px 24px", borderRadius: "999px" }}
        >
          {isNavigating ? "Loading..." : nextLesson ? "Next Lesson" : (enrollment?.completedAt || enrollment?.status === "COMPLETED" ? "Exit Course" : "End of Course")} 
          {!isNavigating && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

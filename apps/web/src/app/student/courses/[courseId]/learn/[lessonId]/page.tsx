"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/store/auth.store";
import ReactPlayer from "react-player";
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
        }
      } catch (err) {
        console.error("Failed to load lesson", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [courseId, lessonId]);

  if (loading || !lesson) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#C9973A] border-t-transparent rounded-full" />
      </div>
    );
  }

  const markComplete = async () => {
    try {
      await api.post(`/student/enrollments/${enrollment.id}/lessons/${lessonId}/complete`);
      // Update local state or trigger refresh
      setLesson((prev: any) => ({ ...prev, isCompleted: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleVideoProgress = async (state: any) => {
    if (!lesson.isCompleted && state.playedSeconds > 0 && state.playedSeconds % 10 < 1) {
      try {
        await api.post(`/student/enrollments/${enrollment.id}/lessons/${lessonId}/progress`, {
          watchedSeconds: Math.floor(state.playedSeconds)
        });
      } catch (err) {}
    }
    // Auto complete at 80%
    if (state.played >= 0.8 && !lesson.isCompleted) {
      markComplete();
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

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* VIDEO LESSON */}
        {lesson.type === "VIDEO" && (
          <div className="w-full bg-black flex items-center justify-center relative" style={{ height: 'calc(100vh - 64px)' }}>
            <div className="w-full h-full relative max-w-7xl mx-auto flex items-center justify-center [&_iframe]:!w-full [&_iframe]:!h-full [&_video]:!w-full [&_video]:!h-full [&_video]:!object-contain">
              {lesson.videoUrl ? (
                hasMounted && (
                  lesson.videoUrl.includes('youtu') ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${
                        lesson.videoUrl.includes('youtu.be/') 
                          ? lesson.videoUrl.split('youtu.be/')[1].split('?')[0] 
                          : lesson.videoUrl.split('v=')[1]?.split('&')[0]
                      }?rel=0`}
                      title={lesson.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center [&>div]:!w-full [&>div]:!h-full">
                      <ReactPlayer 
                        url={lesson.videoUrl.trim()} 
                        width="100%" 
                        height="100%" 
                        controls 
                        onProgress={handleVideoProgress}
                        onEnded={markComplete}
                      />
                    </div>
                  )
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
          <div className="max-w-3xl w-full mx-auto p-6 md:py-12">
            
            {quizState === "not_started" && (
              <div className="bg-[#FFFFFF] border border-[#E4E8E0] rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9973A] to-transparent opacity-50" />
                <HelpCircle className="w-16 h-16 text-[#C9973A] mx-auto mb-6" />
                <h1 className="font-serif text-3xl md:text-4xl text-[#1A261D] font-bold mb-4">{lesson.title}</h1>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-[#8A9E8C] mb-8">
                  <span className="bg-[#FAFAF7] px-3 py-1 rounded-full border border-[#E4E8E0]">
                    {lesson.quiz?.passingScore}% to pass
                  </span>
                  <span className="bg-[#FAFAF7] px-3 py-1 rounded-full border border-[#E4E8E0]">
                    {lesson.quiz?.timeLimit ? `${lesson.quiz.timeLimit / 60} minutes` : "No time limit"}
                  </span>
                  <span className="bg-[#FAFAF7] px-3 py-1 rounded-full border border-[#E4E8E0]">
                    {lesson.quiz?.maxAttempts > 0 ? `${lesson.quiz.maxAttempts} attempts allowed` : "Unlimited attempts"}
                  </span>
                </div>

                {lesson.attempts && lesson.attempts.length > 0 && (
                  <div className="mb-8 text-left bg-[#FAFAF7] rounded-xl p-4 border border-[#E4E8E0]">
                    <h3 className="text-sm font-semibold text-[#1A261D] mb-3 uppercase tracking-wider">Previous Attempts</h3>
                    <div className="space-y-2">
                      {lesson.attempts.map((att: any, i: number) => (
                        <div key={att.id} className="flex justify-between items-center text-sm p-2 rounded bg-[#F7F8F5]">
                          <span className="text-[#8A9E8C]">Attempt {lesson.attempts.length - i}</span>
                          <span className={`font-bold ${att.passed ? 'text-[#4A8C5C]' : 'text-[#8C3A3A]'}`}>
                            {att.score.toFixed(1)}% — {att.passed ? "Pass" : "Fail"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  onClick={startQuiz}
                  className="px-8 py-4 bg-[#C9973A] text-[#1A261D] rounded-full font-bold uppercase tracking-wider hover:bg-[#A8792A] transition-colors"
                >
                  Start Quiz
                </button>
              </div>
            )}

            {quizState === "in_progress" && quizData && quizData.quiz && quizData.quiz.questions && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-sm text-[#8A9E8C]">
                    Question <span className="text-[#1A261D] font-bold">{currentQuestionIdx + 1}</span> of {quizData.quiz.questions.length}
                  </div>
                  <div className="w-1/2 h-1.5 bg-[#FFFFFF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C9973A] transition-all" style={{ width: `${((currentQuestionIdx + 1) / quizData.quiz.questions.length) * 100}%` }} />
                  </div>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E4E8E0] rounded-2xl p-6 md:p-10 shadow-xl">
                  {(() => {
                    const q = quizData.quiz.questions[currentQuestionIdx];
                    if (!q) return null;
                    return (
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="font-serif italic text-[#C9973A] text-lg">Q{currentQuestionIdx + 1}</div>
                          <div className="text-xs bg-[#FAFAF7] text-[#8A9E8C] px-2 py-1 rounded border border-[#E4E8E0]">
                            {q.points} pt{q.points > 1 ? 's' : ''}
                          </div>
                        </div>
                        {q.scriptureRef && (
                          <div className="font-serif italic text-[#A8792A] mb-2">{q.scriptureRef}</div>
                        )}
                        <h2 className="text-xl md:text-2xl text-[#1A261D] leading-relaxed mb-8">{q.text}</h2>

                        {(q.type === "MCQ" || q.type === "TRUE_FALSE") && (
                          <div className="space-y-3">
                            {q.answers.map((ans: any) => {
                              const isSelected = quizAnswers[q.id] === ans.id;
                              return (
                                <button
                                  key={ans.id}
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: ans.id })}
                                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4
                                    ${isSelected ? 'bg-[rgba(201,151,58,0.1)] border-[#C9973A]' : 'bg-[#F7F8F5] border-[#E4E8E0] hover:border-[rgba(201,151,58,0.4)] hover:bg-[rgba(201,151,58,0.05)]'}
                                  `}
                                >
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#C9973A] bg-[#C9973A]' : 'border-[rgba(201,151,58,0.4)]'}`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#FAFAF7]" />}
                                  </div>
                                  <span className={`text-[15px] ${isSelected ? 'text-[#C9973A] font-semibold' : 'text-[#1A261D]'}`}>{ans.text}</span>
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
                              rows={5}
                              className="w-full bg-[#FAFAF7] border border-[rgba(201,151,58,0.3)] rounded-xl p-4 text-[#1A261D] placeholder-[#8A9E8C] focus:outline-none focus:border-[#C9973A] transition-colors"
                              placeholder="Type your answer here..."
                            />
                            <div className="text-xs text-[#8A9E8C] mt-2 italic">Your instructor will grade this response manually.</div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="mt-10 pt-6 border-t border-[#E4E8E0] flex justify-between">
                    <button
                      onClick={() => setCurrentQuestionIdx(i => Math.max(0, i - 1))}
                      disabled={currentQuestionIdx === 0}
                      className="px-4 py-2 text-[#8A9E8C] hover:text-[#1A261D] disabled:opacity-30 transition-colors flex items-center gap-1 text-sm font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" /> Previous
                    </button>
                    
                    {currentQuestionIdx === quizData.quiz.questions.length - 1 ? (
                      <button
                        onClick={submitQuiz}
                        className="px-6 py-2 bg-[#C9973A] text-[#1A261D] rounded-lg font-bold hover:bg-[#A8792A] transition-colors"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestionIdx(i => Math.min(quizData.quiz.questions.length - 1, i + 1))}
                        className="px-6 py-2 bg-[#C9973A] text-[#1A261D] rounded-lg font-bold hover:bg-[#A8792A] transition-colors flex items-center gap-1"
                      >
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {quizState === "results" && quizResult && (
              <div className="space-y-8">
                <div className="bg-[#FFFFFF] border border-[#E4E8E0] rounded-2xl p-10 text-center shadow-xl">
                  {quizResult.passed ? (
                    <CheckCircle className="w-16 h-16 text-[#4A8C5C] mx-auto mb-4" />
                  ) : (
                    <XCircle className="w-16 h-16 text-[#8C3A3A] mx-auto mb-4" />
                  )}
                  <h1 className={`font-serif text-4xl mb-6 font-bold ${quizResult.passed ? 'text-[#4A8C5C]' : 'text-[#8C3A3A]'}`}>
                    {quizResult.passed ? "Passed!" : "Not quite yet"}
                  </h1>

                  <div className="w-40 h-40 mx-auto rounded-full border-8 flex items-center justify-center relative mb-6" style={{ borderColor: quizResult.passed ? '#4A8C5C' : '#8C3A3A' }}>
                    <div className="text-center">
                      <div className="font-serif text-4xl text-[#1A261D] font-bold">{quizResult.score.toFixed(0)}%</div>
                    </div>
                  </div>

                  <p className="text-[#8A9E8C] mb-6">
                    You needed {quizResult.passingScore}% to pass. 
                    <br/>
                    Points earned: <span className="text-[#1A261D] font-semibold">{quizResult.earnedPoints}</span> out of <span className="text-[#1A261D] font-semibold">{quizResult.totalPoints}</span>
                  </p>

                  <div className="flex justify-center gap-4">
                    {quizResult.passed ? (
                      <button className="px-6 py-3 bg-[#4A8C5C] text-white rounded-lg font-bold">
                        Continue to Next Lesson &rarr;
                      </button>
                    ) : quizResult.canRetake ? (
                      <button 
                        onClick={startQuiz}
                        className="px-6 py-3 border border-[#C9973A] text-[#C9973A] rounded-lg font-bold hover:bg-[#C9973A] hover:text-[#1A261D] transition-colors"
                      >
                        Retake Quiz ({quizResult.attemptsLeft} left)
                      </button>
                    ) : (
                      <span className="text-[#8A9E8C]">No attempts remaining. Please contact your instructor.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-serif text-2xl text-[#1A261D] mb-4">Review Answers</h3>
                  {quizResult.results.map((r: any, i: number) => (
                    <div key={i} className="bg-[#FFFFFF] border border-[#E4E8E0] rounded-xl p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-sm font-semibold text-[#8A9E8C]">Question {i + 1}</div>
                        <div className="text-xs bg-[#FAFAF7] px-2 py-1 rounded text-[#8A9E8C] border border-[#E4E8E0]">
                          {r.pointsEarned} / {r.points} pts
                        </div>
                      </div>
                      <div className="text-[#1A261D] text-lg mb-4">{r.questionText}</div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="p-3 rounded-lg bg-[#F7F8F5] border border-[#E4E8E0]">
                          <span className="text-[#8A9E8C] block mb-1">Your Answer:</span>
                          <div className="flex items-center gap-2">
                            {r.isCorrect ? <CheckCircle className="w-4 h-4 text-[#4A8C5C]" /> : <XCircle className="w-4 h-4 text-[#8C3A3A]" />}
                            <span className={r.isCorrect ? 'text-[#4A8C5C] font-medium' : 'text-[#8C3A3A] line-through opacity-80'}>{r.yourAnswer || "No answer"}</span>
                          </div>
                        </div>
                        
                        {!r.isCorrect && r.correctAnswer && (
                          <div className="p-3 rounded-lg bg-[rgba(74,140,92,0.1)] border border-[rgba(74,140,92,0.2)]">
                            <span className="text-[#8A9E8C] block mb-1">Correct Answer:</span>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-[#4A8C5C]" />
                              <span className="text-[#4A8C5C] font-medium">{r.correctAnswer}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
      <div className="h-16 shrink-0 bg-[#FFFFFF] border-t border-[#E4E8E0] flex items-center justify-between px-4 md:px-8 z-30">
        <button className="text-[#8A9E8C] hover:text-[#C9973A] flex items-center gap-2 text-sm font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Previous Lesson</span>
        </button>
        <div className="text-xs text-[#8A9E8C] font-medium tracking-wide">
          Module · Lesson
        </div>
        <button className="px-4 py-2 bg-transparent border border-[#C9973A] text-[#C9973A] hover:bg-[#C9973A] hover:text-[#1A261D] rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
          Next Lesson <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/store/auth.store";

export default function LearnIndexPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const enrRes = await api.get(`/student/courses/${courseId}/learn`);
        const enr = enrRes.data.data;
        
        // Find first lesson
        let firstLessonId = null;
        if (enr.course.sections && enr.course.sections.length > 0) {
          const firstSection = enr.course.sections[0];
          if (firstSection.lessons && firstSection.lessons.length > 0) {
            firstLessonId = firstSection.lessons[0].id;
          }
        }

        if (firstLessonId) {
          router.replace(`/student/courses/${courseId}/learn/${firstLessonId}`);
        }
      } catch (err) {
        console.error("Failed to fetch course data for redirect", err);
      }
    };
    fetchAndRedirect();
  }, [courseId, router]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#1C2B1E]">
      <div className="animate-spin h-8 w-8 border-4 border-[#C9973A] border-t-transparent rounded-full" />
    </div>
  );
}

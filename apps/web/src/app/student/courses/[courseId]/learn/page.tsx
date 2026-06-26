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
        const sections = enr.course?.sections || [];

        if (sections.length === 0) return;

        // Build a flat ordered list of all lessons with their section info
        const allItems: { lessonId: string; sectionId: string; sectionIndex: number; lessonIndex: number; isCompleted: boolean }[] = [];
        sections.forEach((section: any, sIdx: number) => {
          (section.lessons || []).forEach((lesson: any, lIdx: number) => {
            allItems.push({
              lessonId: lesson.id,
              sectionId: section.id,
              sectionIndex: sIdx,
              lessonIndex: lIdx,
              isCompleted: !!lesson.isCompleted,
            });
          });
        });

        // Check if any lesson has been completed
        const hasAnyProgress = allItems.some(item => item.isCompleted);

        if (!hasAnyProgress) {
          // First-time student — go to Week 1 description page
          router.replace(`/student/courses/${courseId}/learn/week/${sections[0].id}`);
          return;
        }

        // Returning student — find where they left off
        // Find the last completed lesson index
        let lastCompletedIndex = -1;
        for (let i = allItems.length - 1; i >= 0; i--) {
          if (allItems[i].isCompleted) {
            lastCompletedIndex = i;
            break;
          }
        }

        // The next item after the last completed one
        const nextIndex = lastCompletedIndex + 1;

        if (nextIndex >= allItems.length) {
          // All lessons completed — go to the last lesson
          const lastItem = allItems[allItems.length - 1];
          router.replace(`/student/courses/${courseId}/learn/${lastItem.lessonId}`);
          return;
        }

        const nextItem = allItems[nextIndex];

        // If the next item is the first lesson of a new section (week),
        // open that section's week description page
        if (nextItem.lessonIndex === 0) {
          router.replace(`/student/courses/${courseId}/learn/week/${nextItem.sectionId}`);
        } else {
          // Otherwise, go directly to the next lesson
          router.replace(`/student/courses/${courseId}/learn/${nextItem.lessonId}`);
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

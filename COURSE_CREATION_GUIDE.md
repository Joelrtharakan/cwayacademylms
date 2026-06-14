# CWAY Academy - Course Creation Design & Layout Guide

This document defines the strict theme, layout, and user experience (UX) guidelines for the **Instructor Course Creation Workflow**. It ensures that the process of building a course, adding modules, and attaching lessons feels premium, intuitive, and perfectly aligned with the CWAY design system.

---

## 🎨 1. Theme & Color Application

The course builder must feel like a professional, distraction-free environment. Use the official CWAY color tokens:

- **Background (`bg-[#F5F0E8]`):** The entire dashboard background should be Cream. Do not use pure white for the page background.
- **Card/Container Background (`bg-white`):** Individual sections (e.g., Module cards, Lesson items) should sit on pure white cards with a subtle shadow (`shadow-sm` or `shadow-md`) to lift them off the cream background.
- **Primary Interactive Elements (`bg-[#C9973A]`):** The main "Publish Course", "Save Draft", and "Add Module" buttons should use the Gold accent. Hover states should transition smoothly to Gold Light (`hover:bg-[#E8B85A]`).
- **Typography (`text-[#1C2B1E]` & `text-[#243825]`):** All headers (Course Title, Module Names) should use Dark Green. Body text should use Forest.
- **Muted Elements (`text-[#8A9E8C]`):** Helper text, drag-and-drop hints, and secondary meta-data (like "0 Lessons") should use the Muted Text color.

---

## 📐 2. Page Layout & Structure

The Course Creation page (`/instructor/courses/[courseId]`) should be divided into a **Two-Column Layout** on desktop, shifting to a single column on mobile.

### Left Column: The Curriculum Builder (65% width)
This is the main workspace where instructors construct the skeleton of their course.
- **Course Header:** A clean input field for the Course Title and Description.
- **Module List:** A vertically stacked list of modules.
- **Drag & Drop:** Modules and Lessons should ideally be re-orderable via a drag-and-drop interface.

### Right Column: Course Settings & Metadata (35% width)
This is a sticky sidebar (using `sticky top-6`) that houses global course configurations.
- **Course Thumbnail:** A designated drag-and-drop zone with a dashed border (`border-dashed border-2 border-[#C9973A]`) for uploading the course image.
- **Price & Requirements:** Inputs for pricing (if applicable) and text areas for course prerequisites.
- **Publish Action:** A massive, full-width sticky button at the bottom of the sidebar to "Publish Course".

---

## 🧩 3. Component Design Breakdown

### A. The Module Card
Each Module should be a distinct card within the Left Column.
- **Visuals:** A white card with rounded corners (`rounded-xl`), bordered slightly (`border border-gray-100`).
- **Header:** Contains the Module Title and a right-aligned "Add Lesson" button (styled as a ghost button `text-[#C9973A] hover:bg-[#F5F0E8]`).
- **Body:** An indented, vertical list of lessons belonging to that module.

### B. The Lesson Item
Lessons sit inside the Module Card.
- **Visuals:** A sleek, horizontal row (`flex flex-row items-center justify-between`) with a very light background on hover (`hover:bg-gray-50`).
- **Icons:** Each lesson must have an icon representing its type to the left of the title:
  - 🎥 Video (Play icon)
  - 📄 Reading Material (Document icon)
  - 🧠 Quiz (Check-circle icon)
  - 💬 Forum (Message icon)
- **Actions:** An ellipsis (`...`) menu on the far right for editing or deleting the lesson.

### C. Modals for Adding Content
When an instructor clicks "Add Lesson", a **Slide-over Panel** (right side of the screen) or a **Centered Modal** should appear.
- **Backdrop:** A dark, blurred overlay (`bg-[#1C2B1E]/60 backdrop-blur-sm`).
- **Content:** 
  - A clean form to input the Lesson Title.
  - A beautiful, icon-based selector grid to choose the `Lesson Type` (Video, Reading, Quiz).
  - A robust Rich-Text Editor (for Reading Materials) or a File Uploader (for Video/PDFs).

---

## 🛠️ 4. Form Controls & Inputs

To maintain the premium academic feel, standard HTML inputs should be customized:

- **Text Inputs:** 
  - `bg-white border border-gray-200 rounded-lg p-3 outline-none focus:border-[#C9973A] focus:ring-1 focus:ring-[#C9973A] transition-all`
- **Rich Text Editor:**
  - The toolbar should be minimalist. Avoid overly cluttered Word-style interfaces. Use a clean, Notion-like editor if possible (e.g., TipTap or Quill).
- **File Upload Zones:**
  - Must clearly display accepted file types (e.g., `.mp4`, `.pdf`).
  - Should show a progress bar when uploading directly to Cloudflare R2 to provide immediate user feedback.

---

## ✨ 5. Empty States & Feedback

A critical part of luxury UX is how the app behaves when there is no data.

- **Empty Curriculum:** If a course has no modules yet, display a beautifully illustrated Empty State in the center of the Left Column.
  - *Title:* "Build your curriculum"
  - *Subtitle:* "Start by creating your first module to organize your lessons."
  - *Action:* A prominent "Create Module" button.
- **Loading States:** Use skeleton loaders (`animate-pulse bg-gray-200 rounded`) instead of traditional spinning wheels when fetching the course data.
- **Success Toasts:** When a lesson is saved or a module is added, trigger a brief, bottom-right toast notification (`bg-[#4A8C5C] text-white`).

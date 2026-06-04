import React from "react";

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-cway-gold/15 pb-4">
        <h1 className="font-serif text-3xl font-semibold text-white">Instructor Dashboard</h1>
        <p className="font-sans text-sm text-cway-text-muted mt-1">
          Manage courses, review curriculum steps, and track student grading.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-dark">
          <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-cway-gold">My Students</h3>
          <p className="font-serif text-3xl font-bold mt-2">10 Enrolled</p>
        </div>
        <div className="card-dark">
          <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-cway-gold">Course status</h3>
          <p className="font-serif text-xl font-medium mt-2">9 Published Modules</p>
        </div>
      </div>
    </div>
  );
}

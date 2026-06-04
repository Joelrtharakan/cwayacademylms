import React from "react";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-cway-dark-green/10 pb-4">
        <h1 className="font-serif text-3xl font-semibold text-cway-dark-green">Student Classroom</h1>
        <p className="font-sans text-sm text-cway-dark-green/60 mt-1">
          Continue learning, complete assignments, and track earned certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-light border border-cway-border-light">
          <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-cway-gold-muted">My Progress</h3>
          <p className="font-serif text-2xl font-bold mt-2 text-cway-dark-green">Welcome back to CWAY classroom!</p>
        </div>
        <div className="card-light border border-cway-border-light">
          <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-cway-gold-muted">Scripture of the Day</h3>
          <div className="scripture-quote text-cway-gold-muted mt-2">
            "Commit your work to the Lord, and your plans will be established."
            <span className="block text-[10px] uppercase font-sans tracking-widest text-cway-dark-green/60 mt-1 not-italic">
              — Proverbs 16:3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

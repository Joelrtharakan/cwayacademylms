import React from "react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-cway-gold/15 pb-4">
        <h1 className="font-serif text-3xl font-semibold text-white">Admin Dashboard</h1>
        <p className="font-sans text-sm text-cway-text-muted mt-1">
          System health, stats overview, and administrative actions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-dark">
          <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-cway-gold">Total Students</h3>
          <p className="font-serif text-3xl font-bold mt-2">10</p>
        </div>
        <div className="card-dark">
          <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-cway-gold">Active Courses</h3>
          <p className="font-serif text-3xl font-bold mt-2">9</p>
        </div>
        <div className="card-dark">
          <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-cway-gold">Sponsorships</h3>
          <p className="font-serif text-3xl font-bold mt-2">2</p>
        </div>
      </div>
    </div>
  );
}

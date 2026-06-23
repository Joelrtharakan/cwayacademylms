export function getLetterGrade(percentage: number): string {
  // A+ 100% to 98%
  if (percentage >= 98) return "A+";
  // A < 98% to 92%
  if (percentage >= 92) return "A";
  // A- < 92% to 90%
  if (percentage >= 90) return "A-";
  // B+ < 90% to 88%
  if (percentage >= 88) return "B+";
  // B < 88% to 82%
  if (percentage >= 82) return "B";
  // B- < 82% to 80%
  if (percentage >= 80) return "B-";
  // C+ < 80% to 78%
  if (percentage >= 78) return "C+";
  // C < 78% to 72%
  if (percentage >= 72) return "C";
  // C- < 72% to 70%
  if (percentage >= 70) return "C-";
  // D+ < 70% to 68%
  if (percentage >= 68) return "D+";
  // D < 68% to 62%
  if (percentage >= 62) return "D";
  // D- < 62% to 60%
  if (percentage >= 60) return "D-";
  // F < 60% to 0%
  return "F";
}

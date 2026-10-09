/** Converts a "YYYY-MM-DD" string from <input type="date"> into a local Date. */
export function parseDateInput(value: string): Date | undefined {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;

  return new Date(year, month - 1, day);
}

/** Converts a Date into a local "YYYY-MM-DD" string for <input type="date">. */
export function formatDateInput(date?: Date): string {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

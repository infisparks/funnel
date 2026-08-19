/**
 * Date and Time slot utility functions for Meeting bookings and Funnel popups.
 */

export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseSlotTimeToDate(slotTimeStr: string, baseDate: Date = new Date()): Date | null {
  if (!slotTimeStr) return null;
  const timeMatch = slotTimeStr.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!timeMatch) return null;

  let hours = parseInt(timeMatch[1], 10);
  const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
  const meridian = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;

  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Checks if a given time slot is disabled.
 * A time slot is disabled if:
 * 1. The selected date is before today (in the past).
 * 2. The selected date is today AND the slot time has already passed OR is within the upcoming 1-hour buffer (60 minutes).
 */
export function isTimeSlotDisabled(
  slotTimeStr: string,
  selectedIsoDate: string,
  bufferMinutes: number = 60
): boolean {
  if (!selectedIsoDate || !slotTimeStr) return false;

  const now = new Date();
  const todayIso = getTodayIso();
  const cleanSelectedDate = selectedIsoDate.includes('T')
    ? selectedIsoDate.split('T')[0]
    : selectedIsoDate.trim();

  // If selected date is in the past (before today)
  if (cleanSelectedDate < todayIso) {
    return true;
  }

  // If selected date is strictly in the future (after today), slots are open
  if (cleanSelectedDate > todayIso) {
    return false;
  }

  // Selected date is TODAY:
  // Disable if slot time has passed OR is within the upcoming 1-hour notice period
  const slotDate = parseSlotTimeToDate(slotTimeStr, now);
  if (!slotDate) return false;

  const cutoffTime = new Date(now.getTime() + bufferMinutes * 60 * 1000);
  return slotDate.getTime() <= cutoffTime.getTime();
}

/**
 * Returns the first available (non-disabled) time slot for a date, or null if none available.
 */
export function getFirstAvailableSlot(
  availableSlots: string[],
  selectedIsoDate: string,
  bufferMinutes: number = 60
): string | null {
  if (!availableSlots || availableSlots.length === 0) return null;
  for (const slot of availableSlots) {
    if (!isTimeSlotDisabled(slot, selectedIsoDate, bufferMinutes)) {
      return slot;
    }
  }
  return null;
}

/**
 * Generates the upcoming N days starting from today for the carousel picker.
 */
export function getUpcomingDates(daysCount: number = 7) {
  const dates = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const today = new Date();
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const isoDate = `${year}-${monthStr}-${dayStr}`;

    dates.push({
      isoDate,
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : daysOfWeek[d.getDay()],
      dayNum: d.getDate(),
      monthName: months[d.getMonth()],
    });
  }
  return dates;
}

/**
 * Checks if an existing meeting date & time has already passed.
 */
export function isMeetingPassed(meetingDate?: string, meetingTime?: string): boolean {
  if (!meetingDate) return false;
  try {
    const cleanDate = meetingDate.includes('T') ? meetingDate.split('T')[0] : meetingDate.trim();
    if (!meetingTime) {
      const endOfDay = new Date(`${cleanDate}T23:59:59`);
      return !isNaN(endOfDay.getTime()) && endOfDay.getTime() < Date.now();
    }

    const timeMatch = meetingTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!timeMatch) {
      const parsedDate = new Date(`${cleanDate}T23:59:59`);
      return !isNaN(parsedDate.getTime()) && parsedDate.getTime() < Date.now();
    }

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const meridian = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    const hourStr = String(hours).padStart(2, '0');
    const minStr = String(minutes).padStart(2, '0');
    const meetingDateTime = new Date(`${cleanDate}T${hourStr}:${minStr}:00`);

    if (isNaN(meetingDateTime.getTime())) {
      const fallbackDate = new Date(`${cleanDate}T23:59:59`);
      return !isNaN(fallbackDate.getTime()) && fallbackDate.getTime() < Date.now();
    }

    return meetingDateTime.getTime() < Date.now();
  } catch (err) {
    return false;
  }
}

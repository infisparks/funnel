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

/**
 * Formats entry date and time nicely.
 * e.g. "30 Aug 2026", "01:13 PM"
 */
export function formatEntryDateTime(dateStr?: string | null): { date: string; time: string; full: string } {
  if (!dateStr) {
    return { date: 'N/A', time: '', full: 'N/A' };
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return { date: dateStr, time: '', full: dateStr };
  }

  const dateFormatted = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const timeFormatted = d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return {
    date: dateFormatted,
    time: timeFormatted,
    full: `${dateFormatted}, ${timeFormatted}`,
  };
}

/**
 * Checks if a given timestamp falls within the selected date range preset or custom range.
 */
export function isDateInRange(
  dateString: string | null | undefined,
  rangeType: string,
  customStart?: string,
  customEnd?: string
): boolean {
  if (!dateString) return false;
  if (!rangeType || rangeType === 'all' || rangeType === 'All Time') return true;

  const itemDate = new Date(dateString);
  if (isNaN(itemDate.getTime())) return true;

  const now = new Date();

  if (rangeType === 'today' || rangeType === 'Today') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return itemDate >= startOfToday && itemDate <= endOfToday;
  }

  if (rangeType === 'yesterday' || rangeType === 'Yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
    return itemDate >= startOfYesterday && itemDate <= endOfYesterday;
  }

  if (rangeType === 'last_7_days' || rangeType === 'Last 7 Days' || rangeType === 'Last 7 Days (Default)') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    return itemDate >= sevenDaysAgo;
  }

  if (rangeType === 'last_30_days' || rangeType === 'Last 30 Days') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    return itemDate >= thirtyDaysAgo;
  }

  if (rangeType === 'this_month' || rangeType === 'This Month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return itemDate >= startOfMonth && itemDate <= endOfMonth;
  }

  if (rangeType === 'custom' || rangeType === 'Custom Range') {
    if (!customStart && !customEnd) return true;
    if (customStart && customEnd) {
      const [sY, sM, sD] = customStart.split('-').map(Number);
      const [eY, eM, eD] = customEnd.split('-').map(Number);
      const start = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
      const end = new Date(eY, eM - 1, eD, 23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    }
    if (customStart) {
      const [sY, sM, sD] = customStart.split('-').map(Number);
      const start = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
      return itemDate >= start;
    }
    if (customEnd) {
      const [eY, eM, eD] = customEnd.split('-').map(Number);
      const end = new Date(eY, eM - 1, eD, 23, 59, 59, 999);
      return itemDate <= end;
    }
  }

  return true;
}


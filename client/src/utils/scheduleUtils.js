/**
 * scheduleUtils.js
 * Only keeps time-slot definitions and the live faculty-status helper.
 * All class/timetable data now comes from the real DB.
 */

export const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
];

export const timeSlotLabels = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];

/** Returns 0-7 index of the current hour in the time-slot list, or -1 if outside hours */
export const getCurrentTimeSlotIndex = () => {
    const h = new Date().getHours();
    if (h < 9 || h > 16) return -1;
    return h - 9;
};

/**
 * Checks if a faculty member is currently teaching based on real timetable data.
 * @param {Array} timetable  - array of timetable docs from DB
 * @param {string} facultyId - faculty._id string
 */
export const getFacultyStatusFromTimetable = (timetable, facultyId) => {
    const slotIdx = getCurrentTimeSlotIndex();
    if (slotIdx === -1) return 'Free';

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    const isBusy = timetable.some(
        slot =>
            slot.faculty?._id?.toString() === facultyId &&
            slot.day === today &&
            slot.startTime === timeSlots[slotIdx]
    );
    return isBusy ? 'Busy' : 'Free';
};

// Keep old getFacultyStatus as a no-op fallback so other imports don't break
export const getFacultyStatus = () => 'Free';

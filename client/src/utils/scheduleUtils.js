
export const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

export const classes = [
    { id: 'CS-1A', name: 'CSE - Sem 1 (Sec A)', dept: 'Computer Science' },
    { id: 'CS-3B', name: 'CSE - Sem 3 (Sec B)', dept: 'Computer Science' },
    { id: 'ME-2A', name: 'Mech - Sem 2 (Sec A)', dept: 'Mechanical' },
    { id: 'EE-4A', name: 'Electrical - Sem 4 (Sec A)', dept: 'Electrical' },
    { id: 'CV-1A', name: 'Civil - Sem 1 (Sec A)', dept: 'Civil' },
];

export const getInitialScheduleItem = (classId, timeIdx) => {
    const seed = classId.charCodeAt(0) + classId.charCodeAt(3) + timeIdx;
    // Simple deterministic random-ish generation
    if (seed % 3 === 0) return null;

    const subjects = ['Data Structures', 'Thermodynamics', 'Circuits', 'Mechanics', 'Algorithms', 'Calculus', 'Ethics'];
    const rooms = ['LH-101', 'LH-203', 'Lab-A', 'Workshop-1', 'LH-305'];
    const types = ['Lecture', 'Lecture', 'Lab', 'Lecture', 'Tutorial'];
    // Assign faculty deterministically
    const facultyPool = ['Dr. John Doe', 'Prof. Jane Smith', 'Mr. Michael Johnson', 'Dr. Sarah Wilson', 'Dr. Emily Brown'];
    const faculty = facultyPool[seed % facultyPool.length];

    return {
        subject: subjects[seed % subjects.length],
        room: rooms[seed % rooms.length],
        type: types[seed % types.length],
        faculty: faculty
    };
};

export const getCurrentTimeSlotIndex = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // Convert 24h to the timeSlots index
    // 09:00 AM -> 9
    // ...
    // 04:00 PM -> 16

    // Our slots start at 9 and end at 16 (4 PM)
    if (currentHour < 9 || currentHour > 16) return -1;

    return currentHour - 9;
};

export const getFacultyStatus = (facultyName) => {
    const slotIdx = getCurrentTimeSlotIndex();

    // If outside working hours, everyone is Free (or Away, but let's say Free for simplicity)
    if (slotIdx === -1) return 'Free';

    // Check all classes for this time slot
    for (const cls of classes) {
        const session = getInitialScheduleItem(cls.id, slotIdx);
        if (session && session.faculty === facultyName) {
            return 'Busy'; // In a class
        }
    }

    return 'Free';
};

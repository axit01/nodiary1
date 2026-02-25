/**
 * seeder.js
 * Creates the "campusops" database and seeds ALL collections
 * as defined in DATABASE_SCHEMA.md
 *
 * Usage:
 *   node seeder.js        → import all data
 *   node seeder.js -d     → destroy all data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// ── Models ────────────────────────────────────────────────────────────────────
const connectDB = require('./config/db');
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const Task = require('./models/Task');
const Meeting = require('./models/Meeting');
const Notification = require('./models/Notification');
const Department = require('./models/Department');
const Course = require('./models/Course');
const Timetable = require('./models/Timetable');
const Settings = require('./models/Settings');

connectDB();

// ─────────────────────────────────────────────────────────────────────────────
const importData = async () => {
    try {
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany(),
            Faculty.deleteMany(),
            Task.deleteMany(),
            Meeting.deleteMany(),
            Notification.deleteMany(),
            Department.deleteMany(),
            Course.deleteMany(),
            Timetable.deleteMany(),
            Settings.deleteMany(),
        ]);

        // ── 1. Settings (Config) ──────────────────────────────────────────────
        console.log('⚙️  Seeding Settings...');
        await Settings.create({
            configId: 'config',
            collegeName: 'CampusOps Institute of Technology',
            academicYear: '2025-26',
            workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        });

        // ── 2. Admin User ─────────────────────────────────────────────────────
        console.log('👤 Seeding Admin User...');
        await User.create({
            name: 'Super Admin',
            email: 'admin@campusops.com',
            password: 'admin123',
            role: 'admin',
        });

        // ── 3. Departments ────────────────────────────────────────────────────
        console.log('🏢 Seeding Departments...');
        const depts = await Department.create([
            { deptId: 'CS', name: 'Computer Science', totalFaculty: 3 },
            { deptId: 'MATH', name: 'Mathematics', totalFaculty: 1 },
            { deptId: 'PHY', name: 'Physics', totalFaculty: 1 },
            { deptId: 'CHEM', name: 'Chemistry', totalFaculty: 1 },
            { deptId: 'MECH', name: 'Mechanical Engineering', totalFaculty: 1 },
            { deptId: 'EE', name: 'Electrical Engineering', totalFaculty: 1 },
        ]);

        // ── 4. Courses ────────────────────────────────────────────────────────
        console.log('📚 Seeding Courses...');
        await Course.create([
            { courseCode: 'CS101', name: 'Intro to Programming', department: 'CS', credits: 4 },
            { courseCode: 'CS201', name: 'Data Structures', department: 'CS', credits: 4 },
            { courseCode: 'CS301', name: 'Algorithms', department: 'CS', credits: 3 },
            { courseCode: 'CS401', name: 'Operating Systems', department: 'CS', credits: 3 },
            { courseCode: 'MA101', name: 'Engineering Mathematics', department: 'MATH', credits: 4 },
            { courseCode: 'MA201', name: 'Calculus', department: 'MATH', credits: 3 },
            { courseCode: 'PH101', name: 'Engineering Physics', department: 'PHY', credits: 3 },
            { courseCode: 'CH101', name: 'Engineering Chemistry', department: 'CHEM', credits: 3 },
            { courseCode: 'ME101', name: 'Thermodynamics', department: 'MECH', credits: 3 },
            { courseCode: 'EE101', name: 'Circuit Theory', department: 'EE', credits: 3 },
        ]);

        // ── 5. Faculty ────────────────────────────────────────────────────────
        console.log('👩‍🏫 Seeding Faculty...');
        const faculty = await Faculty.create([
            { name: 'Dr. John Doe', email: 'john@college.edu', department: 'CS', designation: 'Professor', phone: '9876543210', status: 'Free', workload: 18 },
            { name: 'Prof. Jane Smith', email: 'jane@college.edu', department: 'MATH', designation: 'Assistant Professor', phone: '9876543211', status: 'Busy', workload: 14 },
            { name: 'Dr. Emily Brown', email: 'emily@college.edu', department: 'PHY', designation: 'Associate Professor', phone: '9876543212', status: 'Free', workload: 12 },
            { name: 'Mr. Michael Johnson', email: 'michael@college.edu', department: 'CHEM', designation: 'Lecturer', phone: '9876543213', status: 'Free', workload: 16 },
            { name: 'Dr. Sarah Wilson', email: 'sarah@college.edu', department: 'CS', designation: 'Professor', phone: '9876543214', status: 'Free', workload: 20 },
            { name: 'Prof. Robert Davis', email: 'robert@college.edu', department: 'MECH', designation: 'Assistant Professor', phone: '9876543215', status: 'Free', workload: 10 },
            { name: 'Dr. Priya Patel', email: 'priya@college.edu', department: 'CS', designation: 'Associate Professor', phone: '9876543216', status: 'Free', workload: 16 },
            { name: 'Mr. Rahul Sharma', email: 'rahul@college.edu', department: 'EE', designation: 'Lecturer', phone: '9876543217', status: 'Free', workload: 8 },
        ]);

        // Update department HODs
        await Department.updateOne({ deptId: 'CS' }, { hodName: faculty[0].name, hodId: faculty[0]._id });
        await Department.updateOne({ deptId: 'MATH' }, { hodName: faculty[1].name, hodId: faculty[1]._id });
        await Department.updateOne({ deptId: 'PHY' }, { hodName: faculty[2].name, hodId: faculty[2]._id });

        // ── 6. Timetable (schedule slots per faculty) ─────────────────────────
        console.log('📅 Seeding Timetable...');
        await Timetable.create([
            // Dr. John Doe — CS
            { faculty: faculty[0]._id, subject: 'Data Structures', room: 'LH-101', day: 'Monday', startTime: '09:00', endTime: '10:00', classSection: 'CS-SEM3-A' },
            { faculty: faculty[0]._id, subject: 'Algorithms', room: 'LH-101', day: 'Wednesday', startTime: '11:00', endTime: '12:00', classSection: 'CS-SEM5-A' },
            { faculty: faculty[0]._id, subject: 'Data Structures', room: 'LH-101', day: 'Friday', startTime: '09:00', endTime: '10:00', classSection: 'CS-SEM3-B' },

            // Prof. Jane Smith — Math
            { faculty: faculty[1]._id, subject: 'Engineering Maths', room: 'LH-202', day: 'Monday', startTime: '10:00', endTime: '11:00', classSection: 'CS-SEM1-A' },
            { faculty: faculty[1]._id, subject: 'Calculus', room: 'LH-202', day: 'Tuesday', startTime: '09:00', endTime: '10:00', classSection: 'MECH-SEM1-A' },

            // Dr. Emily Brown — Physics
            { faculty: faculty[2]._id, subject: 'Engineering Physics', room: 'LH-203', day: 'Tuesday', startTime: '11:00', endTime: '12:00', classSection: 'CS-SEM1-A' },
            { faculty: faculty[2]._id, subject: 'Engineering Physics', room: 'Lab-A', day: 'Thursday', startTime: '14:00', endTime: '16:00', classSection: 'CS-SEM1-B' },

            // Dr. Sarah Wilson — CS
            { faculty: faculty[4]._id, subject: 'Operating Systems', room: 'LH-305', day: 'Monday', startTime: '14:00', endTime: '15:00', classSection: 'CS-SEM5-A' },
            { faculty: faculty[4]._id, subject: 'Operating Systems', room: 'LH-305', day: 'Wednesday', startTime: '09:00', endTime: '10:00', classSection: 'CS-SEM5-B' },
        ]);

        // ── 7. Tasks ──────────────────────────────────────────────────────────
        console.log('✅ Seeding Tasks...');
        const tasks = await Task.create([
            { title: 'Grade Mid-Semester Papers', description: 'Grade and upload results on portal by Friday.', assignedTo: faculty[0]._id, status: 'In Progress', priority: 'High', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
            { title: 'Prepare Course Syllabus', description: 'Update syllabus for next semester.', assignedTo: faculty[1]._id, status: 'Assigned', priority: 'Medium', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
            { title: 'Lab Equipment Inspection', description: 'Inspect and log all lab instruments.', assignedTo: faculty[2]._id, status: 'Completed', priority: 'Low', dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
            { title: 'Research Paper Submission', description: 'Submit IEEE paper draft for review.', assignedTo: faculty[4]._id, status: 'Assigned', priority: 'High', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
            { title: 'Workshop Report', description: 'File report of the recently held workshop.', assignedTo: faculty[5]._id, status: 'Assigned', priority: 'Medium', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
        ]);

        // ── 8. Meetings ───────────────────────────────────────────────────────
        console.log('🤝 Seeding Meetings...');
        const meetings = await Meeting.create([
            {
                title: 'Monthly Review Meeting',
                description: 'Review department progress and upcoming events.',
                date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                startTime: '10:00',
                endTime: '11:30',
                location: 'Conference Room A',
                participants: [faculty[0]._id, faculty[1]._id, faculty[4]._id],
                status: 'Scheduled',
            },
            {
                title: 'Curriculum Update Discussion',
                description: 'Review and update course outlines for next semester.',
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                startTime: '14:00',
                endTime: '15:00',
                location: 'HOD Office',
                participants: [faculty[0]._id, faculty[6]._id],
                status: 'Scheduled',
            },
            {
                title: 'Faculty Orientation',
                description: 'Orientation for new faculty joining this semester.',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                startTime: '09:00',
                endTime: '12:00',
                location: 'Seminar Hall',
                participants: [faculty[5]._id, faculty[7]._id],
                status: 'Completed',
            },
        ]);

        // ── 9. Notifications ──────────────────────────────────────────────────
        console.log('🔔 Seeding Notifications...');
        await Notification.create([
            // Task notifications
            { faculty: faculty[0]._id, title: 'New Task Assigned', message: `You have been assigned: "${tasks[0].title}"`, type: 'task', isRead: false, relatedId: tasks[0]._id },
            { faculty: faculty[1]._id, title: 'New Task Assigned', message: `You have been assigned: "${tasks[1].title}"`, type: 'task', isRead: true, relatedId: tasks[1]._id },
            { faculty: faculty[4]._id, title: 'New Task Assigned', message: `You have been assigned: "${tasks[3].title}"`, type: 'task', isRead: false, relatedId: tasks[3]._id },

            // Meeting notifications
            { faculty: faculty[0]._id, title: 'Meeting Scheduled', message: `You have a meeting: "${meetings[0].title}" tomorrow at 10:00 AM`, type: 'meeting', isRead: false, relatedId: meetings[0]._id },
            { faculty: faculty[1]._id, title: 'Meeting Scheduled', message: `You have a meeting: "${meetings[0].title}" tomorrow at 10:00 AM`, type: 'meeting', isRead: false, relatedId: meetings[0]._id },
            { faculty: faculty[4]._id, title: 'Meeting Scheduled', message: `You have a meeting: "${meetings[0].title}" tomorrow at 10:00 AM`, type: 'meeting', isRead: true, relatedId: meetings[0]._id },

            // General notifications
            { faculty: faculty[0]._id, title: 'System Alert', message: 'Your session will expire in 24 hours.', type: 'general', isRead: true },
        ]);

        console.log('\n✅ Database seeded successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 Collections created in "campusops" DB:');
        console.log('   ✔ settings        (1 document)');
        console.log('   ✔ users           (1 admin)');
        console.log('   ✔ departments     (6 documents)');
        console.log('   ✔ courses         (10 documents)');
        console.log('   ✔ faculties       (8 documents)');
        console.log('   ✔ timetables      (9 documents)');
        console.log('   ✔ tasks           (5 documents)');
        console.log('   ✔ meetings        (3 documents)');
        console.log('   ✔ notifications   (7 documents)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔑 Admin Login:');
        console.log('   Email:    admin@campusops.com');
        console.log('   Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        process.exit();
    } catch (error) {
        console.error('❌ Seeder Error:', error.message);
        process.exit(1);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
const destroyData = async () => {
    try {
        console.log('🗑️  Destroying all data...');
        await Promise.all([
            User.deleteMany(),
            Faculty.deleteMany(),
            Task.deleteMany(),
            Meeting.deleteMany(),
            Notification.deleteMany(),
            Department.deleteMany(),
            Course.deleteMany(),
            Timetable.deleteMany(),
            Settings.deleteMany(),
        ]);
        console.log('✅ All data destroyed!');
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}

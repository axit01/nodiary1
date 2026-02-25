/**
 * cleandb.js — Clears all seeded dummy data, keeps the admin user.
 * Run once: node cleandb.js
 */
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const Faculty = require('./models/Faculty');
const Task = require('./models/Task');
const Meeting = require('./models/Meeting');
const Notification = require('./models/Notification');
const Department = require('./models/Department');
const Course = require('./models/Course');
const Timetable = require('./models/Timetable');
const User = require('./models/User');

const clean = async () => {
    await connectDB();
    console.log('\n🧹 Cleaning dummy data from database...\n');

    const results = await Promise.all([
        Department.deleteMany({}),
        Course.deleteMany({}),
        Faculty.deleteMany({}),
        Timetable.deleteMany({}),
        Task.deleteMany({}),
        Meeting.deleteMany({}),
        Notification.deleteMany({}),
        // Keep admin user — only remove faculty login accounts
        User.deleteMany({ role: 'faculty' }),
    ]);

    const [depts, courses, faculty, timetable, tasks, meetings, notifs, users] = results;

    console.log('✅ Cleared:');
    console.log(`   🏢 Departments    : ${depts.deletedCount} removed`);
    console.log(`   📚 Courses        : ${courses.deletedCount} removed`);
    console.log(`   👩‍🏫 Faculty        : ${faculty.deletedCount} removed`);
    console.log(`   📅 Timetable      : ${timetable.deletedCount} removed`);
    console.log(`   ✅ Tasks          : ${tasks.deletedCount} removed`);
    console.log(`   🤝 Meetings       : ${meetings.deletedCount} removed`);
    console.log(`   🔔 Notifications  : ${notifs.deletedCount} removed`);
    console.log(`   🔑 Faculty Users  : ${users.deletedCount} removed`);
    console.log('\n🔐 Admin login (admin@campusops.com / admin123) kept intact.\n');
    console.log('➡️  Now add your real departments in Settings → Departments');
    console.log('➡️  Then add courses in Settings → Courses');
    console.log('➡️  Then add faculty in the Faculty page\n');

    process.exit(0);
};

clean().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});

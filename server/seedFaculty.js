const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const Task = require('./models/Task');
const Meeting = require('./models/Meeting');
const Timetable = require('./models/Timetable');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // 1. Create a Faculty User
        const facultyEmail = 'faculty@example.com';
        let user = await User.findOne({ email: facultyEmail });
        if (!user) {
            user = await User.create({
                name: 'Dr. Rajesh Kumar',
                email: facultyEmail,
                password: 'password123',
                role: 'faculty',
                department: 'CS'
            });
            console.log('Faculty User Created');
        }

        // 2. Create Faculty Profile
        let profile = await Faculty.findOne({ email: facultyEmail });
        if (!profile) {
            profile = await Faculty.create({
                name: 'Dr. Rajesh Kumar',
                email: facultyEmail,
                department: 'CS',
                designation: 'Assistant Professor',
                phone: '9876543210',
                status: 'Free',
                room: 'G-102'
            });
            console.log('Faculty Profile Created');
        }

        // 3. Create Tasks
        const tasksCount = await Task.countDocuments({ assignedTo: profile._id });
        if (tasksCount === 0) {
            await Task.create([
                {
                    title: 'Evaluate Semester Papers',
                    description: 'Grade all papers for CS-301 by Friday.',
                    assignedTo: profile._id,
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                    priority: 'High',
                    status: 'Assigned'
                },
                {
                    title: 'Update Lab Manual',
                    description: 'Add new experiments for Python Lab.',
                    assignedTo: profile._id,
                    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                    priority: 'Medium',
                    status: 'In Progress'
                }
            ]);
            console.log('Tasks Seeded');
        }

        // 4. Create Meetings
        const meetingsCount = await Meeting.countDocuments();
        if (meetingsCount === 0) {
            await Meeting.create({
                title: 'Department Sync',
                description: 'Weekly CS department meeting to discuss exam patterns.',
                date: new Date(),
                startTime: '10:00',
                endTime: '11:00',
                location: 'Conference Room A',
                participants: [profile._id]
            });
            console.log('Meetings Seeded');
        }

        // 5. Create Timetable
        const ttCount = await Timetable.countDocuments({ faculty: profile._id });
        if (ttCount === 0) {
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const slots = [
                { startTime: '09:00', endTime: '10:00', subject: 'Data Structures', room: 'L-201', classSection: 'CS-A' },
                { startTime: '11:15', endTime: '12:15', subject: 'Algorithms', room: 'L-202', classSection: 'CS-B' }
            ];

            const ttData = [];
            days.forEach(day => {
                slots.forEach(slot => {
                    ttData.push({ ...slot, day, faculty: profile._id });
                });
            });

            await Timetable.insertMany(ttData);
            console.log('Timetable Seeded');
        }

        console.log('Seeding Complete!');
        process.exit();
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

seedData();

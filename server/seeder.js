const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const Task = require('./models/Task');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Faculty.deleteMany();
        await Task.deleteMany();

        const createdUsers = await User.create([
            {
                name: 'Admin User',
                email: 'admin@campusops.com',
                password: 'password123',
                role: 'admin',
            }
        ]);

        const adminUser = createdUsers[0]._id;

        const faculty = await Faculty.create([
            { name: 'Dr. John Doe', email: 'john@college.edu', department: 'CS', designation: 'Professor', status: 'Free' },
            { name: 'Prof. Jane Smith', email: 'jane@college.edu', department: 'Math', designation: 'Assistant Professor', status: 'Busy' },
            { name: 'Dr. Emily Brown', email: 'emily@college.edu', department: 'Physics', designation: 'Associate Professor', status: 'Meeting' },
        ]);

        await Task.create([
            { title: 'Grade Midterms', assignedTo: faculty[0]._id, status: 'In Progress', dueDate: new Date() },
            { title: 'Prepare Syllabus', assignedTo: faculty[1]._id, status: 'Assigned', dueDate: new Date() },
            { title: 'Lab Maintenance', assignedTo: faculty[2]._id, status: 'Completed', dueDate: new Date() },
        ]);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    // ...
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Users, FileCheck, Calendar, Clock } from 'lucide-react';
import { getFacultyStatus } from '../utils/scheduleUtils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
);

const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 font-medium">↑ {trend}%</span>
                <span className="text-gray-400 ml-2">vs last month</span>
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const { api } = useAuth();
    const [stats, setStats] = useState({
        totalFaculty: 0,
        activeTasks: 0,
        meetingsToday: 0,
        taskStats: []
    });

    useEffect(() => {
        // Mock Data for UI-Only Mode
        const mockStats = {
            totalFaculty: 12,
            activeTasks: 5,
            meetingsToday: 2,
            taskStats: [{ _id: 'Completed', count: 10 }, { _id: 'Pending', count: 5 }]
        };
        setStats(mockStats);
    }, []);

    // Data for Faculty Availability (Dummy)
    // Dynamic Faculty Availability Data
    const facultyList = ['Dr. John Doe', 'Prof. Jane Smith', 'Mr. Michael Johnson', 'Dr. Sarah Wilson', 'Dr. Emily Brown'];
    const statusCounts = { Free: 0, Busy: 0, Meeting: 0, Leave: 0 };

    facultyList.forEach(name => {
        const status = getFacultyStatus(name);
        if (status === 'Busy') statusCounts.Busy++;
        else statusCounts.Free++;
    });

    const availabilityData = {
        labels: ['Free', 'Busy', 'Meeting', 'Leave'],
        datasets: [
            {
                data: [statusCounts.Free, statusCounts.Busy, statusCounts.Meeting, statusCounts.Leave],
                backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#64748b'],
                borderWidth: 0,
            },
        ],
    };

    // Data for Task Trends (Dummy)
    const taskTrendData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
            {
                label: 'Tasks Completed',
                data: [12, 19, 15, 17, 14, 8],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Faculty"
                    value={stats.totalFaculty}
                    icon={Users}
                    color="bg-blue-500"
                    trend="12"
                />
                <StatsCard
                    title="Active Tasks"
                    value={stats.activeTasks}
                    icon={FileCheck}
                    color="bg-amber-500"
                    trend="5"
                />
                <StatsCard
                    title="Meetings Today"
                    value={stats.meetingsToday}
                    icon={Calendar}
                    color="bg-purple-500"
                />
                <StatsCard
                    title="Avg Workload"
                    value="4.5h"
                    icon={Clock}
                    color="bg-emerald-500"
                    trend="8"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Task Completion</h3>
                    <div className="h-64">
                        <Line data={taskTrendData} options={{ maintainAspectRatio: false, responsive: true }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Faculty Availability</h3>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut data={availabilityData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

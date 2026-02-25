import { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, Users, CheckCircle2, Calendar, Table, Loader2 } from 'lucide-react';
import { getFacultyAPI, getTasksAPI, getMeetingsAPI, getTimetableAPI } from '../utils/api';

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState({
        faculty: [],
        tasks: [],
        meetings: [],
        timetable: []
    });

    useEffect(() => {
        const loadAll = async () => {
            try {
                setLoading(true);
                const [f, t, m, tt] = await Promise.all([
                    getFacultyAPI(),
                    getTasksAPI(),
                    getMeetingsAPI(),
                    getTimetableAPI()
                ]);
                setData({
                    faculty: f.data,
                    tasks: t.data,
                    meetings: m.data,
                    timetable: tt.data
                });
            } catch (err) {
                setError('Failed to load data for reports.');
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, []);

    // ── Export Logic ─────────────────────────────────────────────────────────
    const downloadCSV = (title, headers, rows) => {
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportFacultyReport = () => {
        const headers = ['Name', 'Email', 'Department', 'Designation', 'Phone', 'Courses', 'Account Status'];
        const rows = data.faculty.map(f => [
            f.name,
            f.email,
            f.department,
            f.designation,
            f.phone || 'N/A',
            (f.courses || []).join('; '),
            f.status || 'Active'
        ]);
        downloadCSV('Faculty_Master_List', headers, rows);
    };

    const exportTaskReport = () => {
        const headers = ['Title', 'Assigned To', 'Start Date', 'Due Date', 'Status', 'Description'];
        const rows = data.tasks.map(t => [
            t.title,
            t.assignedTo?.name || 'Unassigned',
            new Date(t.startDate).toLocaleDateString(),
            new Date(t.dueDate).toLocaleDateString(),
            t.status,
            t.description
        ]);
        downloadCSV('Task_Performance_Report', headers, rows);
    };

    const exportMeetingReport = () => {
        const headers = ['Title', 'Date', 'Time', 'Location', 'Participants Count', 'Status'];
        const rows = data.meetings.map(m => [
            m.title,
            new Date(m.date).toLocaleDateString(),
            `${m.startTime} - ${m.endTime}`,
            m.location,
            (m.participants || []).length,
            m.status
        ]);
        downloadCSV('Meeting_Participation_Summary', headers, rows);
    };

    const exportTimetableReport = () => {
        const headers = ['Day', 'Time', 'Section', 'Subject', 'Faculty', 'Room'];
        const rows = data.timetable.map(t => [
            t.day,
            `${t.startTime} - ${t.endTime}`,
            t.classSection,
            t.subject,
            t.faculty?.name || 'N/A',
            t.room
        ]);
        downloadCSV('Master_Timetable_Export', headers, rows);
    };

    if (loading) return (
        <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-slate-400" size={48} />
            <p className="text-gray-500 font-medium tracking-wide">Synthesizing Analytics...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reports & Insights</h1>
                    <p className="text-slate-500 mt-1">Generate and download detailed exports of campus operations.</p>
                </div>
                <button
                    onClick={() => { exportFacultyReport(); exportTaskReport(); exportMeetingReport(); exportTimetableReport(); }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 font-bold"
                >
                    <Download size={20} />
                    <span>Download All Data</span>
                </button>
            </div>

            {/* Statistic Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <QuickStat label="Faculty Strength" value={data.faculty.length} icon={Users} color="bg-blue-50 text-blue-600" />
                <QuickStat label="Total Tasks" value={data.tasks.length} icon={CheckCircle2} color="bg-green-50 text-green-600" />
                <QuickStat label="Meetings Organized" value={data.meetings.length} icon={Calendar} color="bg-purple-50 text-purple-600" />
                <QuickStat label="Weekly Slots" value={data.timetable.length} icon={Table} color="bg-amber-50 text-amber-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Download Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ReportCard
                        title="Faculty Master Export"
                        desc="Contact details, departments, and course allocations for all faculty."
                        icon={Users}
                        onDownload={exportFacultyReport}
                        theme="blue"
                    />
                    <ReportCard
                        title="Task Progression"
                        desc="Detailed breakdown of task status, deadlines, and faculty assignments."
                        icon={TrendingUp}
                        onDownload={exportTaskReport}
                        theme="green"
                    />
                    <ReportCard
                        title="Events & Meetings"
                        desc="Historical and upcoming meeting logs with participation counts."
                        icon={Calendar}
                        onDownload={exportMeetingReport}
                        theme="purple"
                    />
                    <ReportCard
                        title="Full Timetable"
                        desc="Export the entire academic calendar and room allocation registry."
                        icon={Table}
                        onDownload={exportTimetableReport}
                        theme="amber"
                    />
                </div>

                {/* Data Integrity / Recent Activity Side Panel */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <FileText size={22} className="text-slate-400" />
                        Live Export Log
                    </h3>
                    <div className="space-y-6 flex-1">
                        <LogItem title="Faculty List Generated" time="Just now" status="Ready" />
                        <LogItem title="Task Registry Synced" time="2 mins ago" status="Ready" />
                        <LogItem title="Meeting Schedule" time="15 mins ago" status="Ready" />
                        <LogItem title="Timetable Snapshot" time="1 hour ago" status="Stable" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickStat = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm flex items-center gap-5">
        <div className={`p-4 rounded-2xl ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <h4 className="text-2xl font-black text-slate-900">{value}</h4>
        </div>
    </div>
);

const ReportCard = ({ title, desc, icon: Icon, onDownload, theme }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 hover:border-blue-200',
        green: 'bg-green-50 text-green-600 hover:border-green-200',
        purple: 'bg-purple-50 text-purple-600 hover:border-purple-200',
        amber: 'bg-amber-50 text-amber-600 hover:border-amber-200',
    };

    return (
        <div
            onClick={onDownload}
            className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-64 ${colors[theme]}`}
        >
            <div className="flex justify-between items-start">
                <div className="p-4 rounded-2xl bg-white shadow-inner group-hover:scale-110 transition-transform">
                    <Icon size={28} />
                </div>
                <div className="bg-white p-2 rounded-full shadow-sm">
                    <Download size={20} className="text-slate-300 group-hover:text-slate-900" />
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">{title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
};

const LogItem = ({ title, time, status }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-500 transition-colors" />
            <div>
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{time}</p>
            </div>
        </div>
        <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-full">{status}</span>
    </div>
);

export default Reports;

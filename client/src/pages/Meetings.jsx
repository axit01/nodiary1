import { useState } from 'react';
import { Plus, User, Clock, MapPin, Calendar as CalendarIcon, X, Trash2, Filter } from 'lucide-react';

const Meetings = () => {
    const [meetings, setMeetings] = useState([
        { id: 1, title: 'Department Weekly Sync', date: '2026-01-16', startTime: '10:00', endTime: '11:00', location: 'Conference Room A', participants: 12, status: 'Completed', description: 'Weekly status update for all departments' },
        { id: 2, title: 'Faculty Board Meeting', date: '2026-01-17', startTime: '14:00', endTime: '16:00', location: 'Main Hall', participants: 45, status: 'Scheduled', description: 'Quarterly board meeting' },
        { id: 3, title: 'Project Review with Dean', date: '2026-01-16', startTime: '16:30', endTime: '17:30', location: 'Dean\'s Office', participants: 4, status: 'Scheduled', description: 'Review of ongoing research grants' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [filter, setFilter] = useState('All');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        participants: '',
        description: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = () => {
        setFormData({ title: '', date: '', startTime: '', endTime: '', location: '', participants: '', description: '' });
        setSelectedParticipants([]);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newMeeting = {
            ...formData,
            id: Math.max(...meetings.map(m => m.id), 0) + 1,
            status: 'Scheduled',
            participants: selectedParticipants.length, // Store count or array if needed
            participantNames: selectedParticipants // Store names for now
        };

        // Notification Simulation (In real app, this goes to Helper/Backend)
        // For each selected faculty, we would add a doc to `faculties/{uid}/notifications`
        console.log(`Sending notifications to: ${selectedParticipants.join(', ')}`);
        alert(`Meeting Scheduled! Notifications sent to: ${selectedParticipants.join(', ')}`);

        setMeetings([...meetings, newMeeting]);
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (confirm('Cancel this meeting?')) {
            setMeetings(meetings.filter(m => m.id !== id));
        }
    };

    // Helper to format date for display
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Filter logic
    const filteredMeetings = filter === 'All' ? meetings : meetings.filter(m => m.status === filter);

    // Sort meetings: Today's meetings first, then by date
    const todayStr = '2026-01-16'; // Mock "Today"
    const todaysMeetings = meetings.filter(m => m.date === todayStr);
    const otherMeetings = meetings.filter(m => m.date !== todayStr);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Meetings & Events</h1>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                        <Plus size={20} />
                        <span>Schedule Meeting</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Today's Agenda */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 flex items-center justify-between">
                        <span>Today's Agenda</span>
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{todaysMeetings.length} Meetings</span>
                    </h2>

                    {todaysMeetings.length > 0 ? todaysMeetings.map(meeting => (
                        <div key={meeting.id} className="bg-white p-5 rounded-xl border-l-4 border-indigo-500 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow relative group">
                            <button
                                onClick={() => handleDelete(meeting.id)}
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-gray-900">{meeting.title}</h3>
                                <span className={`text-xs font-semibold px-2 py-1 rounded ${meeting.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-700'}`}>
                                    {meeting.status === 'Completed' ? 'Done' : 'Today'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1"><Clock size={16} /> {meeting.startTime} - {meeting.endTime}</span>
                                <span className="flex items-center gap-1"><MapPin size={16} /> {meeting.location}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600 line-clamp-1">
                                {meeting.description}
                            </div>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium">U{i}</div>
                                    ))}
                                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">+{Math.max(0, meeting.participants - 3)}</div>
                                </div>
                                <span className="text-sm text-gray-500 ml-2">Participants</span>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white p-8 rounded-xl border border-dashed border-gray-200 text-center text-gray-500">
                            <p>No meetings scheduled for today.</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Upcoming / List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">All Scheduled</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Meeting</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredMeetings.map(meeting => (
                                    <tr key={meeting.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon size={14} className="text-gray-400" />
                                                    <span>{formatDate(meeting.date)}</span>
                                                </div>
                                                <span className="text-xs text-gray-500 pl-6">{meeting.startTime}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{meeting.title}</p>
                                            <p className="text-xs text-gray-500">{meeting.location}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(meeting.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Cancel Meeting"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Schedule Meeting Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Schedule Meeting</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title <span className="text-red-500">*</span></label>
                                <input name="title" required value={formData.title} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Dept Sync" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                                    <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div>
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                                        <div className="border border-gray-300 rounded-lg max-h-32 overflow-y-auto p-2 bg-white">
                                            {['Dr. John Doe', 'Prof. Jane Smith', 'Mr. Michael Johnson', 'Dr. Sarah Wilson', 'Dr. Emily Brown'].map(faculty => (
                                                <label key={faculty} className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer text-sm">
                                                    <input
                                                        type="checkbox"
                                                        value={faculty}
                                                        checked={selectedParticipants.includes(faculty)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedParticipants([...selectedParticipants, faculty]);
                                                            else setSelectedParticipants(selectedParticipants.filter(p => p !== faculty));
                                                        }}
                                                        className="rounded text-primary-600 focus:ring-primary-500"
                                                    />
                                                    {faculty}
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{selectedParticipants.length} selected</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time <span className="text-red-500">*</span></label>
                                    <input type="time" name="startTime" required value={formData.startTime} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time <span className="text-red-500">*</span></label>
                                    <input type="time" name="endTime" required value={formData.endTime} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                                <input name="location" required value={formData.location} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Conference Room A" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" rows="2" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Agenda or notes..."></textarea>
                            </div>

                            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-500/20 mt-2">
                                Schedule Meeting
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Meetings;

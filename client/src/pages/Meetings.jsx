import { useState, useEffect } from 'react';
import { Plus, Clock, MapPin, Calendar as CalendarIcon, X, Trash2 } from 'lucide-react';
import { getFacultyAPI, getMeetingsAPI, createMeetingAPI, updateMeetingAPI, deleteMeetingAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const Meetings = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [meetings, setMeetings] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [participantSearch, setParticipantSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const [formData, setFormData] = useState({
        title: '', date: '', startTime: '', endTime: '', location: '', description: ''
    });

    // ── Load from API ───────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const [meetRes, facRes] = await Promise.all([getMeetingsAPI(), getFacultyAPI()]);
                setMeetings(meetRes.data);
                setFaculty(facRes.data);
            } catch {
                setError('Failed to load meetings.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = () => {
        setFormData({ title: '', date: '', startTime: '', endTime: '', location: '', description: '' });
        setSelectedParticipants([]);
        setParticipantSearch('');
        setIsModalOpen(true);
    };

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...formData, participants: selectedParticipants };
            const { data } = await createMeetingAPI(payload);
            setMeetings(prev => [data, ...prev]);
            setIsModalOpen(false);
            showToast('Meeting scheduled successfully', 'success');
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to schedule meeting.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Delete / Cancel ─────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Cancel Meeting?',
            message: 'Are you sure you want to cancel this meeting? Participants will notify if system enabled.',
            variant: 'danger',
            confirmText: 'Yes, Cancel Meeting'
        });

        if (!isConfirmed) return;

        try {
            await deleteMeetingAPI(id);
            setMeetings(prev => prev.filter(m => m._id !== id));
            showToast('Meeting removed successfully', 'success');
        } catch {
            showToast('Delete failed.', 'error');
        }
    };

    // ── Helpers ─────────────────────────────────────────────────────────────
    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const todayStr = new Date().toISOString().substring(0, 10);
    const todaysMeetings = meetings.filter(m => m.date && m.date.substring(0, 10) === todayStr);
    const filteredMeetings = filter === 'All' ? meetings : meetings.filter(m => m.status === filter);

    if (loading) return <div className="flex justify-center items-center h-96 text-gray-400">Loading meetings...</div>;
    if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Meetings &amp; Events</h1>
                <button onClick={handleOpenModal}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap">
                    <Plus size={20} /> Schedule Meeting
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Agenda */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 flex items-center justify-between">
                        <span>Today's Agenda</span>
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{todaysMeetings.length} Meetings</span>
                    </h2>
                    {todaysMeetings.length > 0 ? todaysMeetings.map(meeting => (
                        <div key={meeting._id} className="bg-white p-5 rounded-xl border-l-4 border-indigo-500 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow relative group">
                            <button onClick={() => handleDelete(meeting._id)}
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            <div className="mt-2 text-sm text-gray-600 line-clamp-1">{meeting.description}</div>
                            <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                                {meeting.participants?.length ?? 0} participant(s)
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white p-8 rounded-xl border border-dashed border-gray-200 text-center text-gray-500">
                            <p>No meetings scheduled for today.</p>
                        </div>
                    )}
                </div>

                {/* All Meetings table */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-700">All Scheduled</h2>
                        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-primary-500"
                            value={filter} onChange={e => setFilter(e.target.value)}>
                            <option value="All">All</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Meeting</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredMeetings.length > 0 ? filteredMeetings.map(meeting => (
                                    <tr key={meeting._id} className="hover:bg-gray-50 transition-colors">
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${meeting.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : meeting.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {meeting.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleDelete(meeting._id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors" title="Cancel Meeting">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-400">No meetings found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Schedule Meeting</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title *</label>
                                <input name="title" required value={formData.title} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Dept Sync" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                <input type="date" name="date" required value={formData.date} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Participants</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search faculty..."
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                                        value={participantSearch}
                                        onChange={(e) => setParticipantSearch(e.target.value)}
                                    />
                                    <svg className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto p-2 bg-gray-50/30">
                                    {faculty
                                        .filter(f => f.name.toLowerCase().includes(participantSearch.toLowerCase()))
                                        .map(f => (
                                            <label key={f._id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer text-sm transition-colors">
                                                <input type="checkbox" value={f._id}
                                                    checked={selectedParticipants.includes(f._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedParticipants(prev => [...prev, f._id]);
                                                        else setSelectedParticipants(prev => prev.filter(p => p !== f._id));
                                                    }} className="rounded h-4 w-4 accent-slate-900" />
                                                <div>
                                                    <p className="font-medium text-gray-700">{f.name}</p>
                                                    <p className="text-[10px] text-gray-400">{f.department}</p>
                                                </div>
                                            </label>
                                        ))}
                                    {faculty.filter(f => f.name.toLowerCase().includes(participantSearch.toLowerCase())).length === 0 && (
                                        <p className="text-center text-xs text-gray-400 py-2">No faculty found</p>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">{selectedParticipants.length} selected</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                                <input type="time" name="startTime" required value={formData.startTime} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                                <input type="time" name="endTime" required value={formData.endTime} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                <input name="location" required value={formData.location} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Conference Room A" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" rows="2" value={formData.description} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Agenda or notes..." />
                            </div>
                            <button type="submit" disabled={submitting}
                                className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 shadow-lg shadow-slate-200">
                                {submitting ? 'Scheduling...' : 'Schedule Meeting'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Meetings;

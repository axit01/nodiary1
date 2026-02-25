import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Filter, X, Edit2, Plus, Loader2, Trash2 } from 'lucide-react';
import { timeSlots, timeSlotLabels } from '../utils/scheduleUtils';
import {
    getTimetableAPI,
    addTimetableSlotAPI,
    updateTimetableSlotAPI,
    deleteTimetableSlotAPI,
    getFacultyAPI
} from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Schedule = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [timetable, setTimetable] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || 'Monday');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [formSubmitting, setFormSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        faculty: '',
        subject: '',
        room: '',
        day: '',
        startTime: '09:00',
        endTime: '10:00',
        classSection: ''
    });

    // Load data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [ttRes, facRes] = await Promise.all([
                getTimetableAPI(),
                getFacultyAPI()
            ]);
            setTimetable(ttRes.data);
            setFaculty(facRes.data);
        } catch (err) {
            setError('Failed to load schedule data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenAddModal = (classSection, time) => {
        setFormData({
            faculty: '',
            subject: '',
            room: '',
            day: selectedDay,
            startTime: time || '09:00',
            endTime: (time ? `${parseInt(time) + 1}:00`.padStart(5, '0') : '10:00'),
            classSection: classSection || ''
        });
        setSelectedSlot(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (slot) => {
        setSelectedSlot(slot);
        setFormData({
            faculty: slot.faculty._id,
            subject: slot.subject,
            room: slot.room,
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            classSection: slot.classSection
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormSubmitting(true);
        try {
            if (selectedSlot) {
                await updateTimetableSlotAPI(selectedSlot._id, formData);
            } else {
                await addTimetableSlotAPI(formData);
            }
            await loadData();
            setIsModalOpen(false);
            showToast('Slot saved successfully', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save slot', 'error');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Delete Schedule Slot?',
            message: 'Are you sure you want to remove this class slot from the timetable?',
            variant: 'danger',
            confirmText: 'Yes, Delete Slot'
        });

        if (!isConfirmed) return;

        try {
            await deleteTimetableSlotAPI(id);
            await loadData();
            setIsModalOpen(false);
            showToast('Slot deleted successfully', 'success');
        } catch (err) {
            showToast('Failed to delete slot', 'error');
        }
    };

    // Filter timetable for current day and organize by section
    const daySlots = timetable.filter(s => s.day === selectedDay);
    const sections = [...new Set(daySlots.map(s => s.classSection))].sort();

    // Fallback if no sections exist yet
    const displaySections = sections.length > 0 ? sections : ['Default Section'];

    const getSlot = (section, time) => {
        return daySlots.find(s => s.classSection === section && s.startTime === time);
    };

    if (loading && timetable.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Class Schedule</h1>

                <div className="flex items-center gap-4 bg-white px-2 py-1.5 rounded-xl shadow-sm border border-gray-100">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedDay === day
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {day.slice(0, 3)}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => handleOpenAddModal()}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add Slot
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-r border-gray-100 bg-gray-50/50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 z-10 w-48">
                                    Section
                                </th>
                                {timeSlots.map((time, idx) => (
                                    <th key={time} className="p-4 border-b border-gray-100 bg-gray-50/50 text-center text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[160px]">
                                        {timeSlotLabels[idx]}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {displaySections.map(section => (
                                <tr key={section} className="group">
                                    <td className="p-4 border-b border-r border-gray-100 font-bold text-gray-800 sticky left-0 z-10 bg-white group-hover:bg-gray-50 transition-colors">
                                        {section}
                                    </td>
                                    {timeSlots.map(time => {
                                        const slot = getSlot(section, time);
                                        return (
                                            <td
                                                key={`${section}-${time}`}
                                                className="p-3 border-b border-gray-100 h-32 relative group/cell"
                                            >
                                                {slot ? (
                                                    <div
                                                        onClick={() => handleOpenEditModal(slot)}
                                                        className="h-full w-full bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:bg-indigo-100 transition-all hover:shadow-sm"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-indigo-900 text-sm line-clamp-1">{slot.subject}</p>
                                                            <p className="text-xs text-indigo-600 font-medium mt-1">{slot.faculty.name}</p>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-[10px] font-bold bg-white text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wide">
                                                                {slot.room}
                                                            </span>
                                                            <Edit2 size={12} className="text-indigo-400 opacity-0 group-hover/cell:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenAddModal(section, time)}
                                                        className="w-full h-full rounded-xl border-2 border-dashed border-gray-100 group-hover/cell:border-primary-200 transition-all flex items-center justify-center text-gray-300 group-hover/cell:text-primary-400"
                                                    >
                                                        <Plus size={20} />
                                                    </button>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Timetable Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedSlot ? 'Edit Slot' : 'Add New Slot'}</h2>
                                <p className="text-sm text-gray-500 mt-1">Fill in the details for this session</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Day</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                                        value={formData.day}
                                        onChange={e => setFormData({ ...formData, day: e.target.value })}
                                    >
                                        {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Section</label>
                                    <input
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                        value={formData.classSection}
                                        onChange={e => setFormData({ ...formData, classSection: e.target.value })}
                                        placeholder="e.g. CSE-3A"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Faculty Member</label>
                                <select
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                                    value={formData.faculty}
                                    onChange={e => setFormData({ ...formData, faculty: e.target.value })}
                                >
                                    <option value="">Select Faculty</option>
                                    {faculty.map(f => <option key={f._id} value={f._id}>{f.name} ({f.department})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject Name</label>
                                <input
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="e.g. Operating Systems"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Room / Lab</label>
                                    <input
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                        value={formData.room}
                                        onChange={e => setFormData({ ...formData, room: e.target.value })}
                                        placeholder="LH-102"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Starts At</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    >
                                        {timeSlots.map((t, idx) => <option key={t} value={t}>{timeSlotLabels[idx]}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                {selectedSlot && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(selectedSlot._id)}
                                        className="flex-[1] bg-red-50 text-red-600 rounded-2xl py-4 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={formSubmitting}
                                    className="flex-[3] bg-slate-900 text-white rounded-2xl py-4 font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                                >
                                    {formSubmitting ? 'Saving...' : selectedSlot ? 'Update Slot' : 'Create Slot'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;

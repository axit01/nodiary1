import { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, X, Edit2 } from 'lucide-react';
import { timeSlots, classes, getInitialScheduleItem } from '../utils/scheduleUtils';

const Schedule = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);

    // Date Stats
    const [currentDate, setCurrentDate] = useState(new Date('2026-01-16'));



    const departments = ['All', 'Computer Science', 'Mechanical', 'Electrical', 'Civil'];

    // Local State for Custom Overrides (Mocking Database)
    const [scheduleOverrides, setScheduleOverrides] = useState({});

    const filteredClasses = selectedDepartment === 'All'
        ? classes
        : classes.filter(c => c.dept === selectedDepartment);



    const getScheduleItem = (classId, timeIdx) => {
        const key = `${classId}-${timeIdx}`;
        if (scheduleOverrides[key] !== undefined) return scheduleOverrides[key];
        return getInitialScheduleItem(classId, timeIdx);
    };

    const handleCellClick = (classId, timeIdx, currentData) => {
        setSelectedCell({
            classId,
            timeIdx,
            title: classes.find(c => c.id === classId).name,
            timeLabel: timeSlots[timeIdx],
            data: currentData || { subject: '', room: '', type: 'Lecture', faculty: '' }
        });
        setIsModalOpen(true);
    };

    const handleCellSave = (newData) => {
        const key = `${selectedCell.classId}-${selectedCell.timeIdx}`;
        setScheduleOverrides(prev => ({
            ...prev,
            [key]: newData.subject ? newData : null // If subject empty, clear slot
        }));
        setIsModalOpen(false);
    };

    const handleDateChange = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
        // In a real app, this would trigger a refetch
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Class Schedule</h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    {/* Department Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white w-full"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Navigation */}
                    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 justify-between sm:justify-start w-full sm:w-auto">
                        <button onClick={() => handleDateChange(-1)} className="text-gray-500 hover:text-gray-900"><ChevronLeft size={20} /></button>
                        <span className="font-semibold text-gray-700 whitespace-nowrap">
                            {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button onClick={() => handleDateChange(1)} className="text-gray-500 hover:text-gray-900"><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr>
                            <th className="p-4 border-b border-r border-gray-200 bg-gray-50 min-w-[180px] sticky left-0 z-10 text-gray-700 font-bold shadow-sm">
                                Class / Section
                            </th>
                            {timeSlots.map(time => (
                                <th key={time} className="p-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-600 min-w-[140px] text-center">
                                    {time}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClasses.map((cls, idx) => (
                            <tr key={cls.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 border-b border-r border-gray-200 bg-white sticky left-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                                    <div>
                                        <p className="font-bold text-gray-800">{cls.name}</p>
                                        <p className="text-xs text-gray-500">{cls.dept}</p>
                                    </div>
                                </td>
                                {timeSlots.map((time, timeIdx) => {
                                    const session = getScheduleItem(cls.id, timeIdx);

                                    if (!session) {
                                        return (
                                            <td
                                                key={`${cls.id}-${time}`}
                                                className="p-2 border-b border-gray-100 bg-gray-50/10 cursor-pointer hover:bg-gray-100 transition-colors relative group"
                                                onClick={() => handleCellClick(cls.id, timeIdx, null)}
                                            >
                                                <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-gray-400">
                                                    <Edit2 size={16} />
                                                </div>
                                            </td>
                                        );
                                    }

                                    const isLab = session.type === 'Lab';
                                    const bgColor = isLab ? 'bg-purple-50 hover:bg-purple-100' : 'bg-blue-50 hover:bg-blue-100';
                                    const borderColor = isLab ? 'border-purple-200' : 'border-blue-200';
                                    const textColor = isLab ? 'text-purple-700' : 'text-blue-700';

                                    return (
                                        <td key={`${cls.id}-${time}`} className="p-2 border-b border-gray-100 h-28 relative">
                                            <div
                                                onClick={() => handleCellClick(cls.id, timeIdx, session)}
                                                className={`h-full w-full ${bgColor} border ${borderColor} rounded-lg p-2.5 flex flex-col justify-between transition-colors cursor-pointer group shadow-sm hover:shadow-md`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className={`font-bold text-sm ${textColor} leading-tight line-clamp-2`}>{session.subject}</span>
                                                    {isLab && <span className="text-[10px] font-bold bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded">LAB</span>}
                                                </div>
                                                <div className="text-xs text-gray-500 flex flex-col gap-0.5 mt-2">
                                                    <span className="font-medium text-gray-600">{session.room}</span>
                                                    <span className="text-gray-400 group-hover:text-gray-500 transition-colors truncate">{session.faculty}</span>
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {isModalOpen && selectedCell && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">{selectedCell.title}</h3>
                                <p className="text-sm text-gray-500">{selectedCell.timeLabel}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={selectedCell.data.subject}
                                    onChange={(e) => setSelectedCell({ ...selectedCell, data: { ...selectedCell.data, subject: e.target.value } })}
                                    placeholder="e.g. Data Structures"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Room</label>
                                    <input
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                        value={selectedCell.data.room}
                                        onChange={(e) => setSelectedCell({ ...selectedCell, data: { ...selectedCell.data, room: e.target.value } })}
                                        placeholder="LH-101"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                        value={selectedCell.data.type}
                                        onChange={(e) => setSelectedCell({ ...selectedCell, data: { ...selectedCell.data, type: e.target.value } })}
                                    >
                                        <option value="Lecture">Lecture</option>
                                        <option value="Lab">Lab</option>
                                        <option value="Tutorial">Tutorial</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Faculty</label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={selectedCell.data.faculty}
                                    onChange={(e) => setSelectedCell({ ...selectedCell, data: { ...selectedCell.data, faculty: e.target.value } })}
                                    placeholder="Dr. Smith"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    onClick={() => handleCellSave({ subject: '' })}
                                    className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
                                >
                                    Clear Slot
                                </button>
                                <button
                                    onClick={() => handleCellSave(selectedCell.data)}
                                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;

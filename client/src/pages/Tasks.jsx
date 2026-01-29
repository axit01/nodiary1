import { useState } from 'react';
import { Plus, Calendar, CheckCircle2, Clock, AlertCircle, Edit, Trash2, X, Filter } from 'lucide-react';
import { getFacultyStatus } from '../utils/scheduleUtils';

const Tasks = () => {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Grade Midterm Papers', assignedTo: 'Dr. John Doe', dueDate: '2026-01-20', status: 'In Progress', priority: 'High', description: 'Complete grading for CS-101' },
        { id: 2, title: 'Submit Research Proposal', assignedTo: 'Prof. Jane Smith', dueDate: '2026-01-22', status: 'Pending', priority: 'Medium', description: 'NSF Grant submission draft' },
        { id: 3, title: 'Lab Equipment Audit', assignedTo: 'Mr. Michael Johnson', dueDate: '2026-01-18', status: 'Overdue', priority: 'High', description: 'Annual inventory check' },
        { id: 4, title: 'Prepare Syllabus for Next Sem', assignedTo: 'Dr. Sarah Wilson', dueDate: '2026-02-01', status: 'Completed', priority: 'Low', description: 'Update course outline' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [editingTask, setEditingTask] = useState(null);

    // Mock Faculty List for Assignment
    const facultyList = ['Dr. John Doe', 'Prof. Jane Smith', 'Mr. Michael Johnson', 'Dr. Sarah Wilson'];

    const [formData, setFormData] = useState({
        title: '',
        assignedTo: '',
        dueDate: '',
        priority: 'Medium',
        description: ''
    });

    const handleOpenModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData(task);
        } else {
            setEditingTask(null);
            setFormData({ title: '', assignedTo: '', dueDate: '', priority: 'Medium', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTask) {
            setTasks(tasks.map(t => t.id === editingTask.id ? { ...formData, id: t.id, status: t.status } : t));
        } else {
            const newTask = {
                ...formData,
                id: Math.max(...tasks.map(t => t.id), 0) + 1,
                status: 'Pending'
            };
            setTasks([...tasks, newTask]);
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (confirm('Delete this task?')) {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    const handleStatusChange = (id, newStatus) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
            case 'Pending': return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
            case 'In Progress': return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
            case 'Overdue': return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
            default: return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' };
        }
    };

    const filteredTasks = filterStatus === 'All' ? tasks : tasks.filter(t => t.status === filterStatus);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Task Management</h1>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                        <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <select
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">New Task</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.length > 0 ? filteredTasks.map((task) => {
                    const style = getStatusStyle(task.status);
                    const StatusIcon = style.icon;
                    return (
                        <div key={task.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                            {/* Card Actions */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(task)} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handleDelete(task.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex justify-between items-start mb-4 pr-16">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-bold ${task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {task.priority}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{task.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{task.description || 'No description provided.'}</p>

                            <div className="mb-4">
                                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Assigned To</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                                        {task.assignedTo.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{task.assignedTo}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                    <Calendar size={14} />
                                    <span>{task.dueDate}</span>
                                </div>

                                <select
                                    className={`text-xs font-bold uppercase cursor-pointer bg-transparent outline-none ${style.color}`}
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Overdue">Overdue</option>
                                </select>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p>No tasks found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
                                <input name="title" required value={formData.title} onChange={handleInputChange} className="w-full input-field border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Grade Papers" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Task details..."></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To <span className="text-red-500">*</span></label>
                                    <select name="assignedTo" required value={formData.assignedTo} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-primary-500 outline-none">
                                        <option value="">Select Faculty</option>
                                        {facultyList.filter(f => getFacultyStatus(f) !== 'Busy').map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">Busy faculty members are hidden</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
                                    <input type="date" name="dueDate" required value={formData.dueDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <div className="flex gap-4">
                                    {['Low', 'Medium', 'High'].map(p => (
                                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="priority" value={p} checked={formData.priority === p} onChange={handleInputChange} className="text-primary-600 focus:ring-primary-500" />
                                            <span className="text-sm text-gray-700">{p}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-500/20 mt-4">
                                {editingTask ? 'Save Changes' : 'Create Task'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;

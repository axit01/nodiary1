import { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle2, Clock, AlertCircle, Edit, Trash2, X, Filter } from 'lucide-react';
import { getFacultyAPI, getTasksAPI, createTaskAPI, updateTaskAPI, deleteTaskAPI } from '../utils/api';
import { getFacultyStatus } from '../utils/scheduleUtils';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const Tasks = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [tasks, setTasks] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [editingTask, setEditingTask] = useState(null);

    const [formData, setFormData] = useState({
        title: '', assignedTo: '', dueDate: '', priority: 'Medium', description: ''
    });

    // ── Load data from API ──────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const [taskRes, facRes] = await Promise.all([getTasksAPI(), getFacultyAPI()]);
                setTasks(taskRes.data);
                // Only show faculty who are currently Free
                setFaculty(facRes.data.filter(f => getFacultyStatus(f.name) !== 'Busy'));
            } catch (err) {
                setError('Failed to load data.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const reloadTasks = async (status = filterStatus) => {
        const params = status !== 'All' ? { status } : {};
        const { data } = await getTasksAPI(params);
        setTasks(data);
    };

    // ── Modal ───────────────────────────────────────────────────────────────
    const handleOpenModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                assignedTo: task.assignedTo?._id || task.assignedTo,
                dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
                priority: task.priority,
                description: task.description || '',
            });
        } else {
            setEditingTask(null);
            setFormData({ title: '', assignedTo: '', dueDate: '', priority: 'Medium', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { setIsModalOpen(false); setEditingTask(null); };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingTask) {
                await updateTaskAPI(editingTask._id, formData);
            } else {
                await createTaskAPI(formData);
            }
            await reloadTasks();
            handleCloseModal();
            showToast(editingTask ? 'Task updated successfully' : 'Task created successfully', 'success');
        } catch (err) {
            showToast(err?.response?.data?.message || 'Action failed.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Delete Task?',
            message: 'Are you sure you want to delete this task? This action cannot be undone.',
            variant: 'danger',
            confirmText: 'Yes, Delete Task'
        });

        if (!isConfirmed) return;

        try {
            await deleteTaskAPI(id);
            setTasks(prev => prev.filter(t => t._id !== id));
            showToast('Task deleted successfully', 'success');
        } catch (err) {
            showToast('Delete failed.', 'error');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateTaskAPI(id, { status: newStatus });
            setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
            showToast(`Task marked as ${newStatus}`, 'success');
        } catch (err) {
            showToast('Status update failed.', 'error');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
            case 'Assigned':
            case 'Pending': return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
            case 'In Progress': return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
            case 'Verified': return { icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' };
            default: return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
        }
    };

    // Client-side filter
    const filteredTasks = filterStatus === 'All' ? tasks : tasks.filter(t => t.status === filterStatus);

    if (loading) return <div className="flex justify-center items-center h-96 text-gray-400">Loading tasks...</div>;
    if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Task Management</h1>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                        <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <select
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Verified">Verified</option>
                        </select>
                    </div>
                    <button onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap">
                        <Plus size={20} /> <span className="hidden sm:inline">New Task</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.length > 0 ? filteredTasks.map((task) => {
                    const style = getStatusStyle(task.status);
                    const StatusIcon = style.icon;
                    const assigneeName = task.assignedTo?.name || task.assignedTo || '—';
                    const dueDateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—';
                    return (
                        <div key={task._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(task)} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(task._id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                            </div>
                            <div className="flex justify-between items-start mb-4 pr-16">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-bold ${task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                    {task.priority}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{task.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{task.description || 'No description.'}</p>
                            <div className="mb-4">
                                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Assigned To</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                                        {assigneeName.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{assigneeName}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                    <Calendar size={14} /><span>{dueDateStr}</span>
                                </div>
                                <select
                                    className={`text-xs font-bold uppercase cursor-pointer bg-transparent outline-none ${style.color}`}
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                >
                                    <option value="Assigned">Assigned</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Verified">Verified</option>
                                </select>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p>No tasks found.</p>
                    </div>
                )}
            </div>

            {/* Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                                <input name="title" required value={formData.title} onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Grade Papers" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Task details..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                                    <select name="assignedTo" required value={formData.assignedTo} onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-primary-500 outline-none">
                                        <option value="">Select Faculty</option>
                                        {faculty.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">Busy faculty hidden</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                                    <input type="date" name="dueDate" required value={formData.dueDate} onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <div className="flex gap-4">
                                    {['Low', 'Medium', 'High'].map(p => (
                                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="priority" value={p} checked={formData.priority === p} onChange={handleInputChange} />
                                            <span className="text-sm text-gray-700">{p}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={submitting}
                                className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors mt-4 disabled:opacity-60">
                                {submitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;

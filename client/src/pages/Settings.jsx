import { useState, useEffect } from 'react';
import {
    User, Bell, Shield, Key, Save, Trash2, Plus,
    Mail, Smartphone, Laptop, LogOut, BookOpen,
    Search, GraduationCap, Building2, Users, AlertTriangle,
    Eye, EyeOff
} from 'lucide-react';
import { getCoursesAPI, addCourseAPI, deleteCourseAPI, getDepartmentsAPI, addDepartmentAPI, deleteDepartmentAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

// ── Dept badge colours ────────────────────────────────────────────────────────
const deptColors = {
    CS: 'bg-blue-100 text-blue-700',
    MATH: 'bg-purple-100 text-purple-700',
    PHY: 'bg-cyan-100 text-cyan-700',
    CHEM: 'bg-green-100 text-green-700',
    MECH: 'bg-orange-100 text-orange-700',
    EE: 'bg-yellow-100 text-yellow-700',
};
const getDeptColor = (dept) => deptColors[dept] || 'bg-gray-100 text-gray-700';

// ── Courses Section ───────────────────────────────────────────────────────────
const CoursesSection = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [courses, setCourses] = useState([]);
    const [departments, setDepts] = useState([]);   // loaded from DB
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        courseCode: '', name: '', department: '', credits: 3,
    });

    // ── Load ──────────────────────────────────────────────────────────────
    const load = async () => {
        try {
            setLoading(true);
            const { data } = await getCoursesAPI();
            setCourses(data);
        } catch {
            setError('Could not load courses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // Also load departments for the dropdown
        getDepartmentsAPI()
            .then(({ data }) => setDepts(data))
            .catch(() => { });
    }, []);

    // ── Add ───────────────────────────────────────────────────────────────
    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await addCourseAPI(form);
            setCourses(prev => [...prev, data]);
            setForm({ courseCode: '', name: '', department: '', credits: 3 });
            showToast(`✅ "${data.name}" added successfully`);
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to add course', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────
    const handleDelete = async (course) => {
        const isConfirmed = await confirm({
            title: `Delete "${course.name}"?`,
            message: `This will also remove all timetable slots that use this course. This action cannot be undone.`,
            variant: 'danger',
            confirmText: 'Yes, Delete Course'
        });

        if (!isConfirmed) return;

        try {
            const { data } = await deleteCourseAPI(course._id);
            setCourses(prev => prev.filter(c => c._id !== course._id));
            const extra = data.timetableSlotsRemoved > 0
                ? ` (${data.timetableSlotsRemoved} timetable slot${data.timetableSlotsRemoved > 1 ? 's' : ''} also removed)`
                : '';
            showToast(`"${course.name}" deleted successfully.${extra}`, 'success');
        } catch (err) {
            showToast(err?.response?.data?.message || 'Delete failed', 'error');
        }
    };

    const filtered = courses.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
        c.department.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Course Management</h2>
                <p className="text-sm text-gray-500 mt-1">Add or remove courses. Deleting a course also removes it from timetables.</p>
            </div>

            {/* ── Add Course Form ── */}
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Plus size={16} /> Add New Course
                </h3>
                <form onSubmit={handleAdd}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Course Code *</label>
                            <input
                                required
                                placeholder="e.g. CS101"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-white uppercase"
                                value={form.courseCode}
                                onChange={e => setForm(f => ({ ...f, courseCode: e.target.value }))}
                            />
                        </div>
                        <div className="sm:col-span-1 xl:col-span-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Course Name *</label>
                            <input
                                required
                                placeholder="e.g. Data Structures"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Department *</label>
                            <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                                value={form.department}
                                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                            >
                                <option value="">
                                    {departments.length === 0 ? 'No departments yet' : 'Select'}
                                </option>
                                {departments.map(d => (
                                    <option key={d._id} value={d.deptId}>
                                        {d.name} ({d.deptId})
                                    </option>
                                ))}
                            </select>
                            {departments.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    ⚠️ Add departments first in the <strong>Departments</strong> tab.
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Credits</label>
                            <input
                                type="number" min={1} max={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                                value={form.credits}
                                onChange={e => setForm(f => ({ ...f, credits: Number(e.target.value) }))}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors disabled:opacity-60"
                    >
                        <BookOpen size={16} />
                        {submitting ? 'Adding...' : 'Add Course'}
                    </button>
                </form>
            </div>

            {/* ── Course List ── */}
            <div>
                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-32 text-gray-400 text-sm">Loading courses...</div>
                ) : error ? (
                    <div className="text-red-500 text-sm p-4">{error}</div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <GraduationCap size={36} className="mb-2 text-gray-200" />
                        <p className="text-sm">{search ? 'No matching courses' : 'No courses added yet'}</p>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Code</th>
                                    <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Course Name</th>
                                    <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Department</th>
                                    <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Credits</th>
                                    <th className="px-5 py-3 text-right font-semibold text-gray-500 text-xs uppercase tracking-wide">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(course => (
                                    <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 px-2 py-1 rounded">
                                                {course.courseCode}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-medium text-gray-800">{course.name}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDeptColor(course.department)}`}>
                                                {course.department}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{course.credits} cr</td>
                                        <td className="px-5 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(course)}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                title="Delete course"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                            {filtered.length} course{filtered.length !== 1 ? 's' : ''} {search ? 'found' : 'total'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Departments Section ───────────────────────────────────────────────────────
const DepartmentsSection = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [depts, setDepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ deptId: '', name: '' });

    const load = async () => {
        try {
            setLoading(true);
            const { data } = await getDepartmentsAPI();
            setDepts(data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await addDepartmentAPI(form);
            setDepts(prev => [...prev, data]);
            setForm({ deptId: '', name: '' });
            showToast(`✅ "${data.name}" department added`);
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to add department', 'error');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (dept) => {
        const isConfirmed = await confirm({
            title: `Delete "${dept.name}"?`,
            message: `⚠️ This will permanently remove all related faculty, login accounts, courses, tasks & timetable slots. This action cannot be undone.`,
            variant: 'danger',
            confirmText: 'Yes, Delete Everything'
        });

        if (!isConfirmed) return;

        try {
            const { data } = await deleteDepartmentAPI(dept._id);
            setDepts(prev => prev.filter(d => d._id !== dept._id));
            const r = data.removed;
            showToast(`"${dept.name}" removed — ${r.faculty} faculty and ${r.courses} courses deleted.`, 'success');
        } catch (err) {
            showToast(err?.response?.data?.message || 'Delete failed', 'error');
        }
    };

    const filtered = depts.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.deptId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Department Management</h2>
                <p className="text-sm text-gray-500 mt-1">Add or remove departments. Deleting removes all related faculty, courses, tasks and timetable slots.</p>
            </div>

            {/* Add Form */}
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><Plus size={16} /> Add New Department</h3>
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-shrink-0">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Dept Code (short) *</label>
                        <input
                            required
                            placeholder="e.g. CS"
                            maxLength={8}
                            className="w-full sm:w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-white uppercase"
                            value={form.deptId}
                            onChange={e => setForm(f => ({ ...f, deptId: e.target.value }))}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Full Department Name *</label>
                        <input
                            required
                            placeholder="e.g. Computer Science"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit" disabled={submitting}
                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors disabled:opacity-60 whitespace-nowrap"
                        >
                            <Building2 size={16} />
                            {submitting ? 'Adding...' : 'Add Department'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div>
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                        type="text" placeholder="Search departments..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-32 text-gray-400 text-sm">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <Building2 size={36} className="mb-2 text-gray-200" />
                        <p className="text-sm">{search ? 'No matching departments' : 'No departments added yet'}</p>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department Name</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">HOD</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        <Users size={13} className="inline mr-1" />Faculty
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(dept => (
                                    <tr key={dept._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 px-2 py-1 rounded">
                                                {dept.deptId}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-medium text-gray-800">{dept.name}</td>
                                        <td className="px-5 py-3 text-gray-500 text-xs">{dept.hodName || '—'}</td>
                                        <td className="px-5 py-3 text-gray-600">{dept.totalFaculty}</td>
                                        <td className="px-5 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(dept)}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                title="Delete department"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                            {filtered.length} department{filtered.length !== 1 ? 's' : ''} {search ? 'found' : 'total'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Notification Preferences Section ──────────────────────────────────────────
const NotificationPreferences = () => {
    const { showToast } = useToast();
    const [prefs, setPrefs] = useState(() => {
        const saved = localStorage.getItem('notif_prefs');
        return saved ? JSON.parse(saved) : {
            emailTasks: true,
            dailySummary: false,
            taskReminders: true,
            meetingUpdates: true,
            systemAlerts: false
        };
    });

    const handleToggle = (key) => {
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);
        localStorage.setItem('notif_prefs', JSON.stringify(newPrefs));

        showToast('Preferences updated successfully.', 'success');
    };

    const items = [
        { key: 'emailTasks', label: 'Email alerts for new tasks', desc: 'Get notified via email whenever a new task is assigned.' },
        { key: 'dailySummary', label: 'Daily morning summary', desc: 'A consolidated list of today\'s tasks and meetings.' },
        { key: 'taskReminders', label: 'Task overdue reminders', desc: 'Automated pings when tasks approach their deadlines.' },
        { key: 'meetingUpdates', label: 'Meeting schedule updates', desc: 'Alerts for additions or changes to board meetings.' },
        { key: 'systemAlerts', label: 'System maintenance alerts', desc: 'Notifications about server maintenance or updates.' },
    ];

    return (
        <div className="space-y-6 max-w-xl">
            <div>
                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Notification Hub</h2>
                <p className="text-sm text-gray-500 mt-1">Configure how and when you want to receive system alerts.</p>
            </div>

            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all group">
                        <div className="flex-1 pr-4">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-slate-900">{item.label}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={prefs[item.key]}
                                onChange={() => handleToggle(item.key)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                        </label>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    <strong>Note:</strong> These settings are currently saved to your browser's local storage. Global server-side sync will be available in the next major update.
                </p>
            </div>
        </div>
    );
};

// ── Main Settings Page ────────────────────────────────────────────────────────
const Settings = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [activeTab, setActiveTab] = useState('departments');

    const [admins, setAdmins] = useState([
        { id: 1, name: 'Main Admin', email: 'admin@campusops.com', role: 'Super Admin' },
        { id: 2, name: 'Dean Office', email: 'dean@college.edu', role: 'Editor' },
    ]);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Admin' });
    const [twoFactor, setTwoFactor] = useState(() => localStorage.getItem('2fa_enabled') === 'true');
    const [collegeName, setCollegeName] = useState(() => localStorage.getItem('college_name') || 'CampusOps Institute of Technology');
    const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('admin_email') || 'admin@campusops.com');
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const tabs = [
        { id: 'departments', label: 'Departments', icon: Building2 },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'general', label: 'General', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'permissions', label: 'Roles & Permissions', icon: Key },
    ];

    const handleAddAdmin = (e) => {
        e.preventDefault();
        if (newAdmin.name && newAdmin.email) {
            setAdmins([...admins, { ...newAdmin, id: Date.now() }]);
            setNewAdmin({ name: '', email: '', role: 'Admin' });
        }
    };

    const handleDeleteAdmin = (id) => {
        if (confirm('Remove this admin?')) setAdmins(admins.filter(a => a.id !== id));
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        showToast('Password updated successful!', 'success');
        setPasswords({ current: '', new: '', confirm: '' });
    };

    const handleSaveGeneral = () => {
        localStorage.setItem('college_name', collegeName);
        localStorage.setItem('admin_email', adminEmail);
        showToast('General settings saved!', 'success');
    };

    const handleToggle2FA = () => {
        const newValue = !twoFactor;
        setTwoFactor(newValue);
        localStorage.setItem('2fa_enabled', newValue.toString());
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar */}
                <div className="w-full md:w-56 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-4 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">

                    {/* ── DEPARTMENTS ─────────────────────────────── */}
                    {activeTab === 'departments' && <DepartmentsSection />}

                    {/* ── COURSES ─────────────────────────────────── */}
                    {activeTab === 'courses' && <CoursesSection />}

                    {/* ── GENERAL ─────────────────────────────────── */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 max-w-2xl">
                            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Organization Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 outline-none" value={collegeName} onChange={e => setCollegeName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                                    <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 outline-none" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 outline-none h-24" defaultValue="123 University Ave, Silicon Valley, CA"></textarea>
                                </div>
                            </div>
                            <div className="flex items-center justify-end pt-2">
                                <button onClick={handleSaveGeneral} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── NOTIFICATIONS ───────────────────────────── */}
                    {activeTab === 'notifications' && (
                        <NotificationPreferences />
                    )}

                    {/* ── PERMISSIONS ─────────────────────────────── */}
                    {activeTab === 'permissions' && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Manage Admins</h2>
                                <p className="text-sm text-gray-500">Control who has access to the admin dashboard and their permission levels.</p>
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                            <tr>
                                                <th className="px-6 py-3">User</th>
                                                <th className="px-6 py-3">Role</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {admins.map(admin => (
                                                <tr key={admin.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">{admin.name.charAt(0)}</div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{admin.name}</p>
                                                                <p className="text-gray-500 text-xs">{admin.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{admin.role}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {admin.role !== 'Super Admin' && (
                                                            <button onClick={() => handleDeleteAdmin(admin.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200">
                                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={16} /> Invite New Admin</h3>
                                <form onSubmit={handleAddAdmin} className="flex flex-col md:flex-row gap-3">
                                    <input type="text" placeholder="Full Name" required className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-sm" value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} />
                                    <input type="email" placeholder="Email Address" required className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-sm" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} />
                                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-sm" value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}>
                                        <option value="Admin">Admin</option>
                                        <option value="Editor">Editor</option>
                                        <option value="Viewer">Viewer</option>
                                    </select>
                                    <button type="submit" className="bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium whitespace-nowrap">Send Invite</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ── SECURITY ────────────────────────────────── */}
                    {activeTab === 'security' && (
                        <div className="space-y-8 max-w-2xl">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">Change Password</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? "text" : "password"}
                                                className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
                                                value={passwords.current}
                                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('current')}
                                                className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? "text" : "password"}
                                                    className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
                                                    value={passwords.new}
                                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
                                                    value={passwords.confirm}
                                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">Update Password</button>
                                    </div>
                                </form>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">Two-Factor Authentication</h2>
                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600"><Smartphone size={24} /></div>
                                        <div>
                                            <p className="font-medium text-gray-900">Secure your account</p>
                                            <p className="text-sm text-gray-500">Enable 2FA via authenticator app</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={twoFactor} onChange={handleToggle2FA} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">Active Sessions</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Laptop size={20} className="text-green-700" />
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">Windows PC - Chrome</p>
                                                <p className="text-xs text-green-600">Current Session</p>
                                            </div>
                                        </div>
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Smartphone size={20} className="text-gray-400" />
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">iPhone - Safari</p>
                                                <p className="text-xs text-gray-500">2 hours ago</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-red-500 transition-colors"><LogOut size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;

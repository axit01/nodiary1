import { useState, useEffect, useMemo } from 'react';
import {
    Search, Plus, Edit2, Trash2, X, AlertTriangle,
    MoreVertical, Copy, CheckCheck, Mail, KeyRound,
    Smartphone, UserPlus, GraduationCap, Phone,
    BookOpen, ChevronRight, Filter, Users
} from 'lucide-react';
import { getFacultyStatus } from '../utils/scheduleUtils';
import {
    getFacultyAPI, addFacultyAPI, updateFacultyAPI,
    deleteFacultyAPI, getDepartmentsAPI, getCoursesAPI
} from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

// ── Invite Credential Card ────────────────────────────────────────────────────
const CredentialCard = ({ credentials, facultyName, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (!credentials) return null;

    const fullText =
        `🎓 CampusOps Faculty App Invite\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Name:     ${facultyName || 'Faculty'}\n` +
        `Email:    ${credentials.email}\n` +
        `Password: ${credentials.password}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Download the CampusOps Faculty App and log in with the above credentials.\n` +
        `Please change your password after first login.`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden scale-in-center border border-white/20">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <UserPlus size={180} className="absolute -right-10 -bottom-10" />
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                        <UserPlus size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Access Granted!</h2>
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Credentials for {(facultyName || '').split(' ')[0]}</p>
                </div>

                <div className={`flex items-center gap-3 px-6 py-4 text-xs font-bold uppercase tracking-tight ${credentials.emailSent ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} border-b border-gray-100`}>
                    <div className={`p-1.5 rounded-full ${credentials.emailSent ? 'bg-emerald-200/50' : 'bg-amber-200/50'}`}>
                        <Mail size={14} className="flex-shrink-0" />
                    </div>
                    {credentials.emailSent
                        ? <p>Invite email sent to <span className="underline">{credentials.email}</span></p>
                        : <p>Manual delivery required — email system offline</p>
                    }
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                <Mail size={18} className="text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</p>
                                <p className="font-bold text-slate-800 truncate">{credentials.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                <KeyRound size={18} className="text-slate-400" />
                            </div>
                            <div className="flex-1 relative group">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">One-Time Password</p>
                                <p className="font-mono font-black text-indigo-600 tracking-wider text-lg">
                                    {showPassword ? credentials.password : '••••••••'}
                                </p>
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[10px] leading-relaxed text-slate-500 font-medium text-center italic">
                            "Share these securely. The password is encrypted and only visible to you this one time."
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <button
                            onClick={handleCopy}
                            className={`w-full flex items-center justify-center gap-2 font-black py-4 rounded-2xl transition-all duration-300 shadow-lg ${copied
                                ? 'bg-emerald-500 text-white shadow-emerald-200'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200 active:scale-[0.98]'}`}
                        >
                            {copied ? <><CheckCheck size={20} /> Data Copied</> : <><Copy size={20} /> Copy Invitation</>}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full text-center text-xs font-black text-slate-400 hover:text-slate-900 py-2 uppercase tracking-widest transition-colors"
                        >
                            Finish Setup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Faculty Card Component ──────────────────────────────────────────────────
const FacultyCard = ({ faculty, onEdit, onDelete }) => {
    const [showOptions, setShowOptions] = useState(false);

    if (!faculty) return null;

    const statusConfig = {
        'Free': { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
        'Busy': { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' },
        'Meeting': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
        'Leave': { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
        'default': { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' }
    };

    const cfg = statusConfig[faculty.liveStatus] || statusConfig['default'];

    return (
        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group relative">
            <div className="flex justify-between items-start mb-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-white group-hover:scale-105 transition-transform">
                        {(faculty.name || '?').charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${cfg.dot} animate-pulse`}></div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 group-hover:text-slate-800"
                    >
                        <MoreVertical size={18} />
                    </button>
                    {showOptions && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)}></div>
                            <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={() => { onEdit(faculty); setShowOptions(false); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <Edit2 size={14} className="text-slate-400" /> Edit Profile
                                </button>
                                <button onClick={() => { onDelete(faculty._id); setShowOptions(false); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                    <Trash2 size={14} className="text-rose-400" /> Remove
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight truncate">{faculty.name || 'Unknown Faculty'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{faculty.designation || 'Staff'}</p>
            </div>

            <div className={`mt-4 w-fit px-3 py-1 rounded-full ${cfg.bg} ${cfg.text} text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                {faculty.liveStatus || 'Available'}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
                <div className="flex items-center gap-3 text-slate-500">
                    <Mail size={14} className="shrink-0" />
                    <span className="text-xs font-medium truncate">{faculty.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                    <Phone size={14} className="shrink-0" />
                    <span className="text-xs font-medium">{faculty.phone || 'No phone provided'}</span>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5">
                {(faculty.courses || []).slice(0, 3).map((code, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-400 text-[9px] font-black px-2 py-0.5 rounded-md border border-slate-100">
                        {code}
                    </span>
                ))}
                {faculty.courses?.length > 3 && (
                    <span className="text-[9px] font-black text-slate-300 px-1">+{faculty.courses.length - 3}</span>
                )}
            </div>
        </div>
    );
};

// ── Main Faculty Page ─────────────────────────────────────────────────────────
const Faculty = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [facultyMembers, setFacultyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [newCredentials, setNewCredentials] = useState(null);
    const [newFacultyName, setNewFacultyName] = useState('');
    const [departments, setDepartments] = useState([]);
    const [allCourses, setAllCourses] = useState([]);

    const [formData, setFormData] = useState({
        name: '', department: '', designation: '', email: '', phone: '', courses: [],
    });

    // ── Grouping Logic ───────────────────────────────────────────────────
    const groupedFaculty = useMemo(() => {
        const groups = {};

        // Initialize predefined departments
        if (Array.isArray(departments)) {
            departments.forEach(dept => {
                if (dept && dept.deptId) {
                    groups[dept.deptId] = {
                        name: dept.name || dept.deptId,
                        members: []
                    };
                }
            });
        }

        // Add "unassigned" as a fallback
        groups['unassigned'] = { name: 'Other Staff', members: [] };

        // Process faculty members
        if (Array.isArray(facultyMembers)) {
            facultyMembers.forEach(f => {
                if (!f) return;
                const deptId = f.department || 'unassigned';
                if (!groups[deptId]) {
                    groups[deptId] = { name: deptId, members: [] };
                }
                groups[deptId].members.push(f);
            });
        }

        return Object.entries(groups).filter(([id, data]) => {
            if (id === 'unassigned') return data.members.length > 0;
            return true;
        });
    }, [facultyMembers, departments]);

    // ── Load Dependencies ────────────────────────────────────────────────
    useEffect(() => {
        const loadInit = async () => {
            try {
                const [deptRes, courseRes] = await Promise.all([
                    getDepartmentsAPI(),
                    getCoursesAPI()
                ]);
                if (deptRes?.data) setDepartments(deptRes.data);
                if (courseRes?.data) setAllCourses(courseRes.data);
            } catch (err) { console.error('Failed to load faculty dependencies:', err); }
        };
        loadInit();
    }, []);

    const deptCourses = (formData.department && Array.isArray(allCourses))
        ? allCourses.filter(c => c.department === formData.department)
        : [];

    const toggleCourse = (code) => {
        setFormData(f => ({
            ...f,
            courses: f.courses.includes(code)
                ? f.courses.filter(c => c !== code)
                : [...f.courses, code],
        }));
    };

    // ── Data Management ──────────────────────────────────────────────────
    const loadFaculty = async (search = '') => {
        try {
            setLoading(true);
            const { data } = await getFacultyAPI(search ? { search } : {});
            if (Array.isArray(data)) {
                const enriched = data.map(f => ({
                    ...f,
                    liveStatus: getFacultyStatus(f.name) || 'Available'
                }));
                setFacultyMembers(enriched);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load faculty directory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadFaculty(); }, []);

    useEffect(() => {
        const t = setTimeout(() => loadFaculty(searchTerm), 400);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const handleOpenModal = (mode, faculty = null) => {
        setModalMode(mode);
        if (mode === 'edit' && faculty) {
            setFormData({
                name: faculty.name || '',
                department: faculty.department || '',
                designation: faculty.designation || '',
                email: faculty.email || '',
                phone: faculty.phone || '',
                courses: faculty.courses || []
            });
            setSelectedFaculty(faculty);
        } else {
            setFormData({ name: '', department: '', designation: '', email: '', phone: '', courses: [] });
            setSelectedFaculty(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (modalMode === 'add') {
                const { data } = await addFacultyAPI(formData);
                if (data.faculty) setNewFacultyName(data.faculty.name);
                if (data.credentials) setNewCredentials(data.credentials);
                await loadFaculty(searchTerm);
            } else {
                if (selectedFaculty?._id) {
                    await updateFacultyAPI(selectedFaculty._id, formData);
                    await loadFaculty(searchTerm);
                }
            }
            setIsModalOpen(false);
            showToast(modalMode === 'add' ? 'Faculty onboarded successfully!' : 'Profile updated successfully!', 'success');
        } catch (err) {
            showToast(err?.response?.data?.message || 'Action failed.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Delete Faculty Member?',
            message: 'This will permanently remove their profile and login access. This action cannot be undone.',
            variant: 'danger',
            confirmText: 'Yes, Remove Member'
        });

        if (!isConfirmed) return;

        try {
            await deleteFacultyAPI(id);
            setFacultyMembers(prev => prev.filter(f => f._id !== id));
            showToast('Faculty member removed successfully.', 'success');
        } catch (err) {
            showToast(err?.response?.data?.message || 'Delete failed.', 'error');
        }
    };

    return (
        <div className="space-y-10 pb-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="animate-in slide-in-from-left duration-500">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Faculty Directory <span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Organizing and managing teaching staff by department.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search directory..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all font-medium text-slate-600 placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal('add')}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 shrink-0"
                    >
                        <Plus size={20} />
                        <span className="font-bold text-sm hidden sm:block">Add Member</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 space-y-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Scanning Database</p>
                </div>
            ) : error ? (
                <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2rem] text-center max-w-lg mx-auto">
                    <AlertTriangle className="mx-auto text-rose-500 mb-4" size={40} />
                    <p className="text-rose-700 font-bold">{error}</p>
                    <button onClick={() => loadFaculty()} className="mt-4 text-xs font-black text-rose-600 underline uppercase tracking-tighter hover:text-rose-800 transition-colors">Try Manual Sync</button>
                </div>
            ) : (
                <div className="space-y-12">
                    {Array.isArray(groupedFaculty) && groupedFaculty.map(([deptId, data]) => (
                        <div key={deptId} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                                    <GraduationCap size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{data.name || deptId}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                        {data.members?.length || 0} Professional{data.members?.length !== 1 ? 's' : ''} Active
                                    </p>
                                </div>
                                <div className="flex-1 h-px bg-slate-100 ml-4"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {data.members?.length > 0 ? (
                                    data.members.map((faculty) => (
                                        <FacultyCard
                                            key={faculty._id}
                                            faculty={faculty}
                                            onEdit={() => handleOpenModal('edit', faculty)}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center grayscale opacity-40">
                                        <Users className="text-slate-200 mb-3" size={48} />
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No faculty in this cluster</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {facultyMembers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-gray-100 mx-auto max-w-2xl text-center shadow-sm">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <Users size={40} className="text-slate-200" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Search Result Empty</h2>
                            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">No faculty matches your criteria. Check the spelling or add a new entry.</p>
                            <button
                                onClick={() => { setSearchTerm(''); loadFaculty(''); }}
                                className="mt-6 text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-800 transition-colors"
                            >
                                Reset Directory View
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20 scale-in-center">
                        <div className="flex justify-between items-center p-8 bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {modalMode === 'add' ? 'Onboard Faculty' : 'Update Profile'}
                                </h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Teaching & Operations Personnel</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 p-2 rounded-xl transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                                    <input name="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 transition-all"
                                        placeholder="Dr. Alexander Wright" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Email</label>
                                    <input name="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 transition-all"
                                        placeholder="a.wright@campus.edu" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input name="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 transition-all"
                                        placeholder="+91 (0) 00000 00000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Rank</label>
                                    <select name="designation" required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700">
                                        <option value="">Select Designation</option>
                                        <option value="Professor">Professor</option>
                                        <option value="Associate Professor">Associate Professor</option>
                                        <option value="Assistant Professor">Assistant Professor</option>
                                        <option value="Lecturer">Lecturer</option>
                                        <option value="Lab Instructor">Lab Instructor</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Department</label>
                                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {Array.isArray(departments) && departments.map(d => (
                                            <button
                                                key={d._id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, department: d.deptId, courses: [] })}
                                                className={`px-4 py-3 rounded-2xl border-2 text-xs font-black transition-all ${formData.department === d.deptId
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                    : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                {d.deptId}
                                            </button>
                                        ))}
                                    </div>
                                    {(!departments || departments.length === 0) && (
                                        <p className="text-[10px] text-amber-600 font-bold mt-2 italic px-1">⚠️ No departments found. Configure them in Settings first.</p>
                                    )}
                                </div>
                            </div>

                            {formData.department && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Courses ({deptCourses.length})</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {deptCourses.map(course => (
                                            <button
                                                key={course._id}
                                                type="button"
                                                onClick={() => toggleCourse(course.courseCode)}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${formData.courses.includes(course.courseCode)
                                                    ? 'border-slate-900 bg-slate-950 text-white shadow-xl shadow-slate-200 scale-[1.02]'
                                                    : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-100'}`}
                                            >
                                                <div className={`p-2 rounded-xl ${formData.courses.includes(course.courseCode) ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                                                    <BookOpen size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold truncate">{course.name}</p>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest opacity-60`}>{course.courseCode}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {deptCourses.length === 0 && (
                                        <p className="text-[10px] text-amber-600 font-bold mt-1 italic px-1">⚠️ No courses available for this department.</p>
                                    )}
                                </div>
                            )}

                            {modalMode === 'add' && (
                                <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden group shadow-2xl shadow-indigo-100">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-black text-lg">Auto-Account Creation</h4>
                                            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-1">Credentials will be generated instantly</p>
                                        </div>
                                        <KeyRound size={32} className="opacity-40 group-hover:rotate-12 transition-transform" />
                                    </div>
                                    <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-2xl"></div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 bg-slate-50 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-colors">
                                    Dismiss
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50">
                                    {submitting ? 'Processing...' : modalMode === 'add' ? 'Confirm Onboarding' : 'Sync Profile Updates'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Invitation Sheet */}
            {newCredentials && (
                <CredentialCard
                    credentials={newCredentials}
                    facultyName={newFacultyName}
                    onClose={() => setNewCredentials(null)}
                />
            )}
        </div>
    );
};

export default Faculty;

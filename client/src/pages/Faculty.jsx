import { useState, useEffect, useMemo } from 'react';
import {
    Search, Plus, Edit2, Trash2, X, AlertTriangle,
    MoreVertical, Copy, CheckCheck, Mail, KeyRound,
    Smartphone, UserPlus, GraduationCap, Phone,
    BookOpen, ChevronRight, Filter, Users, Eye, EyeOff
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
        'Free': { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
        'Busy': { bg: 'bg-rose-500/10', text: 'text-rose-600', dot: 'bg-rose-500' },
        'Meeting': { bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500' },
        'Leave': { bg: 'bg-slate-500/10', text: 'text-slate-500', dot: 'bg-slate-400' },
        'default': { bg: 'bg-indigo-500/10', text: 'text-indigo-600', dot: 'bg-indigo-500' }
    };

    const cfg = statusConfig[faculty.liveStatus] || statusConfig['default'];

    return (
        <div className="cool-card p-6 group relative transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-2xl shadow-lg group-hover:scale-105 transition-transform">
                        {(faculty.name || '?').charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${cfg.dot} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}></div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"
                    >
                        <MoreVertical size={18} />
                    </button>
                    {showOptions && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)}></div>
                            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={() => { onEdit(faculty); setShowOptions(false); }} className="w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                    <Edit2 size={14} className="text-slate-400" /> Edit Profile
                                </button>
                                <button onClick={() => { onDelete(faculty._id); setShowOptions(false); }} className="w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 flex items-center gap-3">
                                    <Trash2 size={14} className="text-rose-400" /> Remove Identity
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight truncate">{faculty.name || 'Unknown Faculty'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{faculty.designation || 'Staff'}</p>
            </div>

            <div className={`mt-5 w-fit px-3 py-1.5 rounded-xl ${cfg.bg} ${cfg.text} text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2 border border-white/50 shadow-sm`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`}></span>
                {faculty.liveStatus || 'Available'}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 space-y-3.5">
                <div className="flex items-center gap-3.5 text-slate-500 group/item cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-500 transition-colors">
                        <Mail size={14} />
                    </div>
                    <span className="text-[11px] font-bold truncate tracking-wide">{faculty.email || 'No institutional email'}</span>
                </div>
                <div className="flex items-center gap-3.5 text-slate-500 group/item cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-emerald-50 group-hover/item:text-emerald-500 transition-colors">
                        <Phone size={14} />
                    </div>
                    <span className="text-[11px] font-bold tracking-wide">{faculty.phone || 'No phone record'}</span>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {(faculty.courses || []).slice(0, 3).map((code, idx) => (
                    <span key={idx} className="bg-slate-100/50 text-slate-500 text-[9px] font-black px-2.5 py-1 rounded-lg border border-slate-200/50 uppercase tracking-tighter">
                        {code}
                    </span>
                ))}
                {faculty.courses?.length > 3 && (
                    <span className="text-[9px] font-black text-slate-300 px-1 self-center">+{faculty.courses.length - 3}</span>
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

    const groupedFaculty = useMemo(() => {
        const groups = {};
        if (Array.isArray(departments)) {
            departments.forEach(dept => {
                if (dept && dept.deptId) {
                    groups[dept.deptId] = { name: dept.name || dept.deptId, members: [] };
                }
            });
        }
        groups['unassigned'] = { name: 'Operations & Other', members: [] };

        if (Array.isArray(facultyMembers)) {
            facultyMembers.forEach(f => {
                if (!f) return;
                const deptId = f.department || 'unassigned';
                if (!groups[deptId]) groups[deptId] = { name: deptId, members: [] };
                groups[deptId].members.push(f);
            });
        }

        return Object.entries(groups).filter(([id, data]) => {
            if (id === 'unassigned') return data.members.length > 0;
            return true;
        });
    }, [facultyMembers, departments]);

    useEffect(() => {
        const loadInit = async () => {
            try {
                const [deptRes, courseRes] = await Promise.all([getDepartmentsAPI(), getCoursesAPI()]);
                if (deptRes?.data) setDepartments(deptRes.data);
                if (courseRes?.data) setAllCourses(courseRes.data);
            } catch (err) { console.error(err); }
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
            setError('System failed to sync directory.');
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
            showToast(modalMode === 'add' ? 'Personnel initialized locally.' : 'Master record updated.', 'success');
        } catch (err) {
            showToast(err?.response?.data?.message || 'Transaction failed.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Decommission Staff?',
            message: 'Are you sure you want to remove this record from the cluster?',
            variant: 'danger',
            confirmText: 'Yes, Decommission'
        });
        if (!isConfirmed) return;
        try {
            await deleteFacultyAPI(id);
            setFacultyMembers(prev => prev.filter(f => f._id !== id));
            showToast('Identity purged successfully.', 'success');
        } catch (err) {
            showToast(err?.response?.data?.message || 'Purge failed.', 'error');
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                <div className="max-w-2xl">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                        Staff <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Registry</span>
                    </h1>
                    <p className="text-slate-500 font-semibold text-lg mt-4 leading-relaxed">Centralized personnel management for all academic departments and operations staff.</p>
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Filter by name or identity..."
                            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-xl shadow-slate-200/50 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal('add')}
                        className="cool-button h-[64px] px-8 bg-[#0F172A] text-white rounded-[1.5rem] shadow-2xl shadow-slate-200 flex items-center gap-3 hover:bg-slate-800"
                    >
                        <Plus size={22} className="stroke-[3px]" />
                        <span className="font-black text-xs uppercase tracking-widest hidden sm:block">Onboard Staff</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 space-y-6">
                    <div className="w-16 h-16 border-[5px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Scanning Registry</p>
                </div>
            ) : (
                <div className="space-y-20">
                    {Array.isArray(groupedFaculty) && groupedFaculty.map(([deptId, data]) => (
                        <div key={deptId} className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-center gap-6">
                                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-xl shadow-indigo-100">
                                    <GraduationCap size={24} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">{data.name || deptId}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {data.members?.length || 0} Registered Personnel
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden sm:block h-[1px] flex-[2] bg-slate-100"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                                    <div className="col-span-full py-20 border-4 border-dashed border-slate-50 rounded-[3rem] flex flex-col items-center justify-center grayscale opacity-30">
                                        <Users className="text-slate-200 mb-4" size={56} />
                                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.25em]">Cluster Empty</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20 scale-in-center">
                        <div className="flex justify-between items-center p-10 bg-slate-50/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {modalMode === 'add' ? 'Personnel Onboarding' : 'Record Management'}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 leading-none">Identity Verification & Access Control</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="relative z-10 w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto custom-scrollbar bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                                    <input name="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-400 outline-none font-bold text-slate-700 transition-all shadow-inner"
                                        placeholder="Alexander J. Wright" />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Endpoint</label>
                                    <input name="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-400 outline-none font-bold text-slate-700 transition-all shadow-inner"
                                        placeholder="a.wright@campus.edu" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Connectivity</label>
                                    <input name="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-400 outline-none font-bold text-slate-700 transition-all shadow-inner"
                                        placeholder="+91 (0) 0000 00000" />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organizational Level</label>
                                    <select name="designation" required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-400 font-bold text-slate-700 transition-all shadow-inner appearance-none">
                                        <option value="">Select Clear Level</option>
                                        <option value="Professor">Professor</option>
                                        <option value="Associate Professor">Associate Professor</option>
                                        <option value="Assistant Professor">Assistant Professor</option>
                                        <option value="Lecturer">Lecturer</option>
                                        <option value="Lab Instructor">Lab Instructor</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-5 pt-6 border-t border-slate-50">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Departmental Node</label>
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {Array.isArray(departments) && departments.map(d => (
                                            <button
                                                key={d._id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, department: d.deptId, courses: [] })}
                                                className={`px-5 py-4 rounded-2xl border-2 text-[11px] font-black transition-all uppercase tracking-tighter ${formData.department === d.deptId
                                                    ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200'
                                                    : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                {d.deptId}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {formData.department && (
                                <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Knowledge Domains ({deptCourses.length})</label>
                                    <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pr-2 custom-scrollbar">
                                        {deptCourses.map(course => (
                                            <button
                                                key={course._id}
                                                type="button"
                                                onClick={() => toggleCourse(course.courseCode)}
                                                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group/item ${formData.courses.includes(course.courseCode)
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100'
                                                    : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.courses.includes(course.courseCode) ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white shadow-sm text-slate-400 group-hover/item:text-indigo-400'}`}>
                                                    <BookOpen size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-black uppercase truncate tracking-tight">{course.name}</p>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest opacity-60 mt-0.5`}>{course.courseCode}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-5 pt-6 pb-2">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="px-10 py-5 bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] rounded-[1.25rem] hover:bg-slate-100 hover:text-slate-600 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 px-10 py-5 bg-[#0F172A] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-[1.25rem] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50">
                                    {submitting ? 'Executing Command...' : modalMode === 'add' ? 'Confirm Onboarding' : 'Sync Master Record'}
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

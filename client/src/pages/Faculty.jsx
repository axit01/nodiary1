import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { getFacultyStatus } from '../utils/scheduleUtils';

const Faculty = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Mock Data State
    const [facultyMembers, setFacultyMembers] = useState([
        { id: 1, name: 'Dr. John Doe', department: 'Computer Science', designation: 'Professor', email: 'john@college.edu', status: getFacultyStatus('Dr. John Doe') },
        { id: 2, name: 'Prof. Jane Smith', department: 'Mathematics', designation: 'Asst. Professor', email: 'jane@college.edu', status: getFacultyStatus('Prof. Jane Smith') },
        { id: 3, name: 'Dr. Emily Brown', department: 'Physics', designation: 'Assoc. Professor', email: 'emily@college.edu', status: getFacultyStatus('Dr. Emily Brown') },
        { id: 4, name: 'Mr. Michael Johnson', department: 'Chemistry', designation: 'Lecturer', email: 'michael@college.edu', status: getFacultyStatus('Mr. Michael Johnson') },
        { id: 5, name: 'Dr. Sarah Wilson', department: 'Biology', designation: 'Professor', email: 'sarah@college.edu', status: getFacultyStatus('Dr. Sarah Wilson') },
    ]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        designation: '',
        email: '',

    });

    const handleOpenModal = (mode, faculty = null) => {
        setModalMode(mode);
        if (mode === 'edit' && faculty) {
            setFormData(faculty);
            setSelectedFaculty(faculty.id);
        } else {
            setFormData({ name: '', department: '', designation: '', email: '' });
            setSelectedFaculty(null);
        }
        setIsModalOpen(true);
        setActiveDropdown(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', department: '', designation: '', email: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            const newId = Math.max(...facultyMembers.map(f => f.id)) + 1;
            setFacultyMembers([...facultyMembers, { ...formData, id: newId, status: getFacultyStatus(formData.name) }]);
        } else {
            setFacultyMembers(facultyMembers.map(f => (f.id === selectedFaculty ? { ...formData, id: selectedFaculty, status: getFacultyStatus(formData.name) } : f)));
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this faculty member?')) {
            setFacultyMembers(facultyMembers.filter(f => f.id !== id));
        }
        setActiveDropdown(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Free': return 'bg-green-100 text-green-700';
            case 'Busy': return 'bg-red-100 text-red-700';
            case 'Meeting': return 'bg-yellow-100 text-yellow-700';
            case 'Leave': return 'bg-gray-100 text-gray-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const filteredFaculty = facultyMembers.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Faculty Management</h1>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Faculty</span>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search faculty by name, email, or dept..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Faculty List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">ID</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Department</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Designation</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFaculty.length > 0 ? filteredFaculty.map((faculty) => (
                                <tr key={faculty.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                                                {faculty.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{faculty.name}</p>
                                                <p className="text-sm text-gray-500">{faculty.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm font-mono">FAC-{faculty.id + 100}</td>
                                    <td className="px-6 py-4 text-gray-600">{faculty.department}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                            {faculty.designation}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(faculty.status)}`}>
                                            {faculty.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === faculty.id ? null : faculty.id); }}
                                            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeDropdown === faculty.id && (
                                            <div className="absolute right-8 top-8 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                <button
                                                    onClick={() => handleOpenModal('edit', faculty)}
                                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Edit2 size={16} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(faculty.id)}
                                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertTriangle className="text-gray-300" size={48} />
                                            <p className="text-lg font-medium">No faculty members found</p>
                                            <p className="text-sm">Try adjusting your search terms</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {activeDropdown && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActiveDropdown(null)}></div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">{modalMode === 'add' ? 'Add New Faculty' : 'Edit Faculty Details'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. Dr. John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. john@college.edu"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                    >
                                        <option value="">Select Dept</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Physics">Physics</option>
                                        <option value="Chemistry">Chemistry</option>
                                        <option value="Biology">Biology</option>
                                        <option value="English">English</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                    <select
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                    >
                                        <option value="">Select Role</option>
                                        <option value="Professor">Professor</option>
                                        <option value="Assoc. Professor">Assoc. Professor</option>
                                        <option value="Asst. Professor">Asst. Professor</option>
                                        <option value="Lecturer">Lecturer</option>
                                        <option value="Lab Instructor">Lab Instructor</option>
                                    </select>
                                </div>
                            </div>



                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors shadow-lg shadow-slate-500/20"
                                >
                                    {modalMode === 'add' ? 'Add Faculty' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Faculty;

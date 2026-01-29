import { useState } from 'react';
import { User, Bell, Shield, Key, Save, Trash2, Plus, Mail, Smartphone, Laptop, LogOut } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');

    // Mock Admins Data
    const [admins, setAdmins] = useState([
        { id: 1, name: 'Main Admin', email: 'admin@campusops.com', role: 'Super Admin' },
        { id: 2, name: 'Dean Office', email: 'dean@college.edu', role: 'Editor' },
    ]);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Admin' });

    // Mock Security Data
    const [twoFactor, setTwoFactor] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    const tabs = [
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
        if (confirm('Remove this admin?')) {
            setAdmins(admins.filter(a => a.id !== id));
        }
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        alert('Password update simulation successful!');
        setPasswords({ current: '', new: '', confirm: '' });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-4">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-8">
                    {activeTab === 'general' && (
                        <div className="space-y-6 max-w-2xl">
                            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Organization Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" defaultValue="Tech Institute of Science" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                                    <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" defaultValue="admin@campusops.com" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none h-24" defaultValue="123 University Ave, Silicon Valley, CA"></textarea>
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-4">
                                <button className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 max-w-xl">
                            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Notification Preferences</h2>
                            <div className="space-y-4">
                                {['Email alerts for new tasks', 'Daily morning summary', 'Task overdue reminders', 'Meeting schedule updates'].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-2">
                                        <span className="text-gray-700">{item}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={i % 2 === 0} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                                                                {admin.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{admin.name}</p>
                                                                <p className="text-gray-500 text-xs">{admin.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {admin.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {admin.role !== 'Super Admin' && (
                                                            <button
                                                                onClick={() => handleDeleteAdmin(admin.id)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200">
                                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Plus size={16} /> Invite New Admin
                                </h3>
                                <form onSubmit={handleAddAdmin} className="flex flex-col md:flex-row gap-4">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        required
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                        value={newAdmin.name}
                                        onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        required
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                        value={newAdmin.email}
                                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    />
                                    <select
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                        value={newAdmin.role}
                                        onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Editor">Editor</option>
                                        <option value="Viewer">Viewer</option>
                                    </select>
                                    <button
                                        type="submit"
                                        className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium whitespace-nowrap"
                                    >
                                        Send Invite
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 max-w-2xl">
                            {/* Password Change */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">Change Password</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={passwords.current}
                                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                            <input
                                                type="password"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                                value={passwords.new}
                                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                                value={passwords.confirm}
                                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">Update Password</button>
                                    </div>
                                </form>
                            </div>

                            {/* Two-Factor Auth */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">Two-Factor Authentication</h2>
                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                                            <Smartphone size={24} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Secure your account</p>
                                            <p className="text-sm text-gray-500">Enable 2FA via authenticator app</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={twoFactor}
                                            onChange={() => setTwoFactor(!twoFactor)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Active Sessions */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">Active Sessions</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Laptop size={20} className="text-green-700" />
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">Windows PC - Chrome</p>
                                                <p className="text-xs text-brand-600">New York, USA • Current Session</p>
                                            </div>
                                        </div>
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Smartphone size={20} className="text-gray-500" />
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">iPhone 13 - Safari</p>
                                                <p className="text-xs text-gray-500">New York, USA • 2 hours ago</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                                            <LogOut size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(activeTab !== 'general' && activeTab !== 'notifications' && activeTab !== 'permissions' && activeTab !== 'security') && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Shield size={48} className="mb-4 text-gray-200" />
                            <p className="text-lg">This section is under development.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;

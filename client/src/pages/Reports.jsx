import { Download, FileText, PieChart, TrendingUp } from 'lucide-react';

const Reports = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
                <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                    <Download size={20} />
                    <span>Export All</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-48 hover:border-blue-200 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">Monthly Workload</h3>
                            <p className="text-sm text-gray-500 mt-1">Faculty hours summary</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <button className="text-blue-600 font-medium text-sm flex items-center gap-1 mt-auto">
                        Download PDF <Download size={16} />
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-48 hover:border-green-200 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">Task Completion</h3>
                            <p className="text-sm text-gray-500 mt-1">Department performance</p>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircleIcon size={24} />
                        </div>
                    </div>
                    <button className="text-green-600 font-medium text-sm flex items-center gap-1 mt-auto">
                        Download CSV <Download size={16} />
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-48 hover:border-purple-200 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">Attendance Report</h3>
                            <p className="text-sm text-gray-500 mt-1">Meeting participation</p>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <PieChart size={24} />
                        </div>
                    </div>
                    <button className="text-purple-600 font-medium text-sm flex items-center gap-1 mt-auto">
                        Download Excel <Download size={16} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Generated Reports</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-4">
                                <FileText className="text-gray-400" size={24} />
                                <div>
                                    <h4 className="font-medium text-gray-900">Faculty_Workload_Report_Jan_2026.pdf</h4>
                                    <p className="text-xs text-gray-500">Generated on Jan {16 - i}, 2026</p>
                                </div>
                            </div>
                            <button className="text-gray-500 hover:text-gray-900">
                                <Download size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper icon
const CheckCircleIcon = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;

export default Reports;

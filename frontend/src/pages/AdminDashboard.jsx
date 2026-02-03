import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LayoutDashboard, Database, Users, Calendar, LogOut, GraduationCap, Menu, X, FileText, Pencil, Trash2, Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("exams");
    const { logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
        setIsMobileMenuOpen(false); // Close mobile menu if open
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    const menuItems = [
        { id: "exams", label: "Exam Setup", icon: FileText },
        { id: "strength", label: "Dept Strength", icon: Database },
        { id: "bookings", label: "View Bookings", icon: Calendar },
        { id: "students", label: "Student Data", icon: Users },
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-sans">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 bg-gradient-to-b from-purple-50 to-indigo-50 border-r-2 border-r-purple-200 flex-col fixed h-full z-10">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-purple-200">A</div>
                    <span className="font-bold text-xl tracking-tight">Admin <span className="text-purple-600">Panel</span></span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200"
                                : "text-gray-600 hover:bg-purple-100"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100 transition-colors">
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 w-full bg-white border-b z-20 px-6 py-4 flex justify-between items-center">
                <span className="font-bold text-lg">Admin Panel</span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-white z-10 pt-20 px-6 space-y-4">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-bold ${activeTab === item.id ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white" : "text-gray-600"
                                }`}
                        >
                            <item.icon className="h-6 w-6" />
                            {item.label}
                        </button>
                    ))}
                    <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-4 text-red-600 font-bold">
                        <LogOut className="h-6 w-6" /> Logout
                    </button>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <LogOut className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Confirm Logout</h3>
                            <p className="text-gray-500 mt-2">Are you sure you want to end your session?</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setShowLogoutConfirm(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" className="flex-1" onClick={confirmLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-6 md:p-10 pt-20 md:pt-10 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h1>
                        <p className="text-gray-500 font-medium">Manage your examination system efficiently.</p>
                    </header>

                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 min-h-[500px]">
                        {activeTab === "exams" && <ExamManager />}
                        {activeTab === "strength" && <DeptStrengthManager />}
                        {activeTab === "bookings" && <BookingViewer />}
                        {activeTab === "students" && <StudentDataManager />}
                    </div>
                </div>
            </main>
        </div>
    );
}

function SlotManager() {
    const [slots, setSlots] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingSlotId, setEditingSlotId] = useState(null);
    const [distributeCount, setDistributeCount] = useState(1);
    const [strengths, setStrengths] = useState([]);
    const [formData, setFormData] = useState({ examDate: "", startTime: "", endTime: "", category: "DAY", purpose: "", quotas: [] });

    useEffect(() => { loadSlots(); loadDepartments(); }, []);
    const loadSlots = async () => { const res = await axios.get("/api/admin/slots"); setSlots(res.data); };
    const loadDepartments = async () => {
        try { const [d, s] = await Promise.all([axios.get("/api/admin/departments"), axios.get("/api/admin/strength")]); setDepartments(d.data); setStrengths(s.data); } catch (e) { }
    };
    const handleQuotaChange = (deptId, value) => {
        const newQuotas = formData.quotas.filter(q => q.deptId !== deptId);
        if (value) newQuotas.push({ deptId, quota: parseInt(value) });
        setFormData({ ...formData, quotas: newQuotas });
    };
    const handleAutoCalculate = () => {
        if (distributeCount < 1) return;
        const newQuotas = [];
        departments.forEach(dept => {
            const str = strengths.find(s => s.department?.deptId === dept.deptId);
            if (str) {
                let total = formData.category === "DAY" ? str.dayCount : formData.category === "HOSTEL_MALE" ? str.hostelMaleCount : str.hostelFemaleCount;
                const q = Math.floor(total / distributeCount);
                if (q > 0) newQuotas.push({ deptId: dept.deptId, quota: q });
            }
        });
        setFormData({ ...formData, quotas: newQuotas });
    };
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            if (editingSlotId) { await axios.put(`/api/admin/slots/${editingSlotId}`, formData); setEditingSlotId(null); }
            else { await axios.post("/api/admin/slots", formData); }
            loadSlots(); setFormData({ ...formData, examDate: "", startTime: "", endTime: "", purpose: "", quotas: [] }); alert("Success");
        } catch (err) { alert("Error: " + err.message); } finally { setLoading(false); }
    };
    const handleEdit = (slot) => {
        setFormData({ ...formData, examDate: slot.examDate, startTime: slot.startTime, endTime: slot.endTime, category: slot.category, purpose: slot.purpose || "", quotas: [] });
        setEditingSlotId(slot.slotId);
    };
    const handleToggle = async (id) => { await axios.patch(`/api/admin/slots/${id}/toggle`); loadSlots(); };
    const handleDelete = async (id) => { if (confirm("Delete?")) { try { await axios.delete(`/api/admin/slots/${id}`); loadSlots(); } catch (e) { alert("Failed"); } } };

    return (
        <div className="space-y-10">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold mb-6">Create / Edit Slot</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Date</label><Input type="date" value={formData.examDate} onChange={e => setFormData({ ...formData, examDate: e.target.value })} required /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Category</label><select className="flex h-10 w-full rounded-md border bg-white px-3" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}><option value="DAY">DAY</option><option value="HOSTEL_MALE">HOSTEL MALE</option><option value="HOSTEL_FEMALE">HOSTEL FEMALE</option></select></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Start</label><Input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">End</label><Input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required /></div>
                    <div className="col-span-2 space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Title</label><Input placeholder="e.g. Test 1" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} /></div>

                    <div className="col-span-2 pt-4 border-t">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-sm">Quotas (Total: {formData.quotas.reduce((a, b) => a + (b.quota || 0), 0)})</span>
                            <div className="flex gap-2 items-center"><span className="text-xs">Distribute over:</span><Input type="number" className="w-16 h-8" value={distributeCount} onChange={e => setDistributeCount(e.target.value)} /><Button type="button" size="sm" variant="secondary" onClick={handleAutoCalculate}>Auto-Fill</Button></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {departments.map(d => (
                                <div key={d.deptId}><label className="text-xs font-bold block mb-1">{d.deptCode}</label><Input type="number" placeholder="0" value={formData.quotas.find(q => q.deptId === d.deptId)?.quota || ""} onChange={e => handleQuotaChange(d.deptId, e.target.value)} /></div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-2"><Button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-800">{loading ? "Saving..." : (editingSlotId ? "Update Slot" : "Create Slot")}</Button>{editingSlotId && <Button type="button" variant="outline" className="w-full mt-2" onClick={() => setEditingSlotId(null)}>Cancel</Button>}</div>
                </form>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {slots.map(s => (
                    <div key={s.slotId} className="flex justify-between items-center p-4 border rounded-xl hover:shadow-md transition-shadow">
                        <div><h4 className="font-bold">{s.purpose || "Slot"}</h4><p className="text-sm text-gray-500">{s.examDate} • {s.startTime}-{s.endTime} • <span className="font-mono text-xs bg-gray-100 px-1 rounded">{s.category}</span></p></div>
                        <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => handleEdit(s)}>Edit</Button><Button size="sm" variant={s.bookingOpen ? "secondary" : "default"} onClick={() => handleToggle(s.slotId)}>{s.bookingOpen ? "Close" : "Open"}</Button><Button size="sm" variant="destructive" onClick={() => handleDelete(s.slotId)}>Delete</Button></div>
                    </div>
                ))}
            </div>
        </div>
    );
}


function DeptStrengthManager() {
    const [strengths, setStrengths] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadStrengths(); }, []);

    const loadStrengths = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/admin/student-master/strength");
            setStrengths(res.data);
        } catch (e) {
            console.error("Failed to load strengths", e);
        } finally {
            setLoading(false);
        }
    };

    const totalDay = strengths.reduce((sum, s) => sum + (s.dayCount || 0), 0);
    const totalHostelM = strengths.reduce((sum, s) => sum + (s.hostelMaleCount || 0), 0);
    const totalHostelF = strengths.reduce((sum, s) => sum + (s.hostelFemaleCount || 0), 0);
    const grandTotal = totalDay + totalHostelM + totalHostelF;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold">Department Strength (Auto-Calculated)</h3>
                    <p className="text-sm text-gray-500">Calculated from uploaded student master data.</p>
                </div>
                <Button onClick={loadStrengths} disabled={loading} variant="outline">
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Refresh"}
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                    <span className="text-blue-600 font-medium text-sm">Day Scholars</span>
                    <p className="font-black text-2xl text-blue-700">{totalDay}</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100 text-center">
                    <span className="text-cyan-600 font-medium text-sm">Hostel Boys</span>
                    <p className="font-black text-2xl text-cyan-700">{totalHostelM}</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 text-center">
                    <span className="text-pink-600 font-medium text-sm">Hostel Girls</span>
                    <p className="font-black text-2xl text-pink-700">{totalHostelF}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-center">
                    <span className="text-gray-600 font-medium text-sm">Grand Total</span>
                    <p className="font-black text-2xl text-gray-800">{grandTotal}</p>
                </div>
            </div>

            {strengths.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
                    No student data uploaded yet. Upload master Excel in "Student Data" section.
                </div>
            ) : (
                <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-700 font-bold">
                            <tr>
                                <th className="p-3">Department</th>
                                <th className="p-3 text-center">Day Scholars</th>
                                <th className="p-3 text-center">Hostel Boys</th>
                                <th className="p-3 text-center">Hostel Girls</th>
                                <th className="p-3 text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {strengths.map((s, idx) => (
                                <tr key={idx} className="border-t hover:bg-gray-50">
                                    <td className="p-3 font-bold">{s.deptCode}</td>
                                    <td className="p-3 text-center">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">{s.dayCount}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded font-bold">{s.hostelMaleCount}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded font-bold">{s.hostelFemaleCount}</span>
                                    </td>
                                    <td className="p-3 text-center font-black">{s.total}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-bold">
                            <tr className="border-t-2 border-gray-300">
                                <td className="p-3">TOTAL</td>
                                <td className="p-3 text-center text-blue-700">{totalDay}</td>
                                <td className="p-3 text-center text-cyan-700">{totalHostelM}</td>
                                <td className="p-3 text-center text-pink-700">{totalHostelF}</td>
                                <td className="p-3 text-center text-gray-800">{grandTotal}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
}

function BookingViewer() {
    const [bookings, setBookings] = useState([]);
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [filterDate, setFilterDate] = useState("ALL");
    const [filterTime, setFilterTime] = useState("ALL");

    useEffect(() => {
        axios.get("/api/admin/bookings").then(res => {
            console.log("Bookings Data:", res.data); // Debugging
            setBookings(res.data);
        });
    }, []);

    const formatDate = (dateVal) => {
        if (!dateVal) return "";
        if (Array.isArray(dateVal)) {
            // Handle [year, month, day] format
            const [y, m, d] = dateVal;
            return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
        return dateVal;
    };

    // Extract unique dates and times for filters
    const uniqueDates = [...new Set(bookings.map(b => {
        const d = b.slot?.examDate || b.examQuota?.exam?.startingDate;
        return formatDate(d);
    }).filter(Boolean))].sort();

    const uniqueTimes = [...new Set(bookings.map(b => b.slot?.startTime).filter(Boolean))].sort();

    // Filter logic
    const filteredBookings = bookings.filter(b => {
        const matchCategory = filterCategory === "ALL" ||
            (b.slot?.category === filterCategory) ||
            (b.examQuota && b.examQuota.categoryType === (filterCategory === 'DAY' ? 1 : filterCategory === 'HOSTEL_MALE' ? 2 : 3));

        const rawDate = b.slot?.examDate || b.examQuota?.exam?.startingDate;
        const dateStr = formatDate(rawDate);
        const matchDate = filterDate === "ALL" || (dateStr === filterDate);

        const time = b.slot?.startTime || "09:00:00";
        const matchTime = filterTime === "ALL" || (time === filterTime);
        return matchCategory && matchDate && matchTime;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-lg font-bold">All Bookings</h3>
                <div className="flex flex-wrap gap-2">
                    <select
                        className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="ALL">All Categories</option>
                        <option value="DAY">Day Scholar</option>
                        <option value="HOSTEL_MALE">Hostel Male</option>
                        <option value="HOSTEL_FEMALE">Hostel Female</option>
                    </select>

                    <select
                        className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    >
                        <option value="ALL">All Dates</option>
                        {uniqueDates.map(date => (
                            <option key={date} value={date}>{date}</option>
                        ))}
                    </select>

                    <select
                        className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={filterTime}
                        onChange={(e) => setFilterTime(e.target.value)}
                    >
                        <option value="ALL">All Times</option>
                        {uniqueTimes.map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>

                    <Button variant="outline" size="sm" onClick={() => { setFilterCategory("ALL"); setFilterDate("ALL"); setFilterTime("ALL"); }}>
                        Reset
                    </Button>
                </div>
            </div>

            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-bold border-b">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">Student</th>
                            <th className="p-3">Dept</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Exam Date</th>
                            <th className="p-3">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map(b => (
                                <tr key={b.bookingId} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3 text-gray-500">#{b.bookingId}</td>
                                    <td className="p-3">
                                        <div>
                                            <p className="font-bold text-gray-900">{b.student?.name}</p>
                                            <p className="text-xs text-gray-500">{b.student?.rollNo}</p>
                                        </div>
                                    </td>
                                    <td className="p-3 font-mono text-xs">{b.department?.deptCode}</td>
                                    <td className="p-3">
                                        {(() => {
                                            const category = b.slot?.category || (b.examQuota?.categoryType === 1 ? 'DAY' : b.examQuota?.categoryType === 2 ? 'HOSTEL_MALE' : 'HOSTEL_FEMALE');
                                            return (
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${category === 'DAY' ? 'bg-blue-100 text-blue-700' :
                                                    category === 'HOSTEL_MALE' ? 'bg-green-100 text-green-700' :
                                                        'bg-pink-100 text-pink-700'
                                                    }`}>
                                                    {category}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-3">
                                        {formatDate(b.slot?.examDate || b.examQuota?.exam?.startingDate)}
                                    </td>
                                    <td className="p-3">{b.slot?.startTime || "09:00 - 17:00"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500 italic">
                                    No bookings found matching filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="text-xs text-gray-400 text-right mt-2">
                Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
        </div >
    );
}

function StudentDataManager() {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", deptId: "", category: "DAY" });
    const [sortKey, setSortKey] = useState("rollNo");
    const [sortDirection, setSortDirection] = useState("asc");

    useEffect(() => {
        loadStudents();
        loadDepartments();
    }, []);

    const loadStudents = () => {
        axios.get("/api/admin/student-master")
            .then(res => setStudents(res.data))
            .catch(err => console.error(err));
    };

    const loadDepartments = () => {
        axios.get("/api/admin/departments")
            .then(res => setDepartments(res.data))
            .catch(err => console.error(err));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        setUploadResult(null);

        try {
            const res = await axios.post("/api/admin/student-master/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setUploadResult(res.data);
            loadStudents(); // Reload students after upload
            e.target.value = null; // reset input
        } catch (error) {
            alert("Upload failed: " + (error.response?.data || error.message));
        } finally {
            setUploading(false);
        }
    };

    const startEdit = (student) => {
        setEditingStudent(student);
        setEditForm({
            name: student.name,
            email: student.email,
            deptId: student.department?.deptId || "",
            category: student.category
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/admin/students/${editingStudent.rollNo}`, editForm);
            alert("Student updated!");
            setEditingStudent(null);
            loadStudents();
        } catch (error) {
            alert("Update failed: " + (error.response?.data || error.message));
        }
    };

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
    };

    const sortedStudents = [...students].sort((a, b) => {
        const aVal = (a[sortKey] || "").toString().toLowerCase();
        const bVal = (b[sortKey] || "").toString().toLowerCase();
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    const SortIcon = ({ column }) => (
        <span className="ml-1 text-gray-400">
            {sortKey === column ? (sortDirection === "asc" ? "▲" : "▼") : "⇅"}
        </span>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold">Uploaded Students ({students.length})</h3>
                    <p className="text-sm text-gray-500">View uploaded student master data from Excel. Click headers to sort.</p>
                </div>
                <div>
                    <label className={`cursor-pointer bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {uploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Database className="h-4 w-4" />}
                        Upload Master Excel
                        <input type="file" accept=".xlsx" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                </div>
            </div>

            {/* Edit Modal / Overlay */}
            {editingStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Edit Student ({editingStudent.rollNo})</h3>
                            <button onClick={() => setEditingStudent(null)} className="p-1 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                <Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={editForm.deptId} onChange={e => setEditForm({ ...editForm, deptId: e.target.value })} required>
                                    <option value="">Select Dept</option>
                                    {departments.map(d => <option key={d.deptId} value={d.deptId}>{d.deptCode}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                                    <option value="DAY">DAY</option>
                                    <option value="HOSTEL_MALE">HOSTEL_MALE</option>
                                    <option value="HOSTEL_FEMALE">HOSTEL_FEMALE</option>
                                </select>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingStudent(null)}>Cancel</Button>
                                <Button type="submit" className="flex-1">Save Changes</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {uploadResult && (
                <div className="bg-white border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-lg">Upload Summary</h4>
                        <Button variant="ghost" size="sm" onClick={() => setUploadResult(null)}><X className="h-4 w-4" /></Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center">
                            <span className="text-gray-500 font-medium mb-1">Total Rows</span>
                            <span className="font-black text-2xl">{uploadResult.totalRows}</span>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center">
                            <span className="text-green-600 font-medium mb-1">Successfully Inserted</span>
                            <span className="font-black text-2xl text-green-700">{uploadResult.insertedCount}</span>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col items-center">
                            <span className="text-orange-600 font-medium mb-1">Skipped / Duplicates</span>
                            <span className="font-black text-2xl text-orange-700">{uploadResult.skippedCount}</span>
                        </div>
                    </div>

                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-xl overflow-hidden">
                            <div className="bg-red-100 px-4 py-2 border-b border-red-200">
                                <h5 className="font-bold text-red-800 text-sm flex items-center gap-2">
                                    <span className="bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full">{uploadResult.errors.length}</span>
                                    Errors Found
                                </h5>
                            </div>
                            <div className="max-h-60 overflow-y-auto p-4">
                                <ul className="space-y-2">
                                    {uploadResult.errors.map((err, i) => (
                                        <li key={i} className="text-xs text-red-700 font-mono bg-white p-2 rounded border border-red-100 shadow-sm flex items-start gap-2">
                                            <span className="text-red-400 font-bold">•</span>
                                            {err}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 font-bold">
                        <tr>
                            <th className="p-3 cursor-pointer hover:bg-gray-200 transition-colors select-none" onClick={() => handleSort("rollNo")}>
                                Roll No<SortIcon column="rollNo" />
                            </th>
                            <th className="p-3 cursor-pointer hover:bg-gray-200 transition-colors select-none" onClick={() => handleSort("name")}>
                                Name<SortIcon column="name" />
                            </th>
                            <th className="p-3 cursor-pointer hover:bg-gray-200 transition-colors select-none" onClick={() => handleSort("email")}>
                                Email<SortIcon column="email" />
                            </th>
                            <th className="p-3 cursor-pointer hover:bg-gray-200 transition-colors select-none" onClick={() => handleSort("deptCode")}>
                                Dept<SortIcon column="deptCode" />
                            </th>
                            <th className="p-3 cursor-pointer hover:bg-gray-200 transition-colors select-none" onClick={() => handleSort("studentType")}>
                                Type<SortIcon column="studentType" />
                            </th>
                            <th className="p-3 cursor-pointer hover:bg-gray-200 transition-colors select-none" onClick={() => handleSort("gender")}>
                                Gender<SortIcon column="gender" />
                            </th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStudents.map(s => (
                            <tr key={s.id} className="border-t hover:bg-gray-50">
                                <td className="p-3 font-mono font-bold">{s.rollNo}</td>
                                <td className="p-3">{s.name}</td>
                                <td className="p-3 text-gray-500">{s.email}</td>
                                <td className="p-3">{s.deptCode}</td>
                                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${s.studentType === 'HOSTEL' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{s.studentType}</span></td>
                                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${s.gender === 'MALE' ? 'bg-cyan-100 text-cyan-700' : 'bg-pink-100 text-pink-700'}`}>{s.gender}</span></td>
                                <td className="p-3 text-center">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => startEdit(s)}>
                                        <Pencil className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ExamManager() {
    const [exams, setExams] = useState([]);
    const [strengths, setStrengths] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showQuotas, setShowQuotas] = useState(false);
    const [expandedExamId, setExpandedExamId] = useState(null);
    const [examQuotas, setExamQuotas] = useState([]);
    const [formData, setFormData] = useState({
        examName: "",
        startDate: "",
        endDate: "",
        totalDays: 5,
        examPurpose: "",
        perDeptCapacity: 100,
        deptCategories: []
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        // Load separately to avoid one failure blocking everything
        try {
            const strengthRes = await axios.get("/api/admin/student-master/strength");
            setStrengths(strengthRes.data || []);
        } catch (e) { console.error("Failed to load strength", e); }

        try {
            const deptRes = await axios.get("/api/admin/departments");
            setDepartments(deptRes.data || []);
        } catch (e) { console.error("Failed to load departments", e); }

        try {
            const examsRes = await axios.get("/api/admin/exams");
            setExams(examsRes.data || []);
        } catch (e) { console.error("Failed to load exams", e); }

        setLoading(false);
    };


    const handleCalculateQuotas = async () => {
        if (!formData.examName || !formData.startDate || !formData.endDate || !formData.totalDays) {
            alert("Please fill all required fields before calculating quotas.");
            return;
        }

        if (strengths.length === 0) {
            alert("No student data found. Please upload student master data first.");
            return;
        }

        // Sync departments from student_master_upload first
        let freshDepartments = departments;
        try {
            await axios.post("/api/admin/sync-departments");
            // Reload departments after sync
            const deptRes = await axios.get("/api/admin/departments");
            freshDepartments = deptRes.data;
            setDepartments(freshDepartments);
        } catch (e) {
            console.error("Sync departments failed:", e);
        }

        console.log("Fresh Departments:", freshDepartments);
        console.log("Strengths loaded:", strengths);

        // Calculate quotas ONLY for departments that have students in student_master_upload
        const days = Math.max(1, parseInt(formData.totalDays));

        const cats = strengths.map(s => {
            // Find deptId from freshDepartments (not stale state)
            const dept = freshDepartments.find(d => d.deptCode && s.deptCode && d.deptCode.trim().toUpperCase() === s.deptCode.trim().toUpperCase());
            const deptId = dept ? dept.deptId : null;

            const dayScholar = s.dayCount || 0;
            const hostelBoys = s.hostelMaleCount || 0;
            const hostelGirls = s.hostelFemaleCount || 0;

            console.log(`Dept ${s.deptCode}: deptId=${deptId}, day=${dayScholar}, hostelM=${hostelBoys}, hostelF=${hostelGirls}`);

            return {
                deptId: deptId,
                deptCode: s.deptCode.trim(),
                dayScholarCount: dayScholar >= days ? Math.floor(dayScholar / days) : dayScholar,
                hostellerBoysCount: hostelBoys >= days ? Math.floor(hostelBoys / days) : hostelBoys,
                hostellerGirlsCount: hostelGirls >= days ? Math.floor(hostelGirls / days) : hostelGirls
            };
        });

        // Check for missing departments
        const missingDepts = cats.filter(c => c.deptId === null).map(c => c.deptCode);
        if (missingDepts.length > 0) {
            alert(`Warning: These departments are not in the departments table and will be skipped: ${missingDepts.join(', ')}\n\nPlease add them to the departments table first.`);
        }

        // Filter to only valid departments
        const validCats = cats.filter(c => c.deptId !== null);
        if (validCats.length === 0) {
            alert("No valid departments found. Add department codes to departments table first.");
            return;
        }

        setFormData(prev => ({ ...prev, deptCategories: validCats }));
        setShowQuotas(true);
    };

    const updateDeptCategory = (deptCode, field, value) => {
        setFormData(prev => ({
            ...prev,
            deptCategories: prev.deptCategories.map(d =>
                d.deptCode === deptCode ? { ...d, [field]: parseInt(value) || 0 } : d
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                examName: formData.examName,
                startDate: formData.startDate,
                endDate: formData.endDate,
                totalDays: formData.totalDays,
                examPurpose: formData.examPurpose,
                perDeptCapacity: formData.perDeptCapacity,
                deptCategories: formData.deptCategories.map(d => ({
                    deptId: d.deptId,
                    dayScholarCount: d.dayScholarCount,
                    hostellerBoysCount: d.hostellerBoysCount,
                    hostellerGirlsCount: d.hostellerGirlsCount
                }))
            };

            const res = await axios.post("/api/admin/exam/initialize", payload);
            alert(`Exam created! ID: ${res.data.examId}, Slots: ${res.data.totalSlotsGenerated}`);
            loadData();
            setShowQuotas(false);
            setFormData(prev => ({
                ...prev,
                examName: "",
                startDate: "",
                endDate: "",
                totalDays: 5,
                examPurpose: "",
                deptCategories: []
            }));
        } catch (err) {
            alert("Failed: " + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Helper to insure we have deptIds
    // I will fetch departments in loadData as well.

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                <div className="mb-8">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Create Exam Slots</h3>
                    <p className="text-gray-500 font-medium">Configure exam details and calculate department quotas</p>
                </div>

                <div className="space-y-8">
                    {/* Exam Details Section */}
                    <div className="p-6 border rounded-2xl bg-white space-y-6 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-900 border-b pb-4">Exam Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exam Name *</label>
                                <Input
                                    placeholder="e.g., Semester 1 Exam"
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    value={formData.examName}
                                    onChange={e => setFormData({ ...formData, examName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Days *</label>
                                <Input
                                    type="number"
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    value={formData.totalDays}
                                    onChange={e => setFormData({ ...formData, totalDays: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Starting Date *</label>
                                <Input
                                    type="date"
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ending Date *</label>
                                <Input
                                    type="date"
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exam Purpose</label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y focus:bg-white transition-colors"
                                    placeholder="e.g., First semester evaluation"
                                    value={formData.examPurpose}
                                    onChange={e => setFormData({ ...formData, examPurpose: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Button
                                onClick={handleCalculateQuotas}
                                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-gray-200"
                            >
                                Calculate Quotas
                            </Button>
                        </div>
                    </div>

                    {/* Quotas Section (Hidden until calculated) */}
                    {showQuotas && (
                        <div className="p-6 border rounded-2xl bg-white space-y-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h4 className="text-lg font-bold text-gray-900">Department Quotas (Proposed)</h4>
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                    Auto-calculated for {formData.totalDays} days
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="p-3 text-left rounded-l-lg">Department</th>
                                            <th className="p-3 text-center">Day Scholars</th>
                                            <th className="p-3 text-center">Hostel Boys</th>
                                            <th className="p-3 text-center rounded-r-lg">Hostel Girls</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {formData.deptCategories.map(dept => (
                                            <tr key={dept.deptCode} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-3 font-bold text-gray-900">{dept.deptCode}</td>
                                                <td className="p-3">
                                                    <Input
                                                        type="number"
                                                        className="w-24 text-center mx-auto h-9 bg-white border-gray-200"
                                                        value={dept.dayScholarCount}
                                                        onChange={e => updateDeptCategory(dept.deptCode, 'dayScholarCount', e.target.value)}
                                                        min={0}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        type="number"
                                                        className="w-24 text-center mx-auto h-9 bg-white border-gray-200"
                                                        value={dept.hostellerBoysCount}
                                                        onChange={e => updateDeptCategory(dept.deptCode, 'hostellerBoysCount', e.target.value)}
                                                        min={0}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        type="number"
                                                        className="w-24 text-center mx-auto h-9 bg-white border-gray-200"
                                                        value={dept.hostellerGirlsCount}
                                                        onChange={e => updateDeptCategory(dept.deptCode, 'hostellerGirlsCount', e.target.value)}
                                                        min={0}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : "Confirm & Generate Slots"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* List of existing exams */}
            <div className="pt-8">
                <h3 className="text-xl font-black text-gray-900 mb-6">Existing Exams</h3>
                {exams.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">No exams created yet.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {exams.map(exam => (
                            <div key={exam.examId} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                                <div
                                    className="flex justify-between items-center p-6 cursor-pointer"
                                    onClick={async () => {
                                        if (expandedExamId === exam.examId) {
                                            setExpandedExamId(null);
                                            setExamQuotas([]);
                                        } else {
                                            setExpandedExamId(exam.examId);
                                            try {
                                                const res = await axios.get(`/api/admin/exams/${exam.examId}/quotas`);
                                                setExamQuotas(res.data);
                                            } catch (e) {
                                                console.error("Failed to load quotas:", e);
                                            }
                                        }
                                    }}
                                >
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900">{exam.examName || exam.name}</h4>
                                        <p className="text-sm text-gray-500 font-medium mt-1">
                                            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {exam.startingDate || exam.startDate} → {exam.endingDate || exam.endDate}</span>
                                            <span className="mx-2">•</span>
                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{exam.noOfDays || exam.totalDays} Days</span>
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2 italic">{exam.examPurpose}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400">{expandedExamId === exam.examId ? '▲' : '▼'}</span>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-9 w-9 text-gray-400 hover:text-blue-600 hover:border-blue-200"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFormData({
                                                    examName: exam.examName || exam.name,
                                                    startDate: exam.startingDate || exam.startDate,
                                                    endDate: exam.endingDate || exam.endDate,
                                                    totalDays: exam.noOfDays || exam.totalDays,
                                                    examPurpose: exam.examPurpose,
                                                    deptCategories: formData.deptCategories
                                                });
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-9 w-9 text-gray-400 hover:text-red-600 hover:border-red-200"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (confirm("Are you sure you want to delete this exam? This will delete all slots and quotas.")) {
                                                    try {
                                                        await axios.delete(`/api/admin/exams/${exam.examId}`);
                                                        loadData();
                                                    } catch (err) {
                                                        alert("Delete failed: " + err.message);
                                                    }
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded Department-wise Slots */}
                                {expandedExamId === exam.examId && (
                                    <div className="border-t border-gray-100 bg-gray-50 p-6">
                                        <h5 className="font-bold text-xl text-gray-800 mb-6">Department-wise Slots</h5>
                                        {examQuotas.length === 0 ? (
                                            <p className="text-gray-500 text-base">No quotas found for this exam.</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-base">
                                                    <thead className="bg-white text-gray-600 font-bold uppercase text-sm">
                                                        <tr>
                                                            <th className="p-4 text-left">Department</th>
                                                            <th className="p-4 text-center">Category</th>
                                                            <th className="p-4 text-center">Max Slots</th>
                                                            <th className="p-4 text-center">Booked</th>
                                                            <th className="p-4 text-center">Available</th>
                                                            <th className="p-4 text-center">Status</th>
                                                            <th className="p-4 text-center">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {examQuotas.map(q => (
                                                            <tr key={q.id} className="hover:bg-white transition-colors">
                                                                <td className="p-4 font-bold text-gray-900 text-lg">{q.department?.deptCode || 'N/A'}</td>
                                                                <td className="p-4 text-center">
                                                                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${q.categoryType === 1 ? 'bg-blue-100 text-blue-700' :
                                                                        q.categoryType === 2 ? 'bg-green-100 text-green-700' :
                                                                            'bg-pink-100 text-pink-700'
                                                                        }`}>
                                                                        {q.categoryType === 1 ? 'Day Scholar' : q.categoryType === 2 ? 'Hostel Boys' : 'Hostel Girls'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 text-center font-bold text-lg">{q.maxCount}</td>
                                                                <td className="p-4 text-center text-lg">{q.currentFill || 0}</td>
                                                                <td className="p-4 text-center text-lg font-bold text-green-600">{q.maxCount - (q.currentFill || 0)}</td>
                                                                <td className="p-4 text-center">
                                                                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${q.isClosed ? 'bg-gray-200 text-gray-600' :
                                                                        q.currentFill >= q.maxCount ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                                        }`}>
                                                                        {q.isClosed ? 'CLOSED' : q.currentFill >= q.maxCount ? 'FULL' : 'OPEN'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    <div className="flex justify-center gap-2">
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-9 w-9 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                                            title="Edit Quota"
                                                                            onClick={async () => {
                                                                                const newMax = prompt(`Edit max slots for ${q.department?.deptCode} - ${q.categoryType === 1 ? 'Day Scholar' : q.categoryType === 2 ? 'Hostel Boys' : 'Hostel Girls'}:`, q.maxCount);
                                                                                if (newMax && !isNaN(parseInt(newMax))) {
                                                                                    try {
                                                                                        await axios.patch(`/api/admin/quotas/${q.id}`, { maxCount: parseInt(newMax) });
                                                                                        const res = await axios.get(`/api/admin/exams/${exam.examId}/quotas`);
                                                                                        setExamQuotas(res.data);
                                                                                    } catch (e) {
                                                                                        alert("Update failed: " + e.message);
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Pencil className="h-5 w-5" />
                                                                        </Button>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className={`h-9 w-9 ${q.isClosed ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'}`}
                                                                            title={q.isClosed ? "Open Booking" : "Close Booking"}
                                                                            onClick={async () => {
                                                                                try {
                                                                                    await axios.patch(`/api/admin/quotas/${q.id}/toggle`);
                                                                                    const res = await axios.get(`/api/admin/exams/${exam.examId}/quotas`);
                                                                                    setExamQuotas(res.data);
                                                                                } catch (e) {
                                                                                    alert("Toggle failed: " + e.message);
                                                                                }
                                                                            }}
                                                                        >
                                                                            {q.isClosed ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                                                        </Button>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                            title="Delete Quota"
                                                                            onClick={async () => {
                                                                                if (confirm(`Delete quota for ${q.department?.deptCode} - ${q.categoryType === 1 ? 'Day Scholar' : q.categoryType === 2 ? 'Hostel Boys' : 'Hostel Girls'}?`)) {
                                                                                    try {
                                                                                        await axios.delete(`/api/admin/quotas/${q.id}`);
                                                                                        const res = await axios.get(`/api/admin/exams/${exam.examId}/quotas`);
                                                                                        setExamQuotas(res.data);
                                                                                    } catch (e) {
                                                                                        alert("Delete failed: " + e.message);
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-5 w-5" />
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LayoutDashboard, Database, Users, Calendar, LogOut, GraduationCap, Menu, X, FileText, Pencil, Trash2, Lock, Unlock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("exams");
    const { logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { id: "exams", label: "Exam Setup", icon: FileText },
        { id: "strength", label: "Dept Strength", icon: Database },
        { id: "bookings", label: "View Bookings", icon: Calendar },
        { id: "students", label: "Student Data", icon: Users },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 bg-blue-50 border-r-2 border-r-black border-gray-200 flex-col fixed h-full z-10">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">A</div>
                    <span className="font-bold text-xl tracking-tight">Admin <span className="text-orange-500">Panel</span></span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                                ? "bg-black text-white shadow-lg shadow-gray-200"
                                : "text-gray-600 hover:bg-orange-100"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100 transition-colors">
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
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-bold ${activeTab === item.id ? "bg-black text-white" : "text-gray-600"
                                }`}
                        >
                            <item.icon className="h-6 w-6" />
                            {item.label}
                        </button>
                    ))}
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-4 text-red-600 font-bold">
                        <LogOut className="h-6 w-6" /> Logout
                    </button>
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

    useEffect(() => { axios.get("/api/admin/bookings").then(res => setBookings(res.data)); }, []);

    // Extract unique dates and times for filters
    const uniqueDates = [...new Set(bookings.map(b => b.slot?.examDate).filter(Boolean))].sort();
    const uniqueTimes = [...new Set(bookings.map(b => b.slot?.startTime).filter(Boolean))].sort();

    // Filter logic
    const filteredBookings = bookings.filter(b => {
        const matchCategory = filterCategory === "ALL" || (b.slot?.category === filterCategory);
        const matchDate = filterDate === "ALL" || (b.slot?.examDate === filterDate);
        const matchTime = filterTime === "ALL" || (b.slot?.startTime === filterTime);
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
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${b.slot?.category === 'DAY' ? 'bg-blue-100 text-blue-700' :
                                            b.slot?.category === 'HOSTEL_MALE' ? 'bg-green-100 text-green-700' :
                                                'bg-pink-100 text-pink-700'
                                            }`}>
                                            {b.slot?.category}
                                        </span>
                                    </td>
                                    <td className="p-3">{b.slot?.examDate}</td>
                                    <td className="p-3">{b.slot?.startTime}</td>
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
        </div>
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
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        examName: "",
        startDate: "",
        endDate: "",
        totalDays: 1,
        perDeptCapacity: 100,
        deptCategories: []
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [examsRes, deptRes] = await Promise.all([
                axios.get("/api/admin/exams"),
                axios.get("/api/admin/departments")
            ]);
            setExams(examsRes.data);
            setDepartments(deptRes.data);
            const cats = deptRes.data.map(d => ({
                deptId: d.deptId,
                deptCode: d.deptCode,
                dayScholarCount: 0,
                hostellerBoysCount: 0,
                hostellerGirlsCount: 0
            }));
            setFormData(prev => ({ ...prev, deptCategories: cats }));
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setLoading(false);
        }
    };

    const updateDeptCategory = (deptId, field, value) => {
        setFormData(prev => ({
            ...prev,
            deptCategories: prev.deptCategories.map(d =>
                d.deptId === deptId ? { ...d, [field]: parseInt(value) || 0 } : d
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.examName || !formData.startDate || !formData.endDate) {
            alert("Please fill all required fields");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                examName: formData.examName,
                startDate: formData.startDate,
                endDate: formData.endDate,
                totalDays: formData.totalDays,
                perDeptCapacity: formData.perDeptCapacity,
                deptCategories: formData.deptCategories.map(d => ({
                    deptId: d.deptId,
                    dayScholarCount: d.dayScholarCount,
                    hostellerBoysCount: d.hostellerBoysCount,
                    hostellerGirlsCount: d.hostellerGirlsCount
                }))
            };
            const res = await axios.post("/api/admin/exam/initialize", payload);
            alert(`Exam created! ID: ${res.data.examId}, Slots: ${res.data.totalSlotsGenerated}, Quotas: ${res.data.quotasCreated}`);
            loadData();
            setFormData(prev => ({
                ...prev,
                examName: "",
                startDate: "",
                endDate: "",
                totalDays: 1,
                deptCategories: prev.deptCategories.map(d => ({ ...d, dayScholarCount: 0, hostellerBoysCount: 0, hostellerGirlsCount: 0 }))
            }));
        } catch (err) {
            alert("Failed: " + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    const totalSlots = formData.deptCategories.reduce((sum, d) =>
        sum + d.dayScholarCount + d.hostellerBoysCount + d.hostellerGirlsCount, 0);

    return (
        <div className="space-y-8">
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                <h3 className="text-xl font-bold mb-6 text-gray-800">🎓 Initialize New Exam</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Exam Name *</label>
                            <Input placeholder="e.g. Mid-Term 2026" value={formData.examName} onChange={e => setFormData({ ...formData, examName: e.target.value })} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Start Date *</label>
                            <Input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">End Date *</label>
                            <Input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Total Exam Days</label>
                            <Input type="number" value={formData.totalDays} onChange={e => setFormData({ ...formData, totalDays: parseInt(e.target.value) || 1 })} min={1} />
                            <p className="text-xs text-gray-400">Number of days slots will be distributed over</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Per Dept Capacity</label>
                            <Input type="number" value={formData.perDeptCapacity} onChange={e => setFormData({ ...formData, perDeptCapacity: parseInt(e.target.value) || 100 })} min={1} />
                            <p className="text-xs text-gray-400">Max students per department for this exam</p>
                        </div>
                    </div>
                    <div className="pt-4 border-t">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-700">Department Category Quotas</h4>
                            <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">Total Slots: {totalSlots}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                                    <tr><th className="p-3 text-left">Department</th><th className="p-3 text-center">Day Scholars</th><th className="p-3 text-center">Hostel Boys</th><th className="p-3 text-center">Hostel Girls</th><th className="p-3 text-center">Total</th></tr>
                                </thead>
                                <tbody className="divide-y">
                                    {formData.deptCategories.map(dept => (
                                        <tr key={dept.deptId} className="hover:bg-gray-50">
                                            <td className="p-3 font-bold">{dept.deptCode}</td>
                                            <td className="p-3"><Input type="number" className="w-24 text-center mx-auto" value={dept.dayScholarCount} onChange={e => updateDeptCategory(dept.deptId, 'dayScholarCount', e.target.value)} min={0} /></td>
                                            <td className="p-3"><Input type="number" className="w-24 text-center mx-auto" value={dept.hostellerBoysCount} onChange={e => updateDeptCategory(dept.deptId, 'hostellerBoysCount', e.target.value)} min={0} /></td>
                                            <td className="p-3"><Input type="number" className="w-24 text-center mx-auto" value={dept.hostellerGirlsCount} onChange={e => updateDeptCategory(dept.deptId, 'hostellerGirlsCount', e.target.value)} min={0} /></td>
                                            <td className="p-3 text-center font-bold text-indigo-600">{dept.dayScholarCount + dept.hostellerBoysCount + dept.hostellerGirlsCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3">
                        {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Initializing...</> : "🚀 Initialize Exam & Generate Slots"}
                    </Button>
                </form>
            </div>
            <div>
                <h3 className="text-lg font-bold mb-4">📋 Existing Exams</h3>
                {exams.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">No exams created yet.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {exams.map(exam => (
                            <div key={exam.examId} className="flex justify-between items-center p-4 border rounded-xl hover:shadow-md transition-shadow">
                                <div>
                                    <h4 className="font-bold text-lg">{exam.name}</h4>
                                    <p className="text-sm text-gray-500">{exam.startDate} → {exam.endDate} • {exam.totalDays} days</p>
                                    <p className="text-xs text-gray-400 mt-1">ID: {exam.examId} • Capacity: {exam.perDeptCapacity}/dept</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" title="Edit Exam"><Pencil className="h-4 w-4" /></Button>
                                    <Button size="sm" variant={exam.isOpen ? "secondary" : "default"} title={exam.isOpen ? "Close Booking" : "Open Booking"}>
                                        {exam.isOpen ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                    </Button>
                                    <Button size="sm" variant="destructive" title="Delete Exam"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

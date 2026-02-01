import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("slots");
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <Button variant="outline" onClick={logout}>Logout</Button>
            </div>

            <div className="flex space-x-2 mb-4">
                <Button variant={activeTab === "slots" ? "default" : "outline"} onClick={() => setActiveTab("slots")}>Manage Slots</Button>
                <Button variant={activeTab === "strength" ? "default" : "outline"} onClick={() => setActiveTab("strength")}>Dept Strength</Button>
                <Button variant={activeTab === "bookings" ? "default" : "outline"} onClick={() => setActiveTab("bookings")}>View Bookings</Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    {activeTab === "slots" && <SlotManager />}
                    {activeTab === "strength" && <DeptStrengthManager />}
                    {activeTab === "bookings" && <BookingViewer />}
                </CardContent>
            </Card>
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

    const [formData, setFormData] = useState({
        examDate: "", startTime: "", endTime: "", category: "DAY", purpose: "", quotas: []
    });

    useEffect(() => {
        loadSlots();
        loadDepartments();
    }, []);

    const loadSlots = async () => {
        const res = await axios.get("/api/admin/slots");
        setSlots(res.data);
    };

    const loadDepartments = async () => {
        try {
            const deptsRes = await axios.get("/api/admin/departments");
            setDepartments(deptsRes.data);
            const strRes = await axios.get("/api/admin/strength");
            setStrengths(strRes.data);
        } catch (e) { console.error(e); }
    };

    const handleQuotaChange = (deptId, value) => {
        const newQuotas = formData.quotas.filter(q => q.deptId !== deptId);
        if (value) {
            newQuotas.push({ deptId, quota: parseInt(value) });
        }
        setFormData({ ...formData, quotas: newQuotas });
    };

    const handleAutoCalculate = () => {
        if (distributeCount < 1) return;
        const newQuotas = [];
        departments.forEach(dept => {
            const str = strengths.find(s => s.department?.deptId === dept.deptId);
            if (str) {
                let totalStrength = 0;
                if (formData.category === "DAY") totalStrength = str.dayCount;
                else if (formData.category === "HOSTEL_MALE") totalStrength = str.hostelMaleCount;
                else if (formData.category === "HOSTEL_FEMALE") totalStrength = str.hostelFemaleCount;

                const quotaPerSlot = Math.floor(totalStrength / distributeCount);
                if (quotaPerSlot > 0) {
                    newQuotas.push({ deptId: dept.deptId, quota: quotaPerSlot });
                }
            }
        });
        setFormData({ ...formData, quotas: newQuotas });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingSlotId) {
                await axios.put(`/api/admin/slots/${editingSlotId}`, formData);
                alert("Slot updated successfully!");
                setEditingSlotId(null);
            } else {
                await axios.post("/api/admin/slots", formData);
                alert("Slot created successfully!");
            }
            loadSlots();
            setFormData({ ...formData, examDate: "", startTime: "", endTime: "", purpose: "", quotas: [] });
        } catch (err) {
            alert("Error: " + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (slot) => {
        setFormData({
            examDate: slot.examDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            category: slot.category,
            purpose: slot.purpose || "",
            quotas: [] // Note: Quota editing not fully implemented in this simple flow
        });
        setEditingSlotId(slot.slotId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggle = async (id) => {
        try {
            await axios.patch(`/api/admin/slots/${id}/toggle`);
            loadSlots();
        } catch (e) { alert("Error: " + (e.response?.data || e.message)); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this slot?")) return;
        try {
            await axios.delete(`/api/admin/slots/${id}`);
            loadSlots();
        } catch (e) { alert("Cannot delete: " + (e.response?.data || e.message)); }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Create Exam Slot</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Exam Date</label>
                    <Input type="date" value={formData.examDate} onChange={e => setFormData({ ...formData, examDate: e.target.value })} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time</label>
                    <Input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">End Time</label>
                    <Input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        <option value="DAY">DAY</option>
                        <option value="HOSTEL_MALE">HOSTEL_MALE</option>
                        <option value="HOSTEL_FEMALE">HOSTEL_FEMALE</option>
                    </select>
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Purpose / Title (e.g. "Practice Test 1")</label>
                    <Input placeholder="Enter exam purpose..." value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} />
                </div>

                <div className="col-span-2 border p-6 rounded-md bg-gray-50">
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <div>
                            <h3 className="font-semibold text-lg">Department Quotas</h3>
                            {formData.category && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Total Eligible <span className="font-medium">{formData.category}</span> Students:
                                    <span className="font-bold text-blue-600 ml-1">
                                        {strengths.reduce((sum, s) => {
                                            if (formData.category === "DAY") return sum + (s.dayCount || 0);
                                            if (formData.category === "HOSTEL_MALE") return sum + (s.hostelMaleCount || 0);
                                            return sum + (s.hostelFemaleCount || 0);
                                        }, 0)}
                                    </span>
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-4 bg-white p-3 rounded border">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium whitespace-nowrap">Distribute over slots:</span>
                                <Input type="number" min="1" className="w-16 h-9" value={distributeCount} onChange={e => setDistributeCount(parseInt(e.target.value) || 1)} />
                                <Button type="button" size="sm" variant="secondary" onClick={handleAutoCalculate}>Auto-Fill</Button>
                            </div>
                            <div className="h-8 w-px bg-gray-300 mx-2"></div>
                            <div className="text-sm">
                                Slot Capacity: <span className="font-bold text-green-700 text-lg">
                                    {formData.quotas.reduce((sum, q) => sum + (q.quota || 0), 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {departments.map(dept => {
                            const qVal = formData.quotas.find(q => q.deptId === dept.deptId)?.quota || "";
                            return (
                                <div key={dept.deptId} className="bg-white p-3 rounded border shadow-sm">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">{dept.deptCode}</label>
                                    <Input type="number" min="0" placeholder="0" className="h-9"
                                        value={qVal}
                                        onChange={(e) => handleQuotaChange(dept.deptId, e.target.value)}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="col-span-2">
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Processing..." : (editingSlotId ? "Update Slot" : "Create Slot & Set Quotas")}
                    </Button>
                    {editingSlotId && (
                        <Button type="button" variant="outline" className="w-full mt-2" onClick={() => {
                            setEditingSlotId(null);
                            setFormData({ ...formData, examDate: "", startTime: "", endTime: "", purpose: "", quotas: [] });
                        }}>Cancel Edit</Button>
                    )}
                </div>
            </form>

            <div className="mt-8">
                <h3 className="font-bold mb-4 text-lg">Existing Slots</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {slots.map(s => (
                        <div key={s.slotId} className="border rounded-lg shadow-md bg-white flex flex-col justify-between h-48 transition-all hover:shadow-lg">
                            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-lg truncate" title={s.purpose}>{s.purpose || "Untitled Slot"}</h4>
                                    <span className={`px-2 py-1 text-xs font-bold rounded ${s.bookingOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {s.bookingOpen ? "OPEN" : "CLOSED"}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{s.category}</p>
                            </div>

                            <div className="p-4 flex-grow flex flex-col justify-center">
                                <div className="flex items-center text-sm text-gray-700 mb-1">
                                    <span className="font-medium mr-2">Date:</span> {s.examDate}
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <span className="font-medium mr-2">Time:</span> {s.startTime} - {s.endTime}
                                </div>
                            </div>

                            <div className="p-3 border-t bg-gray-50 rounded-b-lg flex justify-between gap-2">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(s)}>Edit</Button>
                                <Button variant={s.bookingOpen ? "secondary" : "default"} size="sm" className="flex-1" onClick={() => handleToggle(s.slotId)}>
                                    {s.bookingOpen ? "Close" : "Open"}
                                </Button>
                                <Button variant="destructive" size="sm" className="px-3" onClick={() => handleDelete(s.slotId)}>
                                    ✕
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DeptStrengthManager() {
    const [departments, setDepartments] = useState([]);
    const [strengths, setStrengths] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        deptId: "", dayCount: "", hostelMaleCount: "", hostelFemaleCount: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [deptRes, strengthRes] = await Promise.all([
                axios.get("/api/admin/departments"),
                axios.get("/api/admin/strength")
            ]);
            setDepartments(deptRes.data);
            setStrengths(strengthRes.data);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.deptId) { alert("Please select a department"); return; }
        setLoading(true);
        try {
            await axios.post("/api/admin/strength", {
                deptId: parseInt(formData.deptId),
                dayCount: parseInt(formData.dayCount) || 0,
                hostelMaleCount: parseInt(formData.hostelMaleCount) || 0,
                hostelFemaleCount: parseInt(formData.hostelFemaleCount) || 0
            });
            loadData();
            setShowForm(false);
            setFormData({ deptId: "", dayCount: "", hostelMaleCount: "", hostelFemaleCount: "" });
            alert("Strength saved!");
        } catch (err) {
            alert("Error: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Department Exam Strength</h2>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Add Dept Strength"}
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="border p-4 rounded-md bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Department</label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={formData.deptId} onChange={e => setFormData({ ...formData, deptId: e.target.value })} required>
                            <option value="">-- Select Department --</option>
                            {departments.map(d => <option key={d.deptId} value={d.deptId}>{d.deptCode}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Day Scholars Count</label>
                        <Input type="number" min="0" placeholder="0" value={formData.dayCount} onChange={e => setFormData({ ...formData, dayCount: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Hostel Male Count</label>
                        <Input type="number" min="0" placeholder="0" value={formData.hostelMaleCount} onChange={e => setFormData({ ...formData, hostelMaleCount: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Hostel Female Count</label>
                        <Input type="number" min="0" placeholder="0" value={formData.hostelFemaleCount} onChange={e => setFormData({ ...formData, hostelFemaleCount: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                        <Button type="submit" disabled={loading} className="w-full">{loading ? "Saving..." : "Save Strength"}</Button>
                    </div>
                </form>
            )}

            <div className="mt-4">
                <h3 className="font-bold mb-2">Existing Records</h3>
                {strengths.length === 0 ? (
                    <p className="text-gray-500">No strength records yet.</p>
                ) : (
                    <table className="w-full text-sm text-left border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Department</th>
                                <th className="p-2 border">Day Scholars</th>
                                <th className="p-2 border">Hostel Male</th>
                                <th className="p-2 border">Hostel Female</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {strengths.map(s => (
                                <tr key={s.strengthId} className="border-b">
                                    <td className="p-2 border">{s.department?.deptCode || "N/A"}</td>
                                    <td className="p-2 border">{s.dayCount}</td>
                                    <td className="p-2 border">{s.hostelMaleCount}</td>
                                    <td className="p-2 border">{s.hostelFemaleCount}</td>
                                    <td className="p-2 border">
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setFormData({
                                                deptId: s.department?.deptId,
                                                dayCount: s.dayCount,
                                                hostelMaleCount: s.hostelMaleCount,
                                                hostelFemaleCount: s.hostelFemaleCount
                                            });
                                            setShowForm(true);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}>Edit</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function BookingViewer() {
    const [bookings, setBookings] = useState([]);
    useEffect(() => {
        axios.get("/api/admin/bookings").then(res => setBookings(res.data));
    }, []);

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(":");
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Except Bookings ({bookings.length})</h2>
            <table className="w-full text-sm text-left border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Booking ID</th>
                        <th className="p-2 border">Roll No</th>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Dept</th>
                        <th className="p-2 border">Exam Date</th>
                        <th className="p-2 border">Slot Time</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(b => (
                        <tr key={b.bookingId} className="border-b">
                            <td className="p-2 border">#{b.bookingId}</td>
                            <td className="p-2 border">{b.student.rollNo}</td>
                            <td className="p-2 border">{b.student.name}</td>
                            <td className="p-2 border">{b.department.deptCode}</td>
                            <td className="p-2 border">{b.slot.examDate}</td>
                            <td className="p-2 border">
                                {formatTime(b.slot.startTime)} - {formatTime(b.slot.endTime)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

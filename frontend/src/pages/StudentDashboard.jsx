import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, User, Calendar, ChevronRight, Info, LogOut, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const { logout } = useAuth();
    const [studentEmail, setStudentEmail] = useState("Student");
    const navigate = useNavigate();

    const colors = [
        "bg-blue-50 border-blue-100",
        "bg-purple-50 border-purple-100",
        "bg-orange-50 border-orange-100",
        "bg-green-50 border-green-100",
        "bg-cyan-50 border-cyan-100"
    ];

    const iconColors = ["text-blue-500", "text-purple-500", "text-orange-500", "text-green-500", "text-cyan-500"];

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && token.split('.').length === 3) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setStudentEmail(payload.sub || payload.email || "Student");
            } catch (e) {
                console.error("Auth Token Error");
            }
        }
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await axios.get("/api/student/slots", {
                headers: {
                    Authorization: `Bearer ${token.replace(/"/g, '')}`
                }
            });

            setSlots(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            // Handle the Hibernate Serialization Error (400)
            const errorData = err.response?.data;
            if (errorData?.message?.includes("ByteBuddyInterceptor")) {
                console.error("Backend Error: Hibernate Serialization failed. The backend is trying to send a proxy object.");
            }
            setSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (slotId) => {
        if (!window.confirm("Confirm booking? This cannot be undone.")) return;
        setBookingLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("/api/student/book", { slotId }, {
                headers: { Authorization: `Bearer ${token.replace(/"/g, '')}` }
            });
            navigate("/student/confirmation", { state: { booking: res.data } });
        } catch (err) {
            alert(err.response?.data?.message || "Booking failed. Please try logging out and back in.");
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
            <header className="sticky top-4 z-50 px-6">
                <nav className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg rounded-2xl px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/student/dashboard")}>
                        <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:rotate-12">S</div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-lg font-black text-gray-900 tracking-tighter">Slot</span>
                            <span className="text-sm font-bold text-orange-500 uppercase tracking-widest">Booking</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-3 bg-gray-100/50 px-4 py-2 rounded-xl border border-gray-200/50">
                            <User className="h-4 w-4 text-orange-600" />
                            <span className="hidden md:block text-sm font-bold text-gray-700 truncate max-w-[120px]">{studentEmail}</span>
                        </div>
                        <button onClick={logout} className="flex items-center gap-2 text-sm font-bold bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all active:scale-95">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto p-8 md:p-12">
                <div className="bg-orange-50 border-2 border-orange-200 rounded-[2rem] p-8 mb-12 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
                    <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-200">
                        <Info className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Booking Instructions</h2>
                        <ul className="text-orange-900/80 text-sm space-y-1 font-medium">
                            <li>• Slots can only be filled **one time only**.</li>
                            <li>• Ensure you are booking for the correct department.</li>
                        </ul>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                    </div>
                ) : slots.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                        <Calendar className="mx-auto h-16 w-16 text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Unable to load slots</h3>
                        <p className="text-gray-500">There is a temporary server issue. Please try again later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {slots.map((slot, index) => {
                            const colorClass = colors[index % colors.length];
                            const iconColor = iconColors[index % iconColors.length];
                            return (
                                <div key={slot.slotId} className={`${colorClass} rounded-[2rem] p-6 border-2 flex flex-col min-h-[420px] shadow-sm hover:-translate-y-2 transition-all duration-300 relative overflow-hidden`}>
                                    <div className="flex justify-between mb-4">
                                        <div className={`p-3 rounded-2xl bg-white/60 ${iconColor}`}><Calendar className="h-6 w-6" /></div>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900">{slot.examDate}</h3>
                                    <p className="font-mono font-bold text-gray-600 text-sm mb-6">{slot.startTime} - {slot.endTime}</p>

                                    <div className="bg-white/60 rounded-2xl p-4 mb-6 border border-white/50 flex-grow">
                                        <h4 className="flex items-center gap-2 text-xs font-bold text-gray-800 mb-3 uppercase tracking-wider">
                                            <Briefcase className="h-4 w-4" /> Availability
                                        </h4>
                                        <div className="space-y-4">
                                            {slot.quotas?.map((q) => (
                                                <div key={q.quotaId}>
                                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                                        <span>{q.department?.deptCode}</span>
                                                        <span>{q.quotaCapacity - q.bookedCount} Left</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-200/50 rounded-full">
                                                        <div className="h-full bg-black rounded-full" style={{ width: `${(q.bookedCount / q.quotaCapacity) * 100}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        disabled={!slot.bookingOpen || bookingLoading}
                                        onClick={() => handleBook(slot.slotId)}
                                        className="w-full bg-black text-white rounded-full py-4 font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
                                    >
                                        {bookingLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Book Now <ChevronRight className="h-5 w-5" /></>}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
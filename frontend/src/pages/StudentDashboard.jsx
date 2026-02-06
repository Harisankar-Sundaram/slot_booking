import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, User, Calendar, ChevronRight, Info, LogOut, Briefcase, X, AlertTriangle, CheckCircle, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/toast";

export default function StudentDashboard() {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [myBooking, setMyBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [datesLoading, setDatesLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState(null);
    const { logout } = useAuth();
    const [studentEmail, setStudentEmail] = useState("Student");
    const navigate = useNavigate();
    const toast = useToast();

    const colors = [
        "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200",
        "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200",
        "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200",
        "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
        "bg-gradient-to-br from-fuchsia-50 to-purple-50 border-fuchsia-200"
    ];

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
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }

            // Check if student already has a booking
            const bookingRes = await axios.get("/api/student/my-booking", {
                headers: { Authorization: `Bearer ${token.replace(/"/g, '')}` }
            });

            if (bookingRes.data.hasBooking) {
                setMyBooking(bookingRes.data);
            } else {
                // Load available exams
                const examsRes = await axios.get("/api/student/exams", {
                    headers: { Authorization: `Bearer ${token.replace(/"/g, '')}` }
                });
                setExams(Array.isArray(examsRes.data) ? examsRes.data : []);
            }
        } catch (err) {
            console.error("Load error:", err);
            if (err.response && err.response.status === 401) {
                // Invalid token - clear and redirect
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                window.location.href = "/login";
                return;
            }
            toast.error("Failed to load data. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    const selectExam = async (exam) => {
        setSelectedExam(exam);
        setDatesLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`/api/student/available-dates/${exam.examId}`, {
                headers: { Authorization: `Bearer ${token.replace(/"/g, '')}` }
            });
            setAvailableDates(res.data.availableDates || []);
        } catch (err) {
            console.error("Load dates error:", err);
            toast.error("Failed to load available dates.");
            setAvailableDates([]);
        } finally {
            setDatesLoading(false);
        }
    };

    const openConfirmModal = (dateInfo) => {
        setConfirmModal({
            examId: selectedExam.examId,
            examName: selectedExam.examName,
            slotDate: dateInfo.slotDate,
            startTime: dateInfo.startTime,
            endTime: dateInfo.endTime,
            availableCount: dateInfo.availableCount
        });
    };

    const handleBook = async () => {
        if (!confirmModal) return;
        setBookingLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("/api/student/book-seat", {
                examId: confirmModal.examId,
                slotDate: confirmModal.slotDate
            }, {
                headers: { Authorization: `Bearer ${token.replace(/"/g, '')}` }
            });
            toast.success("Slot booked successfully!");
            setConfirmModal(null);
            // Navigate to confirmation page or show booking details
            setMyBooking({ ...res.data, hasBooking: true });
        } catch (err) {
            const message = err.response?.data?.message || "Booking failed. Please try again.";
            toast.error(message);
            setConfirmModal(null);
        } finally {
            setBookingLoading(false);
        }
    };

    // If student already has a booking, show confirmation view
    if (myBooking && myBooking.hasBooking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-sans pb-20">
                <header className="sticky top-4 z-40 px-6">
                    <nav className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-green-100 shadow-lg shadow-green-100/50 rounded-2xl px-6 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-200">S</div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-lg font-black text-gray-900 tracking-tighter">Slot</span>
                                <span className="text-sm font-bold text-green-600 uppercase tracking-widest">Booked</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                <User className="h-4 w-4 text-green-600" />
                                <span className="hidden md:block text-sm font-bold text-gray-700 truncate max-w-[120px]">{studentEmail}</span>
                            </div>
                            <button onClick={logout} className="flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all active:scale-95 shadow-lg shadow-green-200">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    </nav>
                </header>

                <main className="max-w-2xl mx-auto p-8 md:p-12">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-green-100 p-8 text-center">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-green-200">
                            <CheckCircle className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500 mb-8">Your exam slot has been successfully booked.</p>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 text-left space-y-4 mb-6">
                            <div className="flex justify-between items-center border-b border-green-100 pb-4">
                                <span className="text-gray-500 font-medium">Exam</span>
                                <span className="font-black text-gray-900 text-lg">{myBooking.examName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-green-100 pb-4">
                                <span className="text-gray-500 font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> Date</span>
                                <span className="font-bold text-gray-900">{myBooking.slotDate}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-green-100 pb-4">
                                <span className="text-gray-500 font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Time</span>
                                <span className="font-bold text-gray-900">{myBooking.startTime} - {myBooking.endTime}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-green-100 pb-4">
                                <span className="text-gray-500 font-medium flex items-center gap-2"><MapPin className="h-4 w-4" /> Department</span>
                                <span className="font-bold text-gray-900">{myBooking.department || myBooking.deptCode}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium flex items-center gap-2"><Briefcase className="h-4 w-4" /> Category</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${myBooking.category === 'Day Scholar' ? 'bg-blue-100 text-blue-700' :
                                    myBooking.category === 'Hostel Boys' ? 'bg-green-100 text-green-700' :
                                        'bg-pink-100 text-pink-700'
                                    }`}>{myBooking.category}</span>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left">
                            <p className="text-yellow-800 text-sm font-medium flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                Please arrive at least 15 minutes before your scheduled time. Bring your student ID.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-sans pb-20">
            {/* Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-purple-100 p-3 rounded-xl">
                                <AlertTriangle className="h-6 w-6 text-purple-600" />
                            </div>
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Booking</h3>
                        <p className="text-gray-600 mb-4">Are you sure you want to book this slot? This action cannot be undone.</p>

                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6 space-y-3 border border-purple-100">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Exam</span>
                                <span className="font-bold text-gray-900">{confirmModal.examName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Date</span>
                                <span className="font-bold text-gray-900">{confirmModal.slotDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Time</span>
                                <span className="font-bold text-purple-700">{confirmModal.startTime} - {confirmModal.endTime}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Available Seats</span>
                                <span className="font-bold text-green-600">{confirmModal.availableCount}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBook}
                                disabled={bookingLoading}
                                className="flex-[2] py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {bookingLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Confirm Booking
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="sticky top-4 z-40 px-6">
                <nav className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-purple-100 shadow-lg shadow-purple-100/50 rounded-2xl px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/student/dashboard")}>
                        <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:rotate-12 shadow-lg shadow-purple-200">S</div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-lg font-black text-gray-900 tracking-tighter">Slot</span>
                            <span className="text-sm font-bold text-purple-600 uppercase tracking-widest">Booking</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
                            <User className="h-4 w-4 text-purple-600" />
                            <span className="hidden md:block text-sm font-bold text-gray-700 truncate max-w-[120px]">{studentEmail}</span>
                        </div>
                        <button onClick={logout} className="flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all active:scale-95 shadow-lg shadow-purple-200">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto p-8 md:p-12">
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-200 rounded-[2rem] p-8 mb-12 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-lg shadow-purple-100">
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-purple-200">
                        <Info className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Booking Instructions</h2>
                        <ul className="text-purple-900/80 text-sm space-y-1 font-medium">
                            <li>• Each student can only book <strong>one slot per exam</strong>.</li>
                            <li>• Select an exam first, then choose your preferred date.</li>
                            <li>• Time shown is based on your category (Day Scholar / Hosteller).</li>
                        </ul>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                    </div>
                ) : selectedExam ? (
                    // Show available dates for selected exam
                    <div>
                        <button
                            onClick={() => { setSelectedExam(null); setAvailableDates([]); }}
                            className="mb-6 flex items-center gap-2 text-purple-600 font-bold hover:text-purple-700"
                        >
                            ← Back to Exams
                        </button>

                        <h3 className="text-2xl font-black text-gray-900 mb-2">{selectedExam.examName}</h3>
                        <p className="text-gray-500 mb-8">Select a date to book your exam slot</p>

                        {datesLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                            </div>
                        ) : availableDates.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-purple-200 shadow-lg">
                                <Calendar className="mx-auto h-16 w-16 text-purple-200 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900">No slots available</h3>
                                <p className="text-gray-500">There are no available slots for your department and category.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableDates.map((dateInfo, index) => {
                                    const colorClass = colors[index % colors.length];
                                    return (
                                        <div key={dateInfo.slotDate} className={`${colorClass} rounded-[2rem] p-6 border-2 flex flex-col shadow-lg hover:-translate-y-2 transition-all duration-300`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 rounded-2xl bg-white/60">
                                                    <Calendar className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                                    {dateInfo.availableCount} left
                                                </span>
                                            </div>

                                            <h4 className="text-2xl font-black text-gray-900 mb-2">{dateInfo.slotDate}</h4>

                                            <div className="flex items-center gap-2 text-purple-700 font-bold mb-6">
                                                <Clock className="h-4 w-4" />
                                                {dateInfo.startTime} - {dateInfo.endTime}
                                            </div>

                                            <button
                                                disabled={dateInfo.availableCount === 0}
                                                onClick={() => openConfirmModal(dateInfo)}
                                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full py-4 font-bold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
                                            >
                                                Book This Slot <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : exams.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-purple-200 shadow-lg">
                        <Calendar className="mx-auto h-16 w-16 text-purple-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No exams available</h3>
                        <p className="text-gray-500">There are no exams available for booking at this time.</p>
                    </div>
                ) : (
                    // Show list of available exams
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {exams.map((exam, index) => {
                            const colorClass = colors[index % colors.length];
                            return (
                                <div
                                    key={exam.examId}
                                    onClick={() => selectExam(exam)}
                                    className={`${colorClass} rounded-[2rem] p-6 border-2 flex flex-col min-h-[280px] shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer`}
                                >
                                    <div className="flex justify-between mb-4">
                                        <div className="p-3 rounded-2xl bg-white/60">
                                            <Briefcase className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">{exam.examName}</h3>
                                    <p className="text-gray-500 text-sm mb-4">{exam.examPurpose || "Exam registration"}</p>

                                    <div className="bg-white/60 rounded-2xl p-4 border border-white/50 mt-auto">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                            <Calendar className="h-4 w-4" />
                                            {exam.startingDate} - {exam.endingDate}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-center gap-2 text-purple-600 font-bold">
                                        View Available Slots <ChevronRight className="h-5 w-5" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
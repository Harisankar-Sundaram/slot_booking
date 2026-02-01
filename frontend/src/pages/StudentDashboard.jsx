import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await axios.get("/api/student/slots");
            setSlots(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (slotId) => {
        if (!confirm("Confirm booking? This cannot be undone.")) return;
        setBookingLoading(true);
        try {
            const res = await axios.post("/api/student/book", { slotId });
            navigate("/student/confirmation", { state: { booking: res.data } });
        } catch (err) {
            alert(err.response?.data || "Booking failed");
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Available Exam Slots</h1>
                <Button variant="outline" onClick={logout}>Logout</Button>
            </div>

            {loading ? (
                <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : slots.length === 0 ? (
                <p className="text-center text-gray-500">No slots available for your category.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slots.map((slot) => (
                        <Card key={slot.slotId} className={!slot.bookingOpen ? "opacity-60" : ""}>
                            <CardHeader>
                                <CardTitle className="flex justify-between">
                                    <span>{slot.examDate}</span>
                                    {slot.bookingOpen ? <span className="text-green-600 text-sm">Open</span> : <span className="text-red-500 text-sm">Closed</span>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-mono">{slot.startTime} - {slot.endTime}</p>
                                <div className="mt-4">
                                    <Button
                                        className="w-full"
                                        disabled={!slot.bookingOpen || bookingLoading}
                                        onClick={() => handleBook(slot.slotId)}
                                    >
                                        {bookingLoading ? <Loader2 className="animate-spin mr-2" /> : "Book Slot"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

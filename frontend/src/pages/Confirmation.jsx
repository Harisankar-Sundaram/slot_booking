import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, User, MapPin, Briefcase, Download, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Confirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const booking = location.state?.booking;

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center space-y-4">
                    <p className="text-gray-600">No booking details found.</p>
                    <Button onClick={() => navigate("/student")}>Go Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    const handleCopyBookingId = () => {
        navigator.clipboard.writeText(String(booking.bookingId));
        alert("Booking ID copied!");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <Card className="w-full max-w-lg shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg pt-8 pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white/20 p-4 rounded-full">
                            <CheckCircle className="w-16 h-16 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl text-center font-black">Booking Confirmed!</CardTitle>
                    <p className="text-center text-green-100 mt-2">Your slot has been successfully reserved</p>
                </CardHeader>

                <CardContent className="p-8 space-y-6">
                    {/* Booking ID - Prominent */}
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 flex justify-between items-center">
                        <div>
                            <span className="text-gray-500 text-xs uppercase font-bold">Booking ID</span>
                            <p className="font-mono font-black text-2xl text-gray-900">#{booking.bookingId}</p>
                        </div>
                        <button
                            onClick={handleCopyBookingId}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Copy Booking ID"
                        >
                            <Copy className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid gap-4">
                        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                            <Calendar className="h-6 w-6 text-blue-600 mt-0.5" />
                            <div>
                                <span className="text-gray-500 text-sm font-medium">Exam</span>
                                <p className="font-bold text-lg text-gray-900">{booking.examName || "PET Examination"}</p>
                                <p className="text-blue-600 font-medium">{booking.examDate}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                            <User className="h-6 w-6 text-purple-600 mt-0.5" />
                            <div>
                                <span className="text-gray-500 text-sm font-medium">Student</span>
                                <p className="font-bold text-lg text-gray-900">{booking.rollNo}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl">
                            <Briefcase className="h-6 w-6 text-orange-600 mt-0.5" />
                            <div>
                                <span className="text-gray-500 text-sm font-medium">Department & Category</span>
                                <p className="font-bold text-lg text-gray-900">{booking.department}</p>
                                <p className="text-orange-600 font-medium">{booking.category}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                            <MapPin className="h-6 w-6 text-green-600 mt-0.5" />
                            <div>
                                <span className="text-gray-500 text-sm font-medium">Location</span>
                                <p className="font-bold text-lg text-gray-900">Exam Hall</p>
                                <p className="text-green-600 font-medium">Check notice board for hall allocation</p>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-amber-800 text-sm font-medium">
                            📸 <strong>Important:</strong> Take a screenshot of this confirmation for your records.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => window.print()}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button
                            className="flex-[2] bg-black hover:bg-gray-800"
                            onClick={() => navigate("/student")}
                        >
                            Done
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

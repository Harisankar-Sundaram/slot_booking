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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
                <div className="text-center space-y-4">
                    <p className="text-gray-600">No booking details found.</p>
                    <Button onClick={() => navigate("/student")} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                        Go Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const handleCopyBookingId = () => {
        navigator.clipboard.writeText(String(booking.bookingId));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
            <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-10 pb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white/20 p-5 rounded-full">
                            <CheckCircle className="w-16 h-16 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl text-center font-black">Booking Confirmed!</CardTitle>
                    <p className="text-center text-purple-100 mt-2">Your slot has been successfully reserved</p>
                </CardHeader>

                <CardContent className="p-8 space-y-6">
                    {/* Booking ID - Prominent */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-dashed border-purple-200 flex justify-between items-center">
                        <div>
                            <span className="text-purple-500 text-xs uppercase font-bold">Booking ID</span>
                            <p className="font-mono font-black text-2xl text-gray-900">#{booking.bookingId}</p>
                        </div>
                        <button
                            onClick={handleCopyBookingId}
                            className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                            title="Copy Booking ID"
                        >
                            <Copy className="h-5 w-5 text-purple-500" />
                        </button>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid gap-4">
                        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                            <Calendar className="h-6 w-6 text-purple-600 mt-0.5" />
                            <div>
                                <span className="text-gray-500 text-sm font-medium">Exam</span>
                                <p className="font-bold text-lg text-gray-900">{booking.examName || "PET Examination"}</p>
                                <p className="text-purple-600 font-medium">{booking.examDate}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                            <User className="h-6 w-6 text-indigo-600 mt-0.5" />
                            <div>
                                <span className="text-gray-500 text-sm font-medium">Student</span>
                                <p className="font-bold text-lg text-gray-900">{booking.rollNo}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                            <Briefcase className="h-6 w-6 text-violet-600 mt-0.5" />
                            <div>
                                <span className="text-gray-500 text-sm font-medium">Department & Category</span>
                                <p className="font-bold text-lg text-gray-900">{booking.department}</p>
                                <p className="text-violet-600 font-medium">{booking.category}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-fuchsia-50 to-purple-50 rounded-xl border border-fuchsia-100">
                            <MapPin className="h-6 w-6 text-fuchsia-600 mt-0.5" />
                            <div>
                                <span className="text-gray-500 text-sm font-medium">Location</span>
                                <p className="font-bold text-lg text-gray-900">Exam Hall</p>
                                <p className="text-fuchsia-600 font-medium">Check notice board for hall allocation</p>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-xl p-4">
                        <p className="text-purple-800 text-sm font-medium">
                            📸 <strong>Important:</strong> Take a screenshot of this confirmation for your records.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
                            onClick={() => window.print()}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button
                            className="flex-[2] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
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

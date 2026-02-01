import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Confirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const booking = location.state?.booking;

    if (!booking) {
        return <div className="p-10 text-center">No booking details found. <Button onClick={() => navigate("/student")}>Go Back</Button></div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl text-green-600">Booking Confirmed!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                    <div className="border-b pb-2">
                        <span className="text-gray-500 text-sm">Booking ID</span>
                        <p className="font-mono font-bold text-lg">#{booking.bookingId}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 text-sm">Student</span>
                        <p className="font-medium">{booking.student.name} ({booking.student.rollNo})</p>
                    </div>
                    <div>
                        <span className="text-gray-500 text-sm">Slot</span>
                        <p className="font-medium">{booking.slot.examDate} | {booking.slot.startTime} - {booking.slot.endTime}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 text-sm">Location</span>
                        <p className="font-medium">Exam Hall A</p>
                    </div>
                    <div className="pt-4">
                        <Button className="w-full" onClick={() => navigate("/student")}>Done</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

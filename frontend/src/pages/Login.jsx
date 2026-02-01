import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Login() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Login Form, 2: OTP

    // Student State
    const [rollNo, setRollNo] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    // Admin State
    const [password, setPassword] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleStudentLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (step === 1) {
                await axios.post("/api/auth/student/login", { rollNo, email });
                setStep(2);
            } else {
                const res = await axios.post("/api/auth/student/verify", { email, otp });
                login(res.data.token, "STUDENT");
                navigate("/student");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("/api/auth/admin/login", { email, password });
            login(res.data.token, "ADMIN");
            navigate("/admin");
        } catch (err) {
            alert("Invalid Credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle className="text-center">PET Slot Booking</CardTitle>
                    <div className="flex justify-center space-x-4 mt-2">
                        <button
                            onClick={() => setIsAdmin(false)}
                            className={`text-sm ${!isAdmin ? 'font-bold underline' : 'text-gray-500'}`}
                        >Student</button>
                        <button
                            onClick={() => setIsAdmin(true)}
                            className={`text-sm ${isAdmin ? 'font-bold underline' : 'text-gray-500'}`}
                        >Admin</button>
                    </div>
                </CardHeader>
                <CardContent>
                    {!isAdmin ? (
                        <form onSubmit={handleStudentLogin} className="space-y-4">
                            {step === 1 ? (
                                <>
                                    <Input placeholder="Roll Number" value={rollNo} onChange={e => setRollNo(e.target.value)} required />
                                    <Input placeholder="College Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="text-sm text-center text-gray-500">OTP sent to {email}</div>
                                    <Input placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required />
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin" /> : "Verify OTP"}
                                    </Button>
                                </>
                            )}
                        </form>
                    ) : (
                        <form onSubmit={handleAdminLogin} className="space-y-4">
                            <Input placeholder="Admin Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : "Login"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

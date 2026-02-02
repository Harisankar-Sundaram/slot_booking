import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, User, Key, Eye, EyeOff, ShieldCheck } from "lucide-react";

// Ensure axios knows where your Spring Boot backend is
axios.defaults.baseURL = "http://localhost:8080";

export default function Login() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Login/Details, 2: OTP (Student only)

    // State
    const [rollNo, setRollNo] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // Mapping Student Logic
    const handleStudentLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (step === 1) {
                // Mapping to: initiateStudentLogin(Dtos.LoginRequest request)
                await axios.post("/api/auth/student/login", { rollNo, email });
                setStep(2);
            } else {
                // Mapping to: verifyStudentOtp(Dtos.OtpVerificationRequest request)
                const res = await axios.post("/api/auth/student/verify", { email, otp });
                login(res.data.token, "STUDENT");
                navigate("/student");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Student Login failed");
        } finally {
            setLoading(false);
        }
    };

    // Mapping Admin Logic
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mapping to: adminLogin(Dtos.AdminLoginRequest request)
            const res = await axios.post("/api/auth/admin/login", { email, password });
            login(res.data.token, "ADMIN");
            navigate("/admin");
        } catch (err) {
            alert(err.response?.data?.message || "Invalid Admin Credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full font-sans bg-white">
            {/* LEFT SIDE - Branding */}
            <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-black text-white p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative z-10 text-center space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-3xl">PET</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight">Slot Booking</h1>
                    <p className="text-lg text-gray-400 max-w-md mx-auto">
                        Securely book your examination slots and manage your schedules.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE - Forms */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
                        <p className="text-gray-500 mt-2">Enter your credentials to access the portal.</p>
                    </div>

                    {/* Role Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => { setIsAdmin(false); setStep(1); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isAdmin ? "bg-white text-black shadow-sm" : "text-gray-500"}`}
                        >Student</button>
                        <button
                            onClick={() => setIsAdmin(true)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isAdmin ? "bg-white text-black shadow-sm" : "text-gray-500"}`}
                        >Admin</button>
                    </div>

                    {!isAdmin ? (
                        <form onSubmit={handleStudentLogin} className="space-y-6">
                            {step === 1 ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input className="pl-10" placeholder="Roll Number" value={rollNo} onChange={e => setRollNo(e.target.value)} required />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input className="pl-10" placeholder="College Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-sm text-center bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100">
                                        OTP sent to <strong>{email}</strong>
                                    </div>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input className="pl-10 text-center tracking-widest" placeholder="6-Digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                                        <Button type="submit" className="flex-[2] bg-blue-600" disabled={loading}>
                                            {loading ? <Loader2 className="animate-spin" /> : "Verify & Login"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    ) : (
                        <form onSubmit={handleAdminLogin} className="space-y-6">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input className="pl-10" placeholder="Admin Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="relative">
                                    <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input className="pl-10 pr-10" placeholder="Password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <Button type="submit" className="w-full bg-black" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : "Admin Login"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
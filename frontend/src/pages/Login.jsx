import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { Loader2, Mail, User, Key, Eye, EyeOff, ShieldCheck } from "lucide-react";

axios.defaults.baseURL = "http://localhost:8080";

export default function Login() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [rollNo, setRollNo] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // Student Login Handler
    const handleStudentLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (step === 1) {
                await axios.post("/api/auth/student/login", { rollNo, email });
                toast.success("OTP sent to your email!");
                setStep(2);
            } else {
                const res = await axios.post("/api/auth/student/verify", { email, otp });
                toast.success("Login successful! Redirecting...");
                login(res.data.token, "STUDENT");
                navigate("/student");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Student Login failed");
        } finally { setLoading(false); }
    };

    // Admin Login Handler
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("/api/auth/admin/login", { email: adminEmail, password });
            toast.success("Admin login successful!");
            login(res.data.token, "ADMIN");
            navigate("/admin");
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid Admin Credentials");
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-wrapper">
            <style>{`
                .auth-wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    font-family: 'Segoe UI', sans-serif;
                }
                .container {
                    position: relative;
                    width: 850px;
                    height: 550px;
                    background: #fff;
                    border-radius: 30px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, .25);
                    overflow: hidden;
                }
                .form-box {
                    position: absolute;
                    width: 50%;
                    height: 100%;
                    background: #fff;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 40px;
                    z-index: 1;
                }
                .form-box.student {
                    left: 0;
                    opacity: 1;
                    visibility: visible;
                    transition: all 0.6s ease-in-out;
                }
                .container.active .form-box.student {
                    opacity: 0;
                    visibility: hidden;
                }
                .form-box.admin {
                    right: 0;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.6s ease-in-out;
                }
                .container.active .form-box.admin {
                    opacity: 1;
                    visibility: visible;
                }
                .input-group {
                    position: relative;
                    margin: 15px 0;
                }
                .input-group input {
                    width: 100%;
                    padding: 14px 15px 14px 45px;
                    background: #f5f5f5;
                    border-radius: 10px;
                    border: 2px solid transparent;
                    outline: none;
                    font-size: 14px;
                    transition: all 0.3s;
                }
                .input-group input:focus {
                    border-color: #667eea;
                    background: #fff;
                }
                .input-group .icon {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #888;
                }
                .input-group label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 6px;
                }
                .input-group label .required {
                    color: #ef4444;
                }
                .toggle-box {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                }
                .toggle-box::before {
                    content: '';
                    position: absolute;
                    right: -250%;
                    width: 300%;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 150px;
                    z-index: 2;
                    transition: 1.8s ease-in-out;
                    pointer-events: all;
                }
                .container.active .toggle-box::before {
                    right: 50%;
                }
                .toggle-panel {
                    position: absolute;
                    width: 50%;
                    height: 100%;
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 2;
                    transition: .6s ease-in-out;
                    pointer-events: all;
                    text-align: center;
                    padding: 40px;
                }
                .toggle-left { 
                    left: -50%; 
                    transition-delay: .6s; 
                }
                .container.active .toggle-left { 
                    left: 0; 
                    transition-delay: 1.2s; 
                }
                
                .toggle-right { 
                    right: 0; 
                    transition-delay: 1.2s; 
                }
                .container.active .toggle-right { 
                    right: -50%; 
                    transition-delay: .6s; 
                }

                .main-btn {
                    width: 100%;
                    height: 50px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-weight: 600;
                    font-size: 15px;
                    cursor: pointer;
                    margin-top: 15px;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .main-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
                }
                .main-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }
                .main-btn.secondary {
                    background: #e5e7eb;
                    color: #374151;
                }
                .ghost-btn {
                    width: 160px;
                    height: 48px;
                    background: rgba(255,255,255,0.2);
                    border: 2px solid #fff;
                    border-radius: 10px;
                    color: #fff;
                    cursor: pointer;
                    margin-top: 25px;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                .ghost-btn:hover {
                    background: #fff;
                    color: #667eea;
                }
                .otp-notice {
                    background: #dcfce7;
                    color: #166534;
                    padding: 12px;
                    border-radius: 10px;
                    text-align: center;
                    font-size: 13px;
                    margin-bottom: 15px;
                    border: 1px solid #bbf7d0;
                }
                .form-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1f2937;
                    text-align: center;
                    margin-bottom: 25px;
                }
                .toggle-title {
                    font-size: 26px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                .toggle-desc {
                    opacity: 0.9;
                    font-size: 14px;
                    line-height: 1.5;
                }
                .required-note {
                    text-align: center;
                    font-size: 11px;
                    color: #9ca3af;
                    margin-top: 20px;
                }
                .eye-toggle {
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: #888;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>

            <div className={`container ${isAdmin ? "active" : ""}`}>

                {/* STUDENT LOGIN FORM - Left Side */}
                <div className="form-box student">
                    <form onSubmit={handleStudentLogin}>
                        <h1 className="form-title">🎓 Student Login</h1>
                        {step === 1 ? (
                            <>
                                <div className="input-group">
                                    <label>Roll Number <span className="required">*</span></label>
                                    <User className="icon" size={18} />
                                    <input
                                        placeholder="Enter your roll number"
                                        value={rollNo}
                                        onChange={e => setRollNo(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>College Email <span className="required">*</span></label>
                                    <Mail className="icon" size={18} />
                                    <input
                                        placeholder="Enter your college email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="main-btn" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Send OTP →"}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="otp-notice">
                                    ✓ OTP sent to <strong>{email}</strong>
                                </div>
                                <div className="input-group">
                                    <label>OTP Code <span className="required">*</span></label>
                                    <ShieldCheck className="icon" size={18} />
                                    <input
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        maxLength={6}
                                        required
                                        style={{ letterSpacing: '4px', fontWeight: 'bold' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" onClick={() => setStep(1)} className="main-btn secondary" style={{ flex: 1 }}>
                                        ← Back
                                    </button>
                                    <button type="submit" className="main-btn" style={{ flex: 2 }} disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify & Login"}
                                    </button>
                                </div>
                            </>
                        )}
                        <p className="required-note"><span className="required">*</span> indicates required field</p>
                    </form>
                </div>

                {/* ADMIN LOGIN FORM - Right Side */}
                <div className="form-box admin">
                    <form onSubmit={handleAdminLogin}>
                        <h1 className="form-title">🔐 Admin Portal</h1>
                        <div className="input-group">
                            <label>Admin Email <span className="required">*</span></label>
                            <Mail className="icon" size={18} />
                            <input
                                placeholder="Enter admin email"
                                type="email"
                                value={adminEmail}
                                onChange={e => setAdminEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Password <span className="required">*</span></label>
                            <Key className="icon" size={18} />
                            <input
                                placeholder="Enter password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <div className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                        <button type="submit" className="main-btn" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Login as Admin →"}
                        </button>
                        <p className="required-note"><span className="required">*</span> indicates required field</p>
                    </form>
                </div>

                {/* SLIDING PANELS */}
                <div className="toggle-box">
                    <div className="toggle-panel toggle-left">
                        <h1 className="toggle-title">Student Portal</h1>
                        <p className="toggle-desc">Book your exam slot quickly and securely with OTP verification.</p>
                        <button className="ghost-btn" onClick={() => { setIsAdmin(false); setStep(1); }}>
                            ← Student Login
                        </button>
                    </div>

                    <div className="toggle-panel toggle-right">
                        <h1 className="toggle-title">Admin Access</h1>
                        <p className="toggle-desc">Manage exam slots, view bookings, and control student access.</p>
                        <button className="ghost-btn" onClick={() => { setIsAdmin(true); }}>
                            Admin Login →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
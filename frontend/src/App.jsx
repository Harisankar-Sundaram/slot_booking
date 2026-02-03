import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/toast";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Confirmation from "./pages/Confirmation";

// Protected Route Component - Blocks unauthorized access
const ProtectedRoute = ({ children, role }) => {
  const { token, role: userRole } = useAuth();

  // If not logged in, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If wrong role, redirect to login
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component - Redirects logged-in users away from login
const PublicRoute = ({ children }) => {
  const { token, role } = useAuth();

  // If already logged in, redirect to appropriate dashboard
  if (token) {
    if (role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else if (role === "STUDENT") {
      return <Navigate to="/student" replace />;
    }
  }

  return children;
};

// Main App Routes - Must be inside AuthProvider
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route - Login */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      {/* Student Routes - Protected */}
      <Route path="/student" element={
        <ProtectedRoute role="STUDENT">
          <StudentDashboard />
        </ProtectedRoute>
      } />

      <Route path="/student/confirmation" element={
        <ProtectedRoute role="STUDENT">
          <Confirmation />
        </ProtectedRoute>
      } />

      {/* Admin Routes - Protected */}
      <Route path="/admin" element={
        <ProtectedRoute role="ADMIN">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Catch all - Redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

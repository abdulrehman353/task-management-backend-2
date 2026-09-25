import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Components
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute'; // <-- Naya Protected Route Guard

// Pages
import Organizations from './pages/Organizations';
import Projects from './pages/Projects';
import Tickets from './pages/Tickets';
import Attachments from './pages/Attachments';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import DashboardOverview from './pages/DashboardOverview';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Auth Flows */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Dashboard Portal (Bina login koi access nahi kar sakta) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default /dashboard opens DashboardOverview */}
          <Route index element={<DashboardOverview />} />
          <Route path="overview" element={<DashboardOverview />} />
          
          <Route path="organizations" element={<Organizations />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="attachments" element={<Attachments />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="permissions" element={<Permissions />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
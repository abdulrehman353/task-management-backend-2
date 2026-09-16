import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Components folder se correct import path
import DashboardLayout from './components/DashboardLayout';

// Pages folder se actual components
import Organizations from './pages/Organizations';
import Projects from './pages/Projects';
import Tickets from './pages/Tickets';
import Attachments from './pages/Attachments';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Flows */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Dashboard Portal with Responsive Layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/organizations" replace />} />
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
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LoginTest from "./pages/LoginTest";
import RegisterTest from "./pages/RegisterTest";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminDepartments from "./pages/admin/AdminDepartments.jsx";
import WorkSchedules from "./pages/admin/WorkSchedules.jsx";
import DepartmentEmployees from "./pages/manager/DepartmentEmployees.jsx";
import DepartmentAttendance from "./pages/manager/DepartmentAttendance.jsx";
import LeaveRequests from "./pages/LeaveRequests.jsx";
import TeamLeaveRequests from "./pages/manager/TeamLeaveRequests.jsx";
import AppLayout from "./layouts/AppLayout.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logintest" element={<LoginTest />} />
        <Route path="/registertest" element={<RegisterTest />} />


        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
          <Route path="/admin/work-schedules" element={<WorkSchedules />} />
          <Route path="/manager/department-employees" element={<DepartmentEmployees />} />
           <Route path="/manager/department-attendance" element={<DepartmentAttendance />} />
            <Route path="/leaves" element={<LeaveRequests />} />
          <Route path="/manager/leaves" element={<TeamLeaveRequests />} />
        </Route>

        <Route path="/" element={<Navigate to="/logintest" />} />
        <Route path="*" element={<Navigate to="/logintest" />} />
      </Routes>
    </BrowserRouter>
  );
}
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

export default function AppLayout() {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, height: "100vh", overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}
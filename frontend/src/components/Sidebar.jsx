import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Button, Typography } from "antd";
import { DashboardOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";

const { Text } = Typography;

const NAV_ITEMS = [
  { key: "/dashboard", label: "Dashboard", roles: ["ROLE_EMPLOYEE", "ROLE_MANAGER"] },
  { key: "/leaves", label: "İzin Taleplerim", roles: ["ROLE_EMPLOYEE", "ROLE_MANAGER"] },
   { key: "/manager/department-employees", label: "Departmanım", roles: ["ROLE_MANAGER"] },
   { key: "/manager/department-attendance", label: "Giriş/Çıkış Kayıtları", roles: ["ROLE_MANAGER"] },
  { key: "/admin/users", label: "Kullanıcılar", roles: ["ROLE_ADMIN"] },
  { key: "/admin/departments", label: "Departmanlar", roles: ["ROLE_ADMIN"] },
  { key: "/admin/work-schedules", label: "Mesai Kuralları", roles: ["ROLE_ADMIN"] },
  { key: "/manager/leaves", label: "Ekip İzin Talepleri", roles: ["ROLE_MANAGER"] },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = storedUser.role || "ROLE_EMPLOYEE";

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));
  //console.log("role:", role, "visibleItems:", visibleItems); // GEÇİCİ

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/logintest");
  };
    
  return (
    
    <div
      style={{
        width: 240,
        height: "95vh",
        flexShrink: 0,
        background: "#1f2733",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 0",
        overflowY: "auto",
      }}
    >
      <div>
        <div style={{ padding: "0 24px", marginBottom: 32 }}>
          <Text strong style={{ color: "#fff", fontSize: 18 }}>
            iCard
          </Text>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={visibleItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
          style={{ background: "transparent", borderInlineEnd: "none" }}
        />
      </div>

      <div style={{ padding: "0 24px" }}>
        <div style={{ marginBottom: 16 }}>
          <Text style={{ color: "#fff", display: "block" }}>
            {storedUser.firstName} {storedUser.lastName}
          </Text>
          {/*<Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{role}</Text>*/}
        </div>
        <Button danger block icon={<LogoutOutlined />} onClick={handleLogout}>
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}
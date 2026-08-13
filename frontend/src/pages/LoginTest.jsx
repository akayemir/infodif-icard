import { useState } from "react";
import { Form, Input, Button, message, Card} from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function LoginTest() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", values);
      // res.data: { token, email, firstName, lastName, role }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      message.success("Giriş başarılı");

      if (res.data.role === "ROLE_ADMIN") {
        navigate("/admin/users");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Giriş başarısız";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <title>Giriş Yap</title>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #bacada 0%, #53d4db 100%)",
          padding: "20px",
        }}
      >
        <Card
          style={{
            width: 380,
            borderRadius: 16,
            boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
            border: "none",
          }}
          bodyStyle={{ padding: "36px 32px" }}
        >
          <h1
            style={{
              textAlign: "center",
              marginBottom: 28,
              fontWeight: 600,
              color: "#1a1a1a",
            }}
          >
            Giriş Yap
          </h1>

          <Form onFinish={onFinish} layout="vertical" size="large">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Email adresinizi girin." },
                { type: "email", message: "Geçerli bir email adresi girin." },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#999" }} />}
                placeholder="Email adresiniz"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Şifrenizi girin." }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#999" }} />}
                placeholder="Şifreniz"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ borderRadius: 8, fontWeight: 500 }}
              >
                Giriş Yap
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center", color: "#666" }}>
              Hesabın yok mu? <Link to="/registertest">Kayıt ol</Link>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
}
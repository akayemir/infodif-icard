import { useState } from "react";
import { Form, Input, Button, message, Card} from "antd";
import { MailOutlined, LockOutlined, UserOutlined} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function RegisterTest() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
        await api.post("/auth/register", {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
        });
        message.success("Kayıt başarılı, giriş yapabilirsin");
        navigate("/logintest");
        } catch (err) {
        const msg = err.response?.data?.message || "Kayıt başarısız";
        message.error(msg);
        } finally {
        setLoading(false);
        }
    };

  return (
    <>
      <title>Kayıt Ol</title>

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
            Kayıt Ol
          </h1>

            <Form onFinish={onFinish} layout="vertical" size="large">
           <Form.Item
              name="firstName"
              rules={[{ required: true, message: "Adınızı girin." }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#999" }} />}
                placeholder="Adınız"
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              rules={[{ required: true, message: "Soyadınızı girin." }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#999" }} />}
                placeholder="Soyadınız"
              />
            </Form.Item>

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
                Kayıt Ol
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center", color: "#666" }}>
              Hesabın var mı? <Link to="/logintest">Giriş yap</Link>
            </div>
            </Form>
        </Card>
      </div>

    {/*
    <div
        style={{

        backgroundColor: "#00000000",
        display: "flex",
        justifyContent: "center",

        }}
        >
      

    <Card style={{ backgroundColor: "#accbd1", width: 360, margin: "0 auto", marginTop: "150px" }}>
        <h1>Kayıt Ol</h1>
      <Form onFinish={onFinish}>
        <Form.Item
          name="firstName"
          rules={[
            { required: true, message: "Adınızı girin." },
          ]}
        >
          <Input placeholder="Adınız" />
        </Form.Item>

        <Form.Item
          name="lastName"
          rules={[
            { required: true, message: "Soyadınızı girin." },
          ]}
        >
          <Input placeholder="Soyadınız" />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Email adresinizi girin." },
            { type: "email", message: "Geçerli bir email adresi girin." },
          ]}
        >
          <Input placeholder="Email adresiniz" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Şifrenizi girin." },
    
          ]}
        >
          <Input placeholder="Şifreniz" />
        </Form.Item>

        <Form.Item>
        <Button type="primary" htmlType="submit">
            Kayıt Ol
        </Button>
        </Form.Item>

        <div style={{ textAlign: "center" }}>
            Hesabın yok mu? <Link to="/logintest">Giriş yap</Link>
        </div>

      </Form>
      </Card>
      </div>
      */}
    </>
  );
}
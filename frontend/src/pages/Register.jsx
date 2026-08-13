import { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const { Title } = Typography;

export default function Register() {
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
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Kayıt başarısız";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card style={{ width: 380 }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Kayıt Ol
        </Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Ad"
            name="firstName"
            rules={[{ required: true, message: "Ad giriniz" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Soyad"
            name="lastName"
            rules={[{ required: true, message: "Soyad giriniz" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email giriniz" },
              { type: "email", message: "Geçerli bir email giriniz" },
            ]}
          >
            <Input placeholder="ornek@mail.com" />
          </Form.Item>

          <Form.Item
            label="Şifre"
            name="password"
            rules={[
              { required: true, message: "Şifre giriniz" },
              { min: 6, message: "En az 6 karakter olmalı" },
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Kayıt Ol
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
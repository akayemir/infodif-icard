import { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Form, Select, TimePicker, InputNumber, message, Space, Typography, Card } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../api/axios";

const { Title } = Typography;

const GENEL_VALUE = ""; 

export default function WorkSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/work-schedules");
      setSchedules(res.data);
    } catch (err) {
      message.error("Mesai kuralları alınamadı");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get("/admin/departments");
      setDepartments(res.data);
    } catch (err) {
      message.error("Departmanlar alınamadı");
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
    fetchDepartments();
  }, [fetchSchedules, fetchDepartments]);

  const openCreateModal = () => {
    setEditingSchedule(null);
    form.resetFields();
    form.setFieldsValue({ departmentId: GENEL_VALUE, toleranceMinutes: 0 });
    setModalOpen(true);
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    form.setFieldsValue({
      departmentId: schedule.departmentId ?? GENEL_VALUE,
      startTime: schedule.startTime ? dayjs(schedule.startTime, "HH:mm:ss") : null,
      endTime: schedule.endTime ? dayjs(schedule.endTime, "HH:mm:ss") : null,
      toleranceMinutes: schedule.toleranceMinutes,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        departmentId: values.departmentId,
        startTime: values.startTime.format("HH:mm:ss"),
        endTime: values.endTime.format("HH:mm:ss"),
        toleranceMinutes: values.toleranceMinutes,
      };

      if (editingSchedule) {
        await api.put(`/admin/work-schedules/${editingSchedule.id}`, payload);
        message.success("Mesai kuralı güncellendi");
      } else {
        await api.post("/admin/work-schedules", payload);
        message.success("Mesai kuralı oluşturuldu");
      }

      setModalOpen(false);
      fetchSchedules();
    } catch (err) {
      if (err?.errorFields) return; // form validasyon hatası
      const msg = err.response?.data?.message || "İşlem başarısız";
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (value) => (value ? value.slice(0, 5) : "-"); 

  const columns = [
    {
      title: "Kapsam",
      dataIndex: "departmentName",
      key: "departmentName",
      render: (name) => name || "Genel Kural",
    },
    {
      title: "Mesai Başlangıç",
      dataIndex: "startTime",
      key: "startTime",
      render: formatTime,
    },
    {
      title: "Mesai Bitiş",
      dataIndex: "endTime",
      key: "endTime",
      render: formatTime,
    },
    {
      title: "Tolerans (dk)",
      dataIndex: "toleranceMinutes",
      key: "toleranceMinutes",
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Düzenle
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #bacada 0%, #53d4db 100%)",
        padding: "32px 24px 100px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Title
          level={2}
          style={{
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: -0.5,
            margin: "0 0 28px",
          }}
        >
          Mesai Kuralları
        </Title>

        <Card
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <b>Kayıtlar</b>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                Yeni Kural
              </Button>
            </div>
          }
          style={{
            borderRadius: 14,
            border: "none",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={columns}
            dataSource={schedules}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>

      <Modal
        title={editingSchedule ? "Mesai Kuralını Düzenle" : "Yeni Mesai Kuralı"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingSchedule ? "Güncelle" : "Oluştur"}
        cancelText="Vazgeç"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Departman"
            name="departmentId"
            rules={[{ required: true, message: "Departman seçin" }]}
          >
            <Select
              options={[
                { value: GENEL_VALUE, label: "Genel Kural (tüm departmanlar)" },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Mesai Başlangıç Saati"
            name="startTime"
            rules={[{ required: true, message: "Başlangıç saati seçin" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Mesai Bitiş Saati"
            name="endTime"
            rules={[{ required: true, message: "Bitiş saati seçin" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Tolerans (dakika)"
            name="toleranceMinutes"
            rules={[{ required: true, message: "Tolerans dakikası girin" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
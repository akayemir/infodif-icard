import { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Form, Select, DatePicker, Input, Tag, message, Typography, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../api/axios";

const { Title } = Typography;
const { TextArea } = Input;

const LEAVE_TYPE_OPTIONS = [
  { value: "ANNUAL", label: "Yıllık İzin" },
  { value: "EXCUSE", label: "Mazeret İzni" },
  { value: "SICK", label: "Hastalık İzni" },
];

const LEAVE_TYPE_LABELS = {
  ANNUAL: "Yıllık İzin",
  EXCUSE: "Mazeret İzni",
  SICK: "Hastalık İzni",
};

const STATUS_TAG = {
  PENDING: { color: "gold", label: "Beklemede" },
  APPROVED: { color: "green", label: "Onaylandı" },
  REJECTED: { color: "red", label: "Reddedildi" },
};

export default function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/leaves/me");
      setLeaves(res.data);
    } catch (err) {
      message.error("İzin talepleri alınamadı");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const openCreateModal = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      await api.post("/leaves", {
        startDate: values.dateRange[0].format("YYYY-MM-DD"),
        endDate: values.dateRange[1].format("YYYY-MM-DD"),
        leaveType: values.leaveType,
        reason: values.reason,
      });

      message.success("İzin talebi oluşturuldu");
      setModalOpen(false);
      fetchLeaves();
    } catch (err) {
      if (err?.errorFields) return; // form validasyon hatası
      const msg = err.response?.data?.message || "İşlem başarısız";
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: "Başlangıç", dataIndex: "startDate", key: "startDate" },
    { title: "Bitiş", dataIndex: "endDate", key: "endDate" },
    {
      title: "Tür",
      dataIndex: "leaveType",
      key: "leaveType",
      render: (type) => LEAVE_TYPE_LABELS[type] || type,
    },
    { title: "Sebep", dataIndex: "reason", key: "reason", render: (v) => v || "-" },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const cfg = STATUS_TAG[status] || { color: "default", label: status };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: "Onaylayan",
      dataIndex: "approvedByName",
      key: "approvedByName",
      render: (v) => v || "-",
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
          İzin Taleplerim
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
                Yeni Talep
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
            dataSource={leaves}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>

      <Modal
        title="Yeni İzin Talebi"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Oluştur"
        cancelText="Vazgeç"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tarih Aralığı"
            name="dateRange"
            rules={[{ required: true, message: "Başlangıç ve bitiş tarihi seçin" }]}
          >
            <DatePicker.RangePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label="İzin Türü"
            name="leaveType"
            rules={[{ required: true, message: "İzin türü seçin" }]}
          >
            <Select options={LEAVE_TYPE_OPTIONS} />
          </Form.Item>

          <Form.Item label="Sebep" name="reason">
            <TextArea rows={3} placeholder="Opsiyonel" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
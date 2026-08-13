import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Typography,
  Dropdown,
  Spin,
  Card,
} from "antd";
import { PlusOutlined, EditOutlined, BarChartOutlined } from "@ant-design/icons";
import api from "../../api/axios";

const { Title, Text } = Typography;

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]); // sadece ROLE_MANAGER kullanıcılar
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null); // null = yeni, dolu = düzenleme
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // İstatistik dropdown'ı için: hangi departmanın açık olduğu + yüklenen veri
  const [statsOpenId, setStatsOpenId] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/departments");
      setDepartments(res.data);
    } catch (err) {
      message.error("Departmanlar alınamadı");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchManagers = useCallback(async () => {
    try {
      // Backend'e "sadece ROLE_MANAGER" filtresini gönderiyoruz, ve tek
      // sayfada hepsini almak için büyük bir size veriyoruz - client-side
      // filtreleme yapıp sadece ilk sayfayı (varsayılan 10) filtrelemek,
      // 10'dan fazla kullanıcı varsa bazı manager'ları kaçırırdı.
      const res = await api.get("/admin/users", {
        params: {
          size: 1000,
          filterField: "role",
          filterOperator: "EQ",
          filterValue: "ROLE_MANAGER",
        },
      });
      setManagers(res.data.content);
    } catch (err) {
      message.error("Yöneticiler alınamadı");
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
  }, [fetchDepartments, fetchManagers]);

  const openCreateModal = () => {
    setEditingDepartment(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);
    form.setFieldsValue({
      name: department.name,
      managerId: department.managerId || undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editingDepartment) {
        await api.put(`/admin/departments/${editingDepartment.id}`, {
          name: values.name,
          managerId: values.managerId ?? "",
        });
        message.success("Departman güncellendi");
      } else {
        await api.post("/admin/departments", {
          name: values.name,
          managerId: values.managerId,
        });
        message.success("Departman oluşturuldu");
      }

      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      if (err?.errorFields) return; // form validasyon hatası
      const msg = err.response?.data?.message || "İşlem başarısız";
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleStatsOpenChange = async (open, departmentId) => {
    if (open) {
      setStatsOpenId(departmentId);
      setStatsData(null);
      setStatsLoading(true);
      try {
        const res = await api.get(`/departments/${departmentId}/stats`);
        setStatsData(res.data);
      } catch (err) {
        message.error("İstatistikler alınamadı");
      } finally {
        setStatsLoading(false);
      }
    } else {
      setStatsOpenId(null);
    }
  };

  const columns = [
    { title: "Departman Adı", dataIndex: "name", key: "name" },
    {
      title: "Yönetici",
      dataIndex: "managerName",
      key: "managerName",
      render: (v) => v || "-",
    },
    {
      title: "Oluşturulma",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (v) => (v ? new Date(v).toLocaleString("tr-TR") : "-"),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Düzenle
          </Button>

          <Dropdown
            trigger={["click"]}
            open={statsOpenId === record.id}
            onOpenChange={(open) => handleStatsOpenChange(open, record.id)}
            dropdownRender={() => (
              <div
                style={{
                  background: "#fff",
                  padding: 16,
                  borderRadius: 8,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                  minWidth: 220,
                }}
              >
                {statsLoading ? (
                  <div style={{ textAlign: "center", padding: 12 }}>
                    <Spin size="small" />
                  </div>
                ) : statsData ? (
                  <Space direction="vertical" size={4}>
                    <Text strong>{statsData.departmentName}</Text>
                    <Text>Toplam Çalışma: {statsData.totalHours} saat</Text>
                    <Text>Haftalık Çalışma: {statsData.weeklyHours} saat</Text>
                  </Space>
                ) : (
                  <Text type="secondary">Veri yok</Text>
                )}
              </div>
            )}
          >
            <Button size="small" icon={<BarChartOutlined />}>
              İstatistikler
            </Button>
          </Dropdown>
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
          Departmanlar
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
                Yeni Departman
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
            dataSource={departments}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>

      <Modal
        title={editingDepartment ? "Departmanı Düzenle" : "Yeni Departman"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingDepartment ? "Güncelle" : "Oluştur"}
        cancelText="Vazgeç"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Departman Adı"
            name="name"
            rules={[{ required: true, message: "Departman adı gerekli" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Yönetici" name="managerId">
            <Select
              allowClear
              placeholder="Yönetici seç (opsiyonel)"
              options={managers.map((m) => ({
                value: m.id,
                label: `${m.firstName} ${m.lastName}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
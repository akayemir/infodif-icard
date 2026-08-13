import { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Select, Switch, message, Popconfirm, Space, Typography, Card } from "antd";
import { PlusOutlined, EditOutlined, StopOutlined } from "@ant-design/icons";
import UserFilter from "../../components/UserFilter.jsx";
import api from "../../api/axios";

const { Title } = Typography;

const ROLE_OPTIONS = [
  { value: "ROLE_EMPLOYEE", label: "Employee" },
  { value: "ROLE_MANAGER", label: "Manager" },
  { value: "ROLE_ADMIN", label: "Admin" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tablePagination, setTablePagination] = useState({ current: 1, pageSize: 10, total: 0 });
  // İlk yüklemede bilerek null - backend'in "aktiflik -> rol -> ad" varsayılan
  // sıralamasının devreye girmesi için `sort` parametresi hiç gönderilmemeli.
  // Kullanıcı bir sütun başlığına tıklayınca bunlar dolacak ve normal
  // sıralamaya geçilecek.
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async (page, pageSize, field, order, filter) => {
    setTableLoading(true);
    try {
      const sortParam = field ? `${field},${order === "ascend" ? "asc" : "desc"}` : undefined;

      const res = await api.get("/admin/users", {
        params: {
          page: page - 1,
          size: pageSize,
          sort: sortParam,
          ...(filter
            ? {
                filterField: filter.filterField,
                filterOperator: filter.filterOperator,
                filterValue: filter.filterValue,
              }
            : {}),
        },
      });

      setUsers(res.data.content);
      setTablePagination({
        current: page,
        pageSize,
        total: res.data.totalElements,
      });
    } catch (err) {
      message.error("Kullanıcılar alınamadı");
    } finally {
      setTableLoading(false);
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
    fetchUsers(1, 10, null, null, null);
    fetchDepartments();
  }, [fetchUsers, fetchDepartments]);

  const handleTableChange = (pagination, filters, sorter) => {
    // sorter.field/order sadece kullanıcı bir sütun başlığına TIKLADIYSA dolu
    // gelir. Sadece sayfa değiştirirken bunlar boştur - bu durumda null
    // bırakmalıyız, yoksa "createdDate" gibi bir fallback yazarsak, 1. sayfa
    // özel varsayılan sıralamayla (aktiflik->rol->ad), sonraki sayfalar farklı
    // bir sıralamayla gelir ve sonuçlar sayfalar arası tutarsız görünür.
    const field = sorter.field || null;
    const order = sorter.order || null;
    setSortField(field);
    setSortOrder(order);
    fetchUsers(pagination.current, pagination.pageSize, field, order, activeFilter);
  };

  const handlePageSizeChange = (newSize) => {
    fetchUsers(1, newSize, sortField, sortOrder, activeFilter);
  };

  const handleFilterApply = (filter) => {
    setActiveFilter(filter);
    fetchUsers(1, tablePagination.pageSize, sortField, sortOrder, filter);
  };

  const handleFilterClear = () => {
    setActiveFilter(null);
    fetchUsers(1, tablePagination.pageSize, sortField, sortOrder, null);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: "ROLE_EMPLOYEE", active: true });
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      active: user.active,
      departmentId: user.departmentId || undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, {
          firstName: values.firstName,
          lastName: values.lastName,
          role: values.role,
          active: values.active,
          departmentId: values.departmentId ?? "",
        });
        message.success("Kullanıcı güncellendi");
      } else {
        await api.post("/admin/users", {
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          role: values.role,
          active: values.active,
          departmentId: values.departmentId,
        });
        message.success("Kullanıcı oluşturuldu");
      }

      setModalOpen(false);
      fetchUsers(tablePagination.current, tablePagination.pageSize, sortField, sortOrder, activeFilter);
    } catch (err) {
      if (err?.errorFields) return;
      const msg = err.response?.data?.message || "İşlem başarısız";
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      message.success("Kullanıcı pasif hale getirildi");
      fetchUsers(tablePagination.current, tablePagination.pageSize, sortField, sortOrder, activeFilter);
    } catch (err) {
      const msg = err.response?.data?.message || "İşlem başarısız";
      message.error(msg);
    }
  };

  const columns = [
    { title: "Ad", dataIndex: "firstName", key: "firstName", sorter: true, sortOrder: sortField === "firstName" ? sortOrder : null },
    { title: "Soyad", dataIndex: "lastName", key: "lastName", sorter: true, sortOrder: sortField === "lastName" ? sortOrder : null },
    { title: "Email", dataIndex: "email", key: "email", sorter: true, sortOrder: sortField === "email" ? sortOrder : null },
    { title: "Rol", dataIndex: "role", key: "role", sorter: true, sortOrder: sortField === "role" ? sortOrder : null },
    { title: "Departman", dataIndex: "departmentName", key: "departmentName", render: (v) => v || "-" },
    { title: "Yönetici", dataIndex: "managerName", key: "managerName", render: (v) => v || "-" },
    {
      title: "Durum",
      dataIndex: "active",
      key: "active",
      sorter: true,
      sortOrder: sortField === "active" ? sortOrder : null,
      render: (active) => (active ? "Aktif" : "Pasif"),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Düzenle
          </Button>
          {record.active && (
            <Popconfirm
              title="Bu kullanıcıyı pasif hale getirmek istediğine emin misin?"
              onConfirm={() => handleDeactivate(record.id)}
              okText="Evet"
              cancelText="Vazgeç"
            >
              <Button size="small" danger icon={<StopOutlined />}>
                Pasife Al
              </Button>
            </Popconfirm>
          )}
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
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <Title
          level={2}
          style={{
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: -0.5,
            margin: "0 0 28px",
          }}
        >
          Kullanıcılar
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
              <Space>
                <UserFilter onApply={handleFilterApply} onClear={handleFilterClear} />
                <Select
                  value={tablePagination.pageSize}
                  onChange={handlePageSizeChange}
                  options={[
                    { value: 5, label: "5 / sayfa" },
                    { value: 10, label: "10 / sayfa" },
                    { value: 20, label: "20 / sayfa" },
                    { value: 50, label: "50 / sayfa" },
                  ]}
                  style={{ width: 120 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                  Yeni Kullanıcı
                </Button>
              </Space>
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
            dataSource={users}
            rowKey="id"
            loading={tableLoading}
            pagination={{ ...tablePagination, showSizeChanger: false }}
            onChange={handleTableChange}
          />
        </Card>
      </div>

      <Modal
        title={editingUser ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingUser ? "Güncelle" : "Oluştur"}
        cancelText="Vazgeç"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {!editingUser && (
            <>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email gerekli" },
                  { type: "email", message: "Geçerli bir email girin" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Şifre"
                name="password"
                rules={[{ required: true, message: "Şifre gerekli" }]}
              >
                <Input.Password />
              </Form.Item>
            </>
          )}

          <Form.Item label="Ad" name="firstName" rules={[{ required: true, message: "Ad gerekli" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Soyad" name="lastName" rules={[{ required: true, message: "Soyad gerekli" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Rol" name="role" rules={[{ required: true, message: "Rol seçin" }]}>
            <Select options={ROLE_OPTIONS} />
          </Form.Item>

          <Form.Item label="Departman" name="departmentId">
            <Select
              allowClear
              placeholder="Departman seç (opsiyonel)"
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>

          <Form.Item label="Aktif mi" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
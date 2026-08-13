import { useState, useEffect, useCallback } from "react";
import { Table, Button, Tag, Popconfirm, Space, message, Typography, Card } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import api from "../../api/axios";

const { Title } = Typography;

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

export default function TeamLeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tablePagination, setTablePagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [decidingId, setDecidingId] = useState(null); // hangi satırın butonu yükleniyor

  const fetchLeaves = useCallback(async (page, pageSize) => {
    setTableLoading(true);
    try {
      const res = await api.get("/manager/leaves", {
        params: { page: page - 1, size: pageSize },
      });
      setLeaves(res.data.content);
      setTablePagination({
        current: page,
        pageSize,
        total: res.data.totalElements,
      });
    } catch (err) {
      const msg = err.response?.data?.message || "İzin talepleri alınamadı";
      message.error(msg);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves(1, 10);
  }, [fetchLeaves]);

  const handleTableChange = (pagination) => {
    fetchLeaves(pagination.current, pagination.pageSize);
  };

  const handleDecision = async (id, decision) => {
    setDecidingId(id);
    try {
      await api.put(`/manager/leaves/${id}/${decision}`);
      message.success(decision === "approve" ? "Talep onaylandı" : "Talep reddedildi");
      fetchLeaves(tablePagination.current, tablePagination.pageSize);
    } catch (err) {
      const msg = err.response?.data?.message || "İşlem başarısız";
      message.error(msg);
    } finally {
      setDecidingId(null);
    }
  };

  const columns = [
    { title: "Çalışan", dataIndex: "userFullName", key: "userFullName" },
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
      title: "İşlemler",
      key: "actions",
      render: (_, record) =>
        record.status === "PENDING" ? (
          <Space>
            <Popconfirm
              title="Bu talebi onaylamak istediğine emin misin?"
              onConfirm={() => handleDecision(record.id, "approve")}
              okText="Evet"
              cancelText="Vazgeç"
            >
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                loading={decidingId === record.id}
              >
                Onayla
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Bu talebi reddetmek istediğine emin misin?"
              onConfirm={() => handleDecision(record.id, "reject")}
              okText="Evet"
              cancelText="Vazgeç"
            >
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                loading={decidingId === record.id}
              >
                Reddet
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          "-"
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
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Title
          level={2}
          style={{
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: -0.5,
            margin: "0 0 28px",
          }}
        >
          Ekip İzin Talepleri
        </Title>

        <Card
          title={<b>Kayıtlar</b>}
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
            loading={tableLoading}
            pagination={{ ...tablePagination, showSizeChanger: false }}
            onChange={handleTableChange}
          />
        </Card>
      </div>
    </div>
  );
}
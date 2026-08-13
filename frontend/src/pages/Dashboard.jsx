import { useState, useEffect, useCallback } from "react";
import { Button, List, message, Card, Statistic, Row, Col,Form, Table, Select, Space} from "antd";
import QrScanModal from "../components/QrScanModal.jsx";
import AttendanceFilter from "../components/AttendanceFilter.jsx";
import api from "../api/axios";


export default function Dashboard() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ weeklyHours: 0, dailyHours: 0, totalHours: 0 , weeklyLogin: 0, weeklyLogout: 0});
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [tablePagination, setTablePagination] = useState({ current: 1, pageSize: 5, total: 0 });
  const [sortField, setSortField] = useState("loginTime");
  const [sortOrder, setSortOrder] = useState("descend"); 
  const [tableLoading, setTableLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null); 
  


  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

   const fetchAttendance = useCallback(async (page, pageSize, field, order, filter) => {
    setTableLoading(true);
    try {
      const sortParam = field
        ? `${field},${order === "ascend" ? "asc" : "desc"}`
        : undefined;
 
      const res = await api.get("/attendance", {
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
 
      setRecords(res.data.content);
      setTablePagination({
        current: page,
        pageSize,
        total: res.data.totalElements,
      });
    } catch (err) {
      message.error("Kayıtlar alınamadı");
    } finally {
      setTableLoading(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get("/attendance/status");
      setIsCheckedIn(res.data);
    } catch (err) {
      message.error("Durum alınamadı");
    }
  }, []);


  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/attendance/stats");
      setStats(res.data);
    } catch (err) {
      message.error("İstatistikler alınamadı");
    }
  }, []);


  useEffect(() => {
    fetchAttendance(1, 5, "loginTime", "descend");
    fetchStatus();
    fetchStats();
  }, [fetchAttendance, fetchStatus, fetchStats]);


 const handleTableChange = (pagination, filters, sorter) => {
    const field = sorter.field || "loginTime";
    const order = sorter.order || "descend";
 
    setSortField(field);
    setSortOrder(order);
    fetchAttendance(pagination.current, pagination.pageSize, field, order,activeFilter);
  };

  const handleFilterApply = (filter) => {
    setActiveFilter(filter);
    fetchAttendance(1, tablePagination.pageSize, sortField, sortOrder, filter);
  };
 
  const handleFilterClear = () => {
    setActiveFilter(null);
    fetchAttendance(1, tablePagination.pageSize, sortField, sortOrder, null);
  };
 
  const handleDecoded = async (decodedText) => {
    try {
      await api.post("/attendance/checkin", null, {
        params: { code: decodedText },
      });
      message.success("Giriş kaydedildi");
      setIsCheckedIn(true);
      fetchAttendance(1, tablePagination.pageSize, sortField, sortOrder, activeFilter);
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.message || "Giriş başarısız";
      message.error(msg);
    }
  };


  const generateAndSendQr = async () => {
    const qrRes = await api.get("/qrcode/generate");
    const qrBase64 = qrRes.data;
 
    const htmlBody = `
      <p>QR kodunuz:</p>
      <img src="cid:qrcode" alt="QR Kod" width="200" />
    `;
 
    try {
      await api.post("/email/send", {
        subject: "Giriş",
        body: htmlBody,
        image: qrBase64,
      });
      message.success("Mail gönderildi");
    } catch (err) {
      message.error("Mail gönderilemedi");
      throw err; 
    }
  };

   const handleClick = async () => {
    setLoading(true);
    try {
      if (!isCheckedIn) {
        await generateAndSendQr();
        setScannerOpen(true);
      } else {
        await api.post("/attendance/checkout");
        message.success("Çıkış kaydedildi");
        setIsCheckedIn(false);
        fetchAttendance(tablePagination.current, tablePagination.pageSize, sortField, sortOrder,activeFilter);
        fetchStats();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "İşlem başarısız";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

    const handlePageSizeChange = (newSize) => {
    fetchAttendance(1, newSize, sortField, sortOrder,activeFilter);
  };

  const statCardStyle = {
    borderRadius: 14,
    border: "none",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    textAlign: "center",
    height: "100%",
  };

  const formatDuration = (workedMinutes) => {
    if (workedMinutes == null) return "-";
    const hours = Math.floor(workedMinutes / 60);
    const minutes = workedMinutes % 60;
    return `${hours} saat ${minutes} dakika`;
  };

    const columns = [
    {
      title: "Giriş",
      dataIndex: "loginTime",
      key: "loginTime",
      align: "center",
      render: (value) => (value ? new Date(value).toLocaleString("tr-TR") : "-"),
      sorter: true,
      sortOrder: sortField === "loginTime" ? sortOrder : null,
      sortDirections: ["descend", "ascend", "descend"],
    },
    {
      title: "Çıkış",
      dataIndex: "logoutTime",
      key: "logoutTime",
      align: "center",
      render: (value) => (value ? new Date(value).toLocaleString("tr-TR") : "-"),
    },
    {
      title: "Süre",
      dataIndex: "workedMinutes",
      key: "duration",
      align: "center",
      render: (value) => formatDuration(value),
      sorter: true,
      sortOrder: sortField === "workedMinutes" ? sortOrder : null,
      sortDirections: ["descend", "ascend", "descend"],
    },
  ];

  return (
    <>
      <title>Dashboard</title>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #bacada 0%, #53d4db 100%)",
          padding: "32px 24px 100px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 28,
            }}
            >
            <h1
                style={{
                fontWeight: 700,
                color: "#1a1a1a",
                letterSpacing: -0.5,
                margin: 0,
                }}
            >
                Dashboard
            </h1>

            <h3
                style={{
                fontWeight: 700,
                color: "#1a1a1a",
                letterSpacing: -0.5,
                margin: 0,
                }}
            >
                {storedUser.firstName} {storedUser.lastName}
            </h3>
            </div>


                <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} style={{ flex: 1 }}>
            <Card style={statCardStyle} bodyStyle={{ padding: 20 }}>
            <Statistic
                title="Toplam Çalışma Saati"
                value={stats.totalHours ?? "-"}
                suffix={stats.totalHours != null ? "saat" : ""}
                valueStyle={{ textAlign: "center" }}
            />
            </Card>
        </Col>
        <Col xs={12} sm={8} style={{ flex: 1 }}>
            <Card style={statCardStyle} bodyStyle={{ padding: 20 }}>
            <Statistic
                title="Günlük Çalışma Saati"
                value={stats.dailyHours ?? "-"}
                suffix={stats.dailyHours != null ? "saat" : ""}
                valueStyle={{ textAlign: "center" }}
            />
            </Card>
        </Col>
        <Col xs={12} sm={8} style={{ flex: 1 }}>
            <Card style={statCardStyle} bodyStyle={{ padding: 20 }}>
            <Statistic
                title="Haftalık Giriş Sayısı"
                value={stats.weeklyLogin ?? "-"}
                valueStyle={{ textAlign: "center" }}
            />
            </Card>
        </Col>
        <Col xs={12} sm={8} style={{ flex: 1 }}>
            <Card style={statCardStyle} bodyStyle={{ padding: 20 }}>
            <Statistic
                title="Haftalık Çıkış Sayısı"
                value={stats.weeklyLogout ?? "-"}
                valueStyle={{ textAlign: "center" }}
            />
            </Card>
        </Col>
        <Col xs={24} sm={8} style={{ flex: 1 }}>
            <Card style={statCardStyle} bodyStyle={{ padding: 20 }}>
            <Statistic
                title="Haftalık Çalışma Saati"
                value={stats.weeklyHours ?? "-"}
                suffix={stats.weeklyHours != null ? "saat" : ""}
                valueStyle={{ textAlign: "center" }}
            />
            </Card>
        </Col>
        </Row>

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
                  <AttendanceFilter onApply={handleFilterApply} onClear={handleFilterClear} />
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
                </Space>
              </div>
            }
            style={{
              marginTop: 24,
              borderRadius: 14,
              border: "none",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
            bodyStyle={{ padding: 0 }}
          >

            <QrScanModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDecoded={handleDecoded}
        onRegenerate={generateAndSendQr}
      />

            <Table
              columns={columns}
              dataSource={records}
              rowKey={(record, index) => record.id ?? index}
              loading={tableLoading}
              pagination={{ ...tablePagination, showSizeChanger: false }}
              onChange={handleTableChange}
            />
          </Card>
        </div>

        <Button
          color={isCheckedIn ? "red" : "default"}
          variant="solid"
          onClick={handleClick}
          loading={loading}
          size="large"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            borderRadius: 8,
            paddingLeft: 32,
            paddingRight: 32,
            boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
          }}
        >
          {isCheckedIn ? "Çıkış Yap" : "Giriş Yap"}
        </Button>
      </div>
    </>
  );
}
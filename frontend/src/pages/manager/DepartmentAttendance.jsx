import { useState, useEffect, useCallback } from "react";
import { Card, Statistic, Row, Col, Table, Select, Space, Typography, message, Tag } from "antd";
import AttendanceFilter from "../../components/AttendanceFilter.jsx";
import api from "../../api/axios";

const { Title } = Typography;

export default function DepartmentAttendance() {
  const [departmentName, setDepartmentName] = useState("");
  const [mySchedule, setMySchedule] = useState(null);
  const [records, setRecords] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tablePagination, setTablePagination] = useState({ current: 1, pageSize: 5, total: 0 });
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const fetchDepartment = useCallback(async () => {
    try {
      const res = await api.get("/manager/department");
      setDepartmentName(res.data.name);
    } catch (err) {

    }
  }, []);


  const fetchMySchedule = useCallback(async () => {
    try {
      const res = await api.get("/work-schedules/mine");
      setMySchedule(res.data);
    } catch (err) {
      setMySchedule(null);
    }
  }, []);

  const [teamStats, setTeamStats] = useState(null);

  const fetchTeamStats = useCallback(async () => {
    try {
      const res = await api.get("/manager/team/stats");
      setTeamStats(res.data);
    } catch (err) {
      setTeamStats(null);
    }
  }, []);

  const fetchAttendance = useCallback(async (page, pageSize, field, order, filter) => {
    setTableLoading(true);
    try {
      const sortParam = field ? `${field},${order === "ascend" ? "asc" : "desc"}` : undefined;

      const res = await api.get("/manager/department/attendance", {
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
      const msg = err.response?.data?.message || "Kayıtlar alınamadı";
      message.error(msg);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartment();
    fetchMySchedule();
    fetchTeamStats();
    fetchAttendance(1, 5, null, null, null);
  }, [fetchDepartment, fetchMySchedule, fetchTeamStats, fetchAttendance]);

  const handleTableChange = (pagination, filters, sorter) => {
    const field = sorter.field || null;
    const order = sorter.order || null;
    setSortField(field);
    setSortOrder(order);
    fetchAttendance(pagination.current, pagination.pageSize, field, order, activeFilter);
  };

  const handleFilterApply = (filter) => {
    setActiveFilter(filter);
    fetchAttendance(1, tablePagination.pageSize, sortField, sortOrder, filter);
  };

  const handleFilterClear = () => {
    setActiveFilter(null);
    fetchAttendance(1, tablePagination.pageSize, sortField, sortOrder, null);
  };

  const handlePageSizeChange = (newSize) => {
    fetchAttendance(1, newSize, sortField, sortOrder, activeFilter);
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
      title: "Çalışan",
      dataIndex: "userFullName",
      key: "userFullName",
    },
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
    {
      title: "Etiketler",
      key: "tags",
      align: "center",
      render: (_, record) => (
        <Space size={4} wrap>
          {record.lateArrival && <Tag color="orange">Geç Giriş</Tag>}
          {record.earlyLeave && <Tag color="gold">Erken Çıkış</Tag>}
          {record.overtimeMinutes > 0 && <Tag color="blue">Fazla Mesai</Tag>}
          {!record.lateArrival && !record.earlyLeave && !(record.overtimeMinutes > 0) && "-"}
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <Title
            level={2}
            style={{
              fontWeight: 700,
              color: "#1a1a1a",
              letterSpacing: -0.5,
              margin: 0,
            }}
          >
            {departmentName || "Departmanım"} - Giriş/Çıkış Kayıtları
          </Title>

          {mySchedule && (
            <div style={{ color: "#1a1a1a", fontWeight: 500 }}>
              Giriş: {mySchedule.startTime ? mySchedule.startTime.slice(0, 5) : "-"}
              {"  "}Çıkış: {mySchedule.endTime ? mySchedule.endTime.slice(0, 5) : "-"}
            </div>
          )}
        </div>

        {teamStats && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8}  style={{ flex: 1 }}>
              <Card style={statCardStyle} bodyStyle={{ padding: 20 }}>
                <Statistic
                  title="Bu Ay Geç Kalma"
                  value={teamStats.lateArrivalCountThisMonth ?? "-"}
                  valueStyle={{ textAlign: "center" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8}  style={{ flex: 1 }}>
              <Card style={statCardStyle} bodyStyle={{ padding: 20 }}>
                <Statistic
                  title="Toplam Fazla Mesai"
                  value={teamStats.totalOvertimeHours ?? "-"}
                  suffix={teamStats.totalOvertimeHours != null ? "saat" : ""}
                  valueStyle={{ textAlign: "center" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8}  style={{ flex: 1 }}>
              <Card style={statCardStyle} bodyStyle={{ padding: 20 }}>
                <Statistic
                  title="Haftalık Çalışma Saati"
                  value={teamStats.weeklyHours ?? "-"}
                  suffix={teamStats.weeklyHours != null ? "saat" : ""}
                  valueStyle={{ textAlign: "center" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8}  style={{ flex: 1 }}>
              <Card style={statCardStyle} bodyStyle={{ padding: 20 }}>
                <Statistic
                  title="Günlük Çalışma Saati"
                  value={teamStats.dailyHours ?? "-"}
                  suffix={teamStats.dailyHours != null ? "saat" : ""}
                  valueStyle={{ textAlign: "center" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}  style={{ flex: 1 }}>
              <Card style={statCardStyle} bodyStyle={{ padding: 20 }}>
                <Statistic
                  title="İzinli Kişi Sayısı"
                  value={teamStats.onLeaveCount ?? "-"}
                  valueStyle={{ textAlign: "center" }}
                />
              </Card>
            </Col>
          </Row>
        )}

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
            borderRadius: 14,
            border: "none",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: 0 }}
        >
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
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import { Table, Select, Space, Typography, message, Card } from "antd";
import EmployeeFilter from "../../components/EmployeeFilter.jsx";
import api from "../../api/axios";

const { Title } = Typography;

export default function DepartmentEmployees() {
  const [departmentName, setDepartmentName] = useState("");
  const [employees, setEmployees] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tablePagination, setTablePagination] = useState({ current: 1, pageSize: 10, total: 0 });
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

  const fetchEmployees = useCallback(async (page, pageSize, field, order, filter) => {
    setTableLoading(true);
    try {
      const sortParam = field ? `${field},${order === "ascend" ? "asc" : "desc"}` : undefined;

      const res = await api.get("/manager/department/employees", {
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

      setEmployees(res.data.content);
      setTablePagination({
        current: page,
        pageSize,
        total: res.data.totalElements,
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Çalışanlar alınamadı";
      message.error(msg);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartment();
    fetchEmployees(1, 10, null, null, null);
  }, [fetchDepartment, fetchEmployees]);

  const handleTableChange = (pagination, filters, sorter) => {
    const field = sorter.field || null;
    const order = sorter.order || null;
    setSortField(field);
    setSortOrder(order);
    fetchEmployees(pagination.current, pagination.pageSize, field, order, activeFilter);
  };

  const handlePageSizeChange = (newSize) => {
    fetchEmployees(1, newSize, sortField, sortOrder, activeFilter);
  };

  const handleFilterApply = (filter) => {
    setActiveFilter(filter);
    fetchEmployees(1, tablePagination.pageSize, sortField, sortOrder, filter);
  };

  const handleFilterClear = () => {
    setActiveFilter(null);
    fetchEmployees(1, tablePagination.pageSize, sortField, sortOrder, null);
  };

  const columns = [
    {
      title: "Ad",
      dataIndex: "firstName",
      key: "firstName",
      sorter: true,
      sortOrder: sortField === "firstName" ? sortOrder : null,
    },
    {
      title: "Soyad",
      dataIndex: "lastName",
      key: "lastName",
      sorter: true,
      sortOrder: sortField === "lastName" ? sortOrder : null,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortOrder: sortField === "email" ? sortOrder : null,
    },
    {
      title: "Durum",
      dataIndex: "active",
      key: "active",
      sorter: true,
      sortOrder: sortField === "active" ? sortOrder : null,
      render: (active) => (active ? "Aktif" : "Pasif"),
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
          {departmentName || "-"}
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
                <EmployeeFilter onApply={handleFilterApply} onClear={handleFilterClear} />
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
            dataSource={employees}
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
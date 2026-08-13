import { useState } from "react";
import { Dropdown, Button, Select, DatePicker, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

const ROLE_OPTIONS = [
  { value: "ROLE_EMPLOYEE", label: "Employee" },
  { value: "ROLE_MANAGER", label: "Manager" },
  { value: "ROLE_ADMIN", label: "Admin" },
];

const FIELD_CONFIG = {
  role: { label: "Rol", type: "role", operators: ["EQ", "IN"] },
  active: { label: "Durum", type: "boolean", operators: ["EQ"] },
  createdDate: { label: "Kayıt Tarihi", type: "date", operators: ["EQ", "DATE_BETWEEN"] },
};

const OPERATOR_LABELS = {
  EQ: "Eşittir",
  IN: "İçinde (birden fazla değer)",
  DATE_BETWEEN: "Tarih Aralığı",
};

export default function UserFilter({ onApply, onClear }) {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState(null);
  const [operator, setOperator] = useState(null);
  const [singleValue, setSingleValue] = useState(null);
  const [multiValues, setMultiValues] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [activeFilter, setActiveFilter] = useState(false);

  const fieldConfig = field ? FIELD_CONFIG[field] : null;

  const handleFieldChange = (value) => {
    setField(value);
    setOperator(null);
    setSingleValue(null);
    setMultiValues([]);
    setDateRange(null);
  };

  const buildFilterValues = () => {
    if (operator === "EQ") {
      if (fieldConfig.type === "boolean") return [String(singleValue)];
      if (fieldConfig.type === "date") {
        return singleValue ? [singleValue.format("YYYY-MM-DD")] : null;
      }
      return singleValue ? [singleValue] : null;
    }
    if (operator === "IN") {
      return multiValues.length > 0 ? multiValues : null;
    }
    if (operator === "DATE_BETWEEN") {
      if (!dateRange || dateRange.length !== 2) return null;
      return [dateRange[0].format("YYYY-MM-DD"), dateRange[1].format("YYYY-MM-DD")];
    }
    return null;
  };

  const handleApply = () => {
    const values = buildFilterValues();
    if (!field || !operator || !values) return;

    onApply({ filterField: field, filterOperator: operator, filterValue: values });
    setActiveFilter(true);
    setOpen(false);
  };

  const handleClear = () => {
    setField(null);
    setOperator(null);
    setSingleValue(null);
    setMultiValues([]);
    setDateRange(null);
    setActiveFilter(false);
    onClear();
    setOpen(false);
  };

  const renderValueInput = () => {
    if (!fieldConfig || !operator) return null;

    if (fieldConfig.type === "role") {
      if (operator === "EQ") {
        return (
          <Select
            style={{ width: "100%" }}
            placeholder="Rol seç"
            value={singleValue}
            onChange={setSingleValue}
            options={ROLE_OPTIONS}
          />
        );
      }
      if (operator === "IN") {
        return (
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Roller seç"
            value={multiValues}
            onChange={setMultiValues}
            options={ROLE_OPTIONS}
          />
        );
      }
    }

    if (fieldConfig.type === "boolean" && operator === "EQ") {
      return (
        <Select
          style={{ width: "100%" }}
          placeholder="Değer seç"
          value={singleValue}
          onChange={setSingleValue}
          options={[
            { value: true, label: "Aktif (true)" },
            { value: false, label: "Pasif (false)" },
          ]}
        />
      );
    }

    if (fieldConfig.type === "date") {
      if (operator === "EQ") {
        return (
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            value={singleValue}
            onChange={setSingleValue}
          />
        );
      }
      if (operator === "DATE_BETWEEN") {
        return (
          <RangePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            value={dateRange}
            onChange={setDateRange}
          />
        );
      }
    }

    return null;
  };

  const dropdownContent = (
    <div
      style={{
        background: "#fff",
        padding: 16,
        borderRadius: 8,
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        width: 280,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>Alan</div>
        <Select
          style={{ width: "100%" }}
          placeholder="Alan seç"
          value={field}
          onChange={handleFieldChange}
          options={Object.entries(FIELD_CONFIG).map(([key, cfg]) => ({
            value: key,
            label: cfg.label,
          }))}
        />
      </div>

      {fieldConfig && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>Operatör</div>
          <Select
            style={{ width: "100%" }}
            placeholder="Operatör seç"
            value={operator}
            onChange={setOperator}
            options={fieldConfig.operators.map((op) => ({
              value: op,
              label: OPERATOR_LABELS[op],
            }))}
          />
        </div>
      )}

      {operator && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>Değer</div>
          {renderValueInput()}
        </div>
      )}

      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button size="small" onClick={handleClear}>
          Temizle
        </Button>
        <Button size="small" type="primary" onClick={handleApply} disabled={!field || !operator}>
          Uygula
        </Button>
      </Space>
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
      dropdownRender={() => dropdownContent}
    >
      <Button icon={<FilterOutlined />} type={activeFilter ? "primary" : "default"}>
        Filtrele
      </Button>
    </Dropdown>
  );
}
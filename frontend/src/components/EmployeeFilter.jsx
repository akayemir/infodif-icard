import { useState } from "react";
import { Dropdown, Button, Select, Input, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";

const FIELD_CONFIG = {
  firstName: { label: "Ad", type: "text" },
  lastName: { label: "Soyad", type: "text" },
  email: { label: "Email", type: "text" },
  active: { label: "Durum", type: "boolean" },
};

export default function EmployeeFilter({ onApply, onClear }) {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState(null);
  const [value, setValue] = useState(null);
  const [activeFilter, setActiveFilter] = useState(false);

  const fieldConfig = field ? FIELD_CONFIG[field] : null;

  const handleFieldChange = (value) => {
    setField(value);
    setValue(null);
  };

  const handleApply = () => {
    if (!field || value === null || value === undefined || value === "") return;

    onApply({ filterField: field, filterOperator: "EQ", filterValue: [String(value)] });
    setActiveFilter(true);
    setOpen(false);
  };

  const handleClear = () => {
    setField(null);
    setValue(null);
    setActiveFilter(false);
    onClear();
    setOpen(false);
  };

  const renderValueInput = () => {
    if (!fieldConfig) return null;

    if (fieldConfig.type === "boolean") {
      return (
        <Select
          style={{ width: "100%" }}
          placeholder="Değer seç"
          value={value}
          onChange={setValue}
          options={[
            { value: true, label: "Aktif" },
            { value: false, label: "Pasif" },
          ]}
        />
      );
    }

    return (
      <Input
        placeholder="Değer gir"
        value={value ?? ""}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  };

  const dropdownContent = (
    <div
      style={{
        background: "#fff",
        padding: 16,
        borderRadius: 8,
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        width: 260,
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

      {field && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>Değer</div>
          {renderValueInput()}
        </div>
      )}

      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button size="small" onClick={handleClear}>
          Temizle
        </Button>
        <Button size="small" type="primary" onClick={handleApply} disabled={!field}>
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
      popupRender={() => dropdownContent}
    >
      <Button icon={<FilterOutlined />} type={activeFilter ? "primary" : "default"}>
        Filtrele
      </Button>
    </Dropdown>
  );
}
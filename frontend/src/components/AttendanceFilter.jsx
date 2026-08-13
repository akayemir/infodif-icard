import { useState } from "react";
import { Dropdown, Button, Select, Input, InputNumber, DatePicker, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;


const FIELD_CONFIG = {
  loginTime: { label: "Tarih", type: "date", operators: ["EQ", "DATE_BETWEEN"] },
  //logoutTime: { label: "Çıkış Tarihi", type: "date", operators: ["EQ", "DATE_BETWEEN"] },
  workedMinutes: { label: "Süre (dakika)", type: "number", operators: ["EQ", "BETWEEN"] },
  //status: { label: "Durum", type: "boolean", operators: ["EQ"] },
  lateArrival: {
    label: "Geç Giriş",
    type: "boolean",
    operators: ["EQ"],
    booleanOptions: [
      { value: true, label: "Geç Giriş" },
      { value: false, label: "Zamanında Giriş" },
    ],
  },
  earlyLeave: {
    label: "Erken Çıkış",
    type: "boolean",
    operators: ["EQ"],
    booleanOptions: [
      { value: true, label: "Erken Çıkış" },
      { value: false, label: "Erken Çıkış Değil" },
    ],
  },
  hasOvertime: {
    label: "Fazla Mesai",
    type: "boolean",
    operators: ["EQ"],
    booleanOptions: [
      { value: true, label: "Fazla Mesai Var" },
      { value: false, label: "Fazla Mesai Yok" },
    ],
  },
};

const OPERATOR_LABELS = {
  EQ: "Eşittir",
  //IN: "İçinde (birden fazla değer)",
  BETWEEN: "Aralık (min - max)",
  DATE_BETWEEN: "Tarih Aralığı",
};

export default function AttendanceFilter({ onApply, onClear }) {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState(null);
  const [operator, setOperator] = useState(null);
  const [singleValue, setSingleValue] = useState(null);
  const [inValues, setInValues] = useState([]);
  const [rangeMin, setRangeMin] = useState(null);
  const [rangeMax, setRangeMax] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [activeFilter, setActiveFilter] = useState(false);

  const fieldConfig = field ? FIELD_CONFIG[field] : null;

  const handleFieldChange = (value) => {
    setField(value);
    setOperator(null);
    setSingleValue(null);
    setInValues([]);
    setRangeMin(null);
    setRangeMax(null);
    setDateRange(null);
  };

  const buildFilterValues = () => {
    if (operator === "EQ") {
      if (fieldConfig.type === "boolean") return [String(singleValue)];
      if (fieldConfig.type === "date") {
        return singleValue ? [singleValue.format("YYYY-MM-DD")] : null;
      }
      return singleValue != null ? [String(singleValue)] : null;
    }
    //if (operator === "IN") {
    //  return inValues.length > 0 ? inValues.map(String) : null;
    //}
    if (operator === "BETWEEN") {
      return rangeMin != null && rangeMax != null ? [String(rangeMin), String(rangeMax)] : null;
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
    setInValues([]);
    setRangeMin(null);
    setRangeMax(null);
    setDateRange(null);
    setActiveFilter(false);
    onClear();
    setOpen(false);
  };

  const renderValueInput = () => {
    if (!fieldConfig || !operator) return null;

    if (operator === "EQ") {
      if (fieldConfig.type === "boolean") {
        return (
          <Select
            style={{ width: "100%" }}
            placeholder="Değer seç"
            value={singleValue}
            onChange={setSingleValue}
            options={fieldConfig.booleanOptions || [
              { value: true, label: "Evet" },
              { value: false, label: "Hayır" },
            ]}
          />
        );
      }
      if (fieldConfig.type === "number") {
        return (
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Değer"
            value={singleValue}
            onChange={setSingleValue}
          />
        );
      }
      if (fieldConfig.type === "date") {
        return (
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            value={singleValue}
            onChange={setSingleValue}
          />
        );
      }
    }

    if (operator === "IN") {
      return (
        <Select
          mode="tags"
          style={{ width: "100%" }}
          placeholder="Değerleri gir (Enter ile ekle)"
          value={inValues}
          onChange={setInValues}
        />
      );
    }

    if (operator === "BETWEEN") {
      return (
        <Space>
          <InputNumber placeholder="Min" value={rangeMin} onChange={setRangeMin} />
          <InputNumber placeholder="Max" value={rangeMax} onChange={setRangeMax} />
        </Space>
      );
    }

    if (operator === "DATE_BETWEEN") {
      return (
        <RangePicker
          format="YYYY-MM-DD"
          style={{ width: "100%" }}
          value={dateRange}
          onChange={setDateRange}
        />
      );
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
      <Button
        icon={<FilterOutlined />}
        type={activeFilter ? "primary" : "default"}
      >
        Filtrele
      </Button>
    </Dropdown>
  );
}
import { useState, useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { data } from "react-router";
import { authenticate } from "../../shopify.server";
import prisma from "../../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let settings = await prisma.sizeChartSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await prisma.sizeChartSettings.create({
      data: { shop },
    });
  }

  return data({ settings });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  // Preserve alignment and padding when those inputs are not present in the form anymore
  const existing = await prisma.sizeChartSettings.findUnique({
    where: { shop },
  });

  const getIntOrExisting = (fieldName, existingValue, fallback) => {
    const raw = formData.get(fieldName);
    if (raw !== null && raw !== "") {
      const parsed = parseInt(raw, 10);
      return Number.isNaN(parsed) ? (existingValue ?? fallback) : parsed;
    }
    return existingValue ?? fallback;
  };

  const updateData = {
    buttonText: formData.get("buttonText") || "Size Guide",
    buttonIcon: formData.get("buttonIcon") || "ruler",
    buttonAlignment:
      formData.get("buttonAlignment") ||
      existing?.buttonAlignment ||
      "left",
    buttonTextColor: formData.get("buttonTextColor") || "#ffffff",
    buttonBgColor: formData.get("buttonBgColor") || "#111111",
    buttonBorderRadius: getIntOrExisting(
      "buttonBorderRadius",
      existing?.buttonBorderRadius,
      6
    ),
    buttonPaddingTop: getIntOrExisting(
      "buttonPaddingTop",
      existing?.buttonPaddingTop,
      10
    ),
    buttonPaddingBottom: getIntOrExisting(
      "buttonPaddingBottom",
      existing?.buttonPaddingBottom,
      10
    ),
    buttonPaddingLeft: getIntOrExisting(
      "buttonPaddingLeft",
      existing?.buttonPaddingLeft,
      20
    ),
    buttonPaddingRight: getIntOrExisting(
      "buttonPaddingRight",
      existing?.buttonPaddingRight,
      20
    ),
    buttonBorderStyle: formData.get("buttonBorderStyle") || "none",
    buttonBorderColor: formData.get("buttonBorderColor") || "#111111",
    buttonBorderWidth: getIntOrExisting(
      "buttonBorderWidth",
      existing?.buttonBorderWidth,
      1
    ),
    buttonBorderTop: formData.get("buttonBorderTop") === "on",
    buttonBorderRight: formData.get("buttonBorderRight") === "on",
    buttonBorderBottom: formData.get("buttonBorderBottom") === "on",
    buttonBorderLeft: formData.get("buttonBorderLeft") === "on",
    tableDesign: formData.get("tableDesign") || "classic",
  };

  const settings = await prisma.sizeChartSettings.upsert({
    where: { shop },
    update: updateData,
    create: { shop, ...updateData },
  });

  return data({ success: true, settings });
};

// Styles
const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "24px",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "20px",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f3f4f6",
  },
  previewArea: {
    padding: "40px",
    background: "#f9fafb",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.15s ease",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    background: "#fff",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  colorInputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  colorSwatch: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    padding: 0,
  },
  colorTextInput: {
    flex: 1,
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "monospace",
  },
  rangeWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  rangeInput: {
    flex: 1,
    height: "6px",
    borderRadius: "3px",
    appearance: "none",
    background: "#e5e7eb",
    cursor: "pointer",
  },
  rangeValue: {
    minWidth: "50px",
    padding: "6px 10px",
    fontSize: "13px",
    background: "#f3f4f6",
    borderRadius: "6px",
    textAlign: "center",
    color: "#374151",
  },
  button: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#fff",
    background: "#111827",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  successMessage: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginLeft: "12px",
    color: "#059669",
    fontSize: "14px",
  },
  paddingGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
};

// Table design styles
const tableDesignStyles = {
  classic: {
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "13px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    th: {
      background: "#f3f4f6",
      border: "1px solid #e5e7eb",
      padding: "10px 12px",
      textAlign: "left",
      fontWeight: "600",
      color: "#374151",
    },
    td: {
      border: "1px solid #e5e7eb",
      padding: "10px 12px",
      color: "#4b5563",
    },
    trEven: {},
  },
  minimal: {
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "13px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "#ffffff",
      borderRadius: "6px",
      overflow: "hidden",
    },
    th: {
      background: "#cccccc",
      borderBottom: "1px solid #e5e7eb",
      padding: "12px 18px",
      textAlign: "left",
      fontWeight: "600",
      color: "#111827",
      fontSize: "12px",
    },
    td: {
      borderBottom: "1px solid #f3f4f6",
      padding: "12px 18px",
      color: "#4b5563",
    },
    trEven: {
      background: "#fcfcfd",
    },
  },
  striped: {
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "13px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    th: {
      background: "#374151",
      border: "1px solid #374151",
      padding: "10px 12px",
      textAlign: "left",
      fontWeight: "600",
      color: "#ffffff",
    },
    td: {
      border: "1px solid #e5e7eb",
      padding: "10px 12px",
      color: "#4b5563",
    },
    trEven: {
      background: "#f9fafb",
    },
  },
  modern: {
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0",
      fontSize: "13px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      borderRadius: "8px",
      overflow: "hidden",
      border: "1px solid #e5e7eb",
    },
    th: {
      background: "#111827",
      padding: "12px 14px",
      textAlign: "left",
      fontWeight: "600",
      color: "#ffffff",
      borderBottom: "1px solid #374151",
    },
    td: {
      padding: "12px 14px",
      color: "#4b5563",
      borderBottom: "1px solid #e5e7eb",
      borderRight: "1px solid #e5e7eb",
    },
    trEven: {
      background: "#f9fafb",
    },
  },
  elegant: {
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "13px",
      fontFamily: "Inter, sans-serif",
    },
    th: {
      background: "#1f2937",
      border: "1px solid #1f2937",
      padding: "12px 14px",
      textAlign: "left",
      fontWeight: "600",
      color: "#f9fafb",
      letterSpacing: "0.5px",
    },
    td: {
      border: "1px solid #d1d5db",
      padding: "12px 14px",
      color: "#374151",
    },
    trEven: {
      background: "#f3f4f6",
    },
  },
};

// Dummy table data
const dummyTableData = {
  headers: ["Size", "Chest", "Waist", "Hips", "Length"],
  rows: [
    ["S", "34-36", "28-30", "35-37", "27"],
    ["M", "38-40", "32-34", "38-40", "28"],
    ["L", "42-44", "36-38", "41-43", "29"],
    ["XL", "46-48", "40-42", "44-46", "30"],
  ],
};

function TablePreview({ design }) {
  const designStyle = tableDesignStyles[design] || tableDesignStyles.classic;

  return (
    <table style={designStyle.table}>
      <thead>
        <tr>
          {dummyTableData.headers.map((header, i) => (
            <th key={i} style={designStyle.th}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dummyTableData.rows.map((row, rowIndex) => (
          <tr 
            key={rowIndex} 
            style={rowIndex % 2 === 1 ? designStyle.trEven : {}}
          >
            {row.map((cell, cellIndex) => (
              <td 
                key={cellIndex} 
                style={{
                  ...designStyle.td,
                  fontWeight: cellIndex === 0 ? "600" : "normal",
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function LayoutPage() {
  const { settings } = useLoaderData();
  const fetcher = useFetcher();

  const [formState, setFormState] = useState({
    buttonText: settings.buttonText,
    buttonIcon: settings.buttonIcon,
    buttonAlignment: settings.buttonAlignment,
    buttonTextColor: settings.buttonTextColor,
    buttonBgColor: settings.buttonBgColor,
    buttonBorderRadius: settings.buttonBorderRadius,
    buttonPaddingTop: settings.buttonPaddingTop,
    buttonPaddingBottom: settings.buttonPaddingBottom,
    buttonPaddingLeft: settings.buttonPaddingLeft,
    buttonPaddingRight: settings.buttonPaddingRight,
    buttonBorderStyle: settings.buttonBorderStyle,
    buttonBorderColor: settings.buttonBorderColor,
    buttonBorderWidth: settings.buttonBorderWidth,
    buttonBorderTop: settings.buttonBorderTop,
    buttonBorderRight: settings.buttonBorderRight,
    buttonBorderBottom: settings.buttonBorderBottom,
    buttonBorderLeft: settings.buttonBorderLeft,
    tableDesign: settings.tableDesign,
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (fetcher.data?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [fetcher.data]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetcher.submit(e.currentTarget, { method: "POST" });
  };

  const isSaving = fetcher.state === "submitting";

  // Preview button style
  const previewButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: `${formState.buttonPaddingTop}px ${formState.buttonPaddingRight}px ${formState.buttonPaddingBottom}px ${formState.buttonPaddingLeft}px`,
    fontSize: "14px",
    fontWeight: "500",
    color: formState.buttonTextColor,
    backgroundColor: formState.buttonBgColor,
    borderRadius: `${formState.buttonBorderRadius}px`,
    cursor: "pointer",
    borderStyle: "none",
    borderWidth: 0,
  };

  if (formState.buttonBorderStyle && formState.buttonBorderStyle !== "none") {
    const width = formState.buttonBorderWidth || 1;
    const style = formState.buttonBorderStyle || "solid";
    previewButtonStyle.borderStyle = style;
    previewButtonStyle.borderColor = formState.buttonBorderColor;
    previewButtonStyle.borderTopWidth = formState.buttonBorderTop ? `${width}px` : "0";
    previewButtonStyle.borderRightWidth = formState.buttonBorderRight ? `${width}px` : "0";
    previewButtonStyle.borderBottomWidth = formState.buttonBorderBottom ? `${width}px` : "0";
    previewButtonStyle.borderLeftWidth = formState.buttonBorderLeft ? `${width}px` : "0";
  }

  const iconSvgs = {
    ruler: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/>
        <path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>
      </svg>
    ),
    shirt: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"/>
      </svg>
    ),
    grid: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>
      </svg>
    ),
    info: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/><path d="M12 8h.01"/>
      </svg>
    ),
    hanger: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 6a2 2 0 1 0-4 0c0 1.1.9 2 2 2"/>
        <path d="M12 8v1"/><path d="M3 18l9-6 9 6"/><line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    ),
  };

  return (
    <div
      className="p-5"
      style={{
        height: "100vh",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <form onSubmit={handleSubmit}>
        <div
          style={{
            ...styles.header,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div>
            <h1 style={styles.title}>Size Chart Button Layout</h1>
            <p style={styles.subtitle}>
              Customize the appearance of the Size Guide button on your storefront
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: isSaving ? 0.7 : 1,
              }}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
            {showSuccess && (
              <span style={styles.successMessage}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Saved
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)",
            gap: "20px",
            alignItems: "flex-start",
          }}
        >
          {/* Left column: button controls */}
          <div>
            {/* Preview */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>Preview</div>
              <div
                style={{
                  ...styles.previewArea,
                  justifyContent: "flex-start",
                }}
              >
                <button type="button" style={previewButtonStyle}>
                  {formState.buttonIcon !== "none" && iconSvgs[formState.buttonIcon]}
                  {formState.buttonText}
                </button>
              </div>
            </div>

            {/* Scrollable settings below preview */}
            <div
              style={{
                marginTop: "16px",
                height: "calc(100vh - 360px)",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {/* Button Settings */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>Button Settings</div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Button Text</label>
                <input
                  type="text"
                  style={styles.input}
                  name="buttonText"
                  value={formState.buttonText}
                  onChange={(e) => handleChange("buttonText", e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Button Icon</label>
                <select
                  style={styles.select}
                  name="buttonIcon"
                  value={formState.buttonIcon}
                  onChange={(e) => handleChange("buttonIcon", e.target.value)}
                >
                  <option value="ruler">Ruler</option>
                  <option value="shirt">Shirt</option>
                  <option value="grid">Grid</option>
                  <option value="info">Info</option>
                  <option value="hanger">Hanger</option>
                  <option value="none">No Icon</option>
                </select>
              </div>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Text Color</label>
                    <div style={styles.colorInputWrapper}>
                        <input
                        type="color"
                        style={styles.colorSwatch}
                          name="buttonTextColor"
                        value={formState.buttonTextColor}
                        onChange={(e) => handleChange("buttonTextColor", e.target.value)}
                      />
                      <input
                        type="text"
                        style={styles.colorTextInput}
                        value={formState.buttonTextColor}
                        onChange={(e) => handleChange("buttonTextColor", e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Background Color</label>
                    <div style={styles.colorInputWrapper}>
                        <input
                        type="color"
                        style={styles.colorSwatch}
                          name="buttonBgColor"
                        value={formState.buttonBgColor}
                        onChange={(e) => handleChange("buttonBgColor", e.target.value)}
                      />
                      <input
                        type="text"
                        style={styles.colorTextInput}
                        value={formState.buttonBgColor}
                        onChange={(e) => handleChange("buttonBgColor", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Border Settings */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>Border Settings</div>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Border Style</label>
                    <select
                      style={styles.select}
                      name="buttonBorderStyle"
                      value={formState.buttonBorderStyle}
                      onChange={(e) => handleChange("buttonBorderStyle", e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Corner Radius</label>
                    <div style={styles.rangeWrapper}>
                      <input
                        type="range"
                        style={styles.rangeInput}
                          name="buttonBorderRadius"
                        min="0"
                        max="30"
                        value={formState.buttonBorderRadius}
                        onChange={(e) =>
                          handleChange("buttonBorderRadius", parseInt(e.target.value))
                        }
                      />
                      <span style={styles.rangeValue}>{formState.buttonBorderRadius}px</span>
                    </div>
                  </div>
                </div>

                {formState.buttonBorderStyle === "solid" && (
                  <>
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Border Color</label>
                        <div style={styles.colorInputWrapper}>
                          <input
                            type="color"
                            style={styles.colorSwatch}
                            name="buttonBorderColor"
                            value={formState.buttonBorderColor}
                            onChange={(e) =>
                              handleChange("buttonBorderColor", e.target.value)
                            }
                          />
                          <input
                            type="text"
                            style={styles.colorTextInput}
                            value={formState.buttonBorderColor}
                            onChange={(e) =>
                              handleChange("buttonBorderColor", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Border Width</label>
                        <div style={styles.rangeWrapper}>
                          <input
                            type="range"
                            style={styles.rangeInput}
                            name="buttonBorderWidth"
                            min="1"
                            max="5"
                            value={formState.buttonBorderWidth}
                            onChange={(e) =>
                              handleChange("buttonBorderWidth", parseInt(e.target.value))
                            }
                          />
                          <span style={styles.rangeValue}>{formState.buttonBorderWidth}px</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <label style={styles.label}>Border Sides</label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                          gap: "8px",
                        }}
                      >
                        {[
                          ["Top", "buttonBorderTop"],
                          ["Right", "buttonBorderRight"],
                          ["Bottom", "buttonBorderBottom"],
                          ["Left", "buttonBorderLeft"],
                        ].map(([label, field]) => {
                          const isOn = !!formState[field];
                          return (
                            <label
                              key={field}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "13px",
                                color: "#374151",
                                cursor: "pointer",
                              }}
                            >
                              {/* Hidden checkbox for form submit */}
                              <input
                                type="checkbox"
                                name={field}
                                checked={isOn}
                                onChange={(e) => handleChange(field, e.target.checked)}
                                style={{
                                  position: "absolute",
                                  opacity: 0,
                                  width: 0,
                                  height: 0,
                                }}
                              />
                              {/* Visual switch */}
                              <span
                                style={{
                                  width: 32,
                                  height: 18,
                                  borderRadius: 9999,
                                  backgroundColor: isOn ? "#111827" : "#e5e7eb",
                                  display: "flex",
                                  alignItems: "center",
                                  padding: 2,
                                  boxSizing: "border-box",
                                  transition: "background-color 0.15s ease",
                                }}
                              >
                                <span
                                  style={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: 9999,
                                    backgroundColor: "#ffffff",
                                    boxShadow:
                                      "0 1px 2px rgba(0,0,0,0.15)",
                                    transform: isOn
                                      ? "translateX(14px)"
                                      : "translateX(0)",
                                    transition: "transform 0.15s ease",
                                  }}
                                />
                              </span>
                              <span>{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Padding Settings */}
            {/* Padding controls removed – managed in theme editor now */}
            </div>
          </div>

          {/* Right column: table design section */}
          <div
            style={{
              position: "sticky",
              top: "80px",
            }}
          >
            {/* Table Design */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>Table Design</div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Table Style</label>
                <select
                  style={styles.select}
                  name="tableDesign"
                  value={formState.tableDesign}
                  onChange={(e) => handleChange("tableDesign", e.target.value)}
                >
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                  <option value="striped">Striped</option>
                  <option value="modern">Modern</option>
                  <option value="elegant">Elegant</option>
                </select>
              </div>

              {/* Table Preview */}
              <div style={{ marginTop: "16px" }}>
                <label style={styles.label}>Preview</label>
                <div
                  style={{
                    background: "#f9fafb",
                    borderRadius: "8px",
                    padding: "20px",
                    overflowX: "auto",
                  }}
                >
                  <TablePreview design={formState.tableDesign} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

(function() {
  function text(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback || "";
    return String(value);
  }

  function parseValue(value) {
    if (!value) return {};
    if (typeof value === "object") return value;
    var str = String(value).trim();
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch (err) {
      return { sku: str };
    }
  }

  window.ProductCardControl = function(props) {
    var product = parseValue(props.value);
    return React.createElement(
      "div",
      { style: { display: "grid", gap: "10px" } },
      React.createElement("input", {
        type: "text",
        value: typeof props.value === "string" ? props.value : JSON.stringify(product),
        onChange: function(event) {
          props.onChange(event.target.value);
        },
        placeholder: '{"sku":"SY-DD-20V-BL","name":"20V MAX Brushless Drill/Driver","category":"Drills & Drivers","image":"/images/placeholder.jpg"}',
        style: {
          width: "100%",
          height: "38px",
          borderRadius: "8px",
          border: "1px solid #3f3f46",
          background: "#09090b",
          color: "#e4e4e7",
          padding: "0 10px"
        }
      }),
      React.createElement(window.ProductCardPreview, { value: props.value })
    );
  };

  window.ProductCardPreview = function(props) {
    var product = parseValue(props.value);
    if (!product || !product.sku) {
      return React.createElement(
        "div",
        {
          style: {
            border: "1px dashed #3f3f46",
            borderRadius: "8px",
            padding: "10px",
            color: "#71717a",
            fontSize: "13px"
          }
        },
        "Select a product"
      );
    }

    return React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "10px",
          border: "1px solid #27272a",
          borderRadius: "8px",
          padding: "10px",
          background: "#18181b"
        }
      },
      React.createElement("img", {
        src: text(product.image, "/images/placeholder.jpg"),
        alt: text(product.name, "Selected product"),
        style: {
          width: "50px",
          height: "50px",
          objectFit: "cover",
          borderRadius: "6px",
          border: "1px solid #27272a",
          background: "#09090b"
        }
      }),
      React.createElement(
        "div",
        { style: { minWidth: 0 } },
        React.createElement(
          "div",
          {
            style: {
              color: "#e4e4e7",
              fontSize: "13px",
              fontWeight: "600",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden"
            }
          },
          text(product.name, "Unnamed product")
        ),
        React.createElement("div", { style: { color: "#a1a1aa", fontSize: "12px", marginTop: "2px" } }, "SKU: ", text(product.sku, "N/A")),
        React.createElement("div", { style: { color: "#71717a", fontSize: "12px", marginTop: "2px" } }, text(product.category, "General"))
      )
    );
  };
})();

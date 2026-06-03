(function() {
  function getData(entry) {
    if (!entry || !entry.getIn) return {};
    var data = entry.getIn(["data"]);
    return data && data.toJS ? data.toJS() : {};
  }

  function text(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback || "";
    return String(value);
  }

  window.ProductPreview = function(props) {
    var data = getData(props.entry);
    var image = text(data.image, "/images/placeholder.jpg");
    var featured = !!data.featured;
    var inStock = data.inStock !== false;

    return React.createElement(
      "div",
      { style: { maxWidth: "420px", margin: "1.5rem auto" } },
      React.createElement(
        "article",
        {
          style: {
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "12px",
            overflow: "hidden",
            color: "#e4e4e7",
            fontFamily: "'Source Sans 3', sans-serif"
          }
        },
        React.createElement(
          "div",
          { style: { position: "relative", background: "#09090b", aspectRatio: "1 / 1" } },
          React.createElement("img", {
            src: image,
            alt: text(data.name, "Product image"),
            style: { width: "100%", height: "100%", objectFit: "cover" }
          }),
          featured
            ? React.createElement(
                "span",
                {
                  style: {
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "#facc15",
                    color: "#09090b",
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "4px 8px",
                    borderRadius: "9999px"
                  }
                },
                "Featured"
              )
            : null
        ),
        React.createElement(
          "div",
          { style: { padding: "14px" } },
          React.createElement(
            "p",
            {
              style: {
                margin: "0 0 6px",
                color: "#facc15",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                fontWeight: "700"
              }
            },
            text(data.brand, "Ningbo Siyang")
          ),
          React.createElement(
            "h3",
            {
              style: {
                margin: "0 0 8px",
                fontFamily: "'Oswald', sans-serif",
                fontWeight: "600",
                fontSize: "20px",
                lineHeight: "1.2",
                color: "#ffffff"
              }
            },
            text(data.name, "Product Name")
          ),
          React.createElement(
            "div",
            { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" } },
            React.createElement(
              "span",
              {
                style: {
                  border: "1px solid #3f3f46",
                  borderRadius: "9999px",
                  padding: "3px 10px",
                  fontSize: "11px",
                  color: "#d4d4d8"
                }
              },
              "SKU: ",
              text(data.sku, "N/A")
            ),
            React.createElement(
              "span",
              {
                style: {
                  border: "1px solid #27272a",
                  borderRadius: "9999px",
                  padding: "3px 10px",
                  fontSize: "11px",
                  color: "#a1a1aa"
                }
              },
              text(data.category, "General")
            )
          ),
          React.createElement(
            "p",
            { style: { margin: "0 0 10px", color: "#a1a1aa", fontSize: "13px", lineHeight: "1.5" } },
            text(data.description, "No product description available.")
          ),
          React.createElement(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "10px",
                fontSize: "12px"
              }
            },
            React.createElement(
              "div",
              {
                style: {
                  background: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  padding: "8px"
                }
              },
              React.createElement("div", { style: { color: "#71717a" } }, "MOQ"),
              React.createElement("div", { style: { color: "#e4e4e7", fontWeight: "600" } }, text(data.moq, "500 units"))
            ),
            React.createElement(
              "div",
              {
                style: {
                  background: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  padding: "8px"
                }
              },
              React.createElement("div", { style: { color: "#71717a" } }, "Lead Time"),
              React.createElement("div", { style: { color: "#e4e4e7", fontWeight: "600" } }, text(data.leadTime, "30-45 days"))
            )
          ),
          React.createElement(
            "div",
            {
              style: {
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: inStock ? "#4ade80" : "#ef4444",
                fontWeight: "700"
              }
            },
            React.createElement("span", { style: { fontSize: "14px" } }, inStock ? "✓" : "!"),
            inStock ? "In Stock" : "Out of Stock"
          )
        )
      )
    );
  };
})();

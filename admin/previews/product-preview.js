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

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function(key) {
        if (key === "style" && typeof attrs.style === "object") {
          Object.keys(attrs.style).forEach(function(prop) {
            node.style[prop] = attrs.style[prop];
          });
        } else if (key === "className") {
          node.className = attrs[key];
        } else {
          node.setAttribute(key, attrs[key]);
        }
      });
    }
    if (children !== undefined && children !== null) {
      if (!Array.isArray(children)) children = [children];
      children.forEach(function(child) {
        if (child === null || child === undefined || child === false) return;
        if (typeof child === "string" || typeof child === "number") {
          node.appendChild(document.createTextNode(String(child)));
        } else if (child instanceof Node) {
          node.appendChild(child);
        }
      });
    }
    return node;
  }

  window.ProductPreview = function(props) {
    var data = getData(props.entry);
    var image = text(data.image, "/images/placeholder.jpg");
    var featured = !!data.featured;
    var inStock = data.inStock !== false;

    return el("div",
      { style: { maxWidth: "420px", margin: "1.5rem auto" } },
      el("article",
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
        [
          el("div",
            { style: { position: "relative", background: "#09090b", aspectRatio: "1 / 1" } },
            [
              el("img", {
                src: image,
                alt: text(data.name, "Product image"),
                style: { width: "100%", height: "100%", objectFit: "cover" }
              }),
              featured
                ? el("span",
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
            ]
          ),
          el("div",
            { style: { padding: "14px" } },
            [
              el("p",
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
              el("h3",
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
              el("div",
                { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" } },
                [
                  el("span",
                    {
                      style: {
                        border: "1px solid #3f3f46",
                        borderRadius: "9999px",
                        padding: "3px 10px",
                        fontSize: "11px",
                        color: "#d4d4d8"
                      }
                    },
                    ["SKU: ", text(data.sku, "N/A")]
                  ),
                  el("span",
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
                ]
              ),
              el("p",
                { style: { margin: "0 0 10px", color: "#a1a1aa", fontSize: "13px", lineHeight: "1.5" } },
                text(data.description, "No product description available.")
              ),
              el("div",
                {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    marginBottom: "10px",
                    fontSize: "12px"
                  }
                },
                [
                  el("div",
                    {
                      style: {
                        background: "#09090b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                        padding: "8px"
                      }
                    },
                    [
                      el("div", { style: { color: "#71717a" } }, "MOQ"),
                      el("div", { style: { color: "#e4e4e7", fontWeight: "600" } }, text(data.moq, "500 units"))
                    ]
                  ),
                  el("div",
                    {
                      style: {
                        background: "#09090b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                        padding: "8px"
                      }
                    },
                    [
                      el("div", { style: { color: "#71717a" } }, "Lead Time"),
                      el("div", { style: { color: "#e4e4e7", fontWeight: "600" } }, text(data.leadTime, "30-45 days"))
                    ]
                  )
                ]
              ),
              el("div",
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
                [
                  el("span", { style: { fontSize: "14px" } }, inStock ? "\u2713" : "!"),
                  " " + (inStock ? "In Stock" : "Out of Stock")
                ]
              )
            ]
          )
        ]
      )
    );
  };
})();
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

  window.WarrantyPreview = function(props) {
    var data = getData(props.entry);
    var draft = !!data.draft;
    var typeColors = {
      "standard": { bg: "rgba(96,165,250,0.15)", color: "#60a5fa" },
      "brushless_motor": { bg: "rgba(250,204,21,0.15)", color: "#facc15" },
      "extended": { bg: "rgba(74,222,128,0.15)", color: "#4ade80" }
    };
    var tc = typeColors[data.warrantyType] || { bg: "rgba(255,255,255,0.05)", color: "#a1a1aa" };
    var categories = Array.isArray(data.applicableCategories) ? data.applicableCategories : [];
    var exclusions = Array.isArray(data.exclusions) ? data.exclusions : [];

    return el("div",
      { className: "cms-preview-root", style: { maxWidth: "720px", margin: "1.5rem auto" } },
      el("article", {
        style: {
          background: "#18181b",
          border: "1px solid #27272a",
          borderRadius: "12px",
          overflow: "hidden",
          color: "#e4e4e7",
          fontFamily: "'Source Sans 3', sans-serif"
        }
      }, [
        // Header
        el("div", {
          style: {
            background: tc.bg,
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap"
          }
        }, [
          el("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, [
            el("span", { style: { fontSize: "24px" } }, "\u2605"),
            el("div", [
              el("h3", {
                style: {
                  margin: "0",
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: "700",
                  fontSize: "20px",
                  lineHeight: "1.2",
                  color: "#ffffff"
                }
              }, text(data.title, "Warranty Policy")),
              el("div", { style: { fontSize: "13px", color: tc.color, fontWeight: "600" } }, text(data.warrantyPeriod, ""))
            ])
          ]),
          draft
            ? el("span", {
                style: {
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 10px",
                  borderRadius: "9999px",
                  background: "#ef4444",
                  color: "#ffffff"
                }
              }, "DRAFT")
            : null
        ]),

        el("div", { style: { padding: "16px" } }, [
          // Description
          data.description
            ? el("p", { style: { margin: "0 0 12px", color: "#a1a1aa", fontSize: "13px", lineHeight: "1.6" } }, text(data.description, ""))
            : null,

          // Applicable categories
          categories.length > 0
            ? el("div", { style: { marginBottom: "12px" } }, [
                el("div", { style: { fontSize: "11px", color: "#71717a", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" } }, "Applicable Categories"),
                el("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px" } },
                  categories.map(function(cat, i) {
                    var c = typeof cat === "string" ? cat : (cat.category || "");
                    return c ? el("span", {
                      key: i,
                      style: {
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        background: tc.bg,
                        color: tc.color,
                        border: "1px solid " + tc.color + "30"
                      }
                    }, c) : null;
                  }).filter(Boolean)
                )
              ])
            : null,

          // Exclusions
          exclusions.length > 0
            ? el("div", { style: { marginBottom: "12px" } }, [
                el("div", { style: { fontSize: "11px", color: "#ef4444", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" } }, "Exclusions"),
                el("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                  exclusions.map(function(ex, i) {
                    return el("div", {
                      key: i,
                      style: {
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "6px",
                        fontSize: "12px",
                        color: "#a1a1aa"
                      }
                    }, [
                      el("span", { style: { color: "#ef4444", flexShrink: "0" } }, "\u2717"),
                      text(ex, "")
                    ]);
                  })
                )
              ])
            : null,

          // Claim process
          data.claimProcess
            ? el("div", {
                style: {
                  background: "rgba(96,165,250,0.08)",
                  border: "1px solid rgba(96,165,250,0.2)",
                  borderRadius: "8px",
                  padding: "12px"
                }
              }, [
                el("div", { style: { fontSize: "11px", color: "#60a5fa", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "4px" } }, "Claim Process"),
                el("div", { style: { fontSize: "13px", color: "#d4d4d8", lineHeight: "1.5" } }, text(data.claimProcess, ""))
              ])
            : null
        ])
      ])
    );
  };
})();

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

  function formatDate(iso) {
    if (!iso) return "";
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch (e) {
      return String(iso);
    }
  }

  window.SafetyPreview = function(props) {
    var data = getData(props.entry);
    var draft = !!data.draft;
    var severityColors = {
      "critical": { bg: "rgba(239,68,68,0.15)", color: "#ef4444", border: "rgba(239,68,68,0.3)" },
      "warning": { bg: "rgba(249,115,22,0.15)", color: "#f97316", border: "rgba(249,115,22,0.3)" },
      "info": { bg: "rgba(96,165,250,0.15)", color: "#60a5fa", border: "rgba(96,165,250,0.3)" }
    };
    var sc = severityColors[data.severity] || severityColors["info"];
    var affectedSkus = Array.isArray(data.affectedSkus) ? data.affectedSkus : [];

    return el("div",
      { className: "cms-preview-root", style: { maxWidth: "720px", margin: "1.5rem auto" } },
      el("article", {
        style: {
          background: "#18181b",
          border: "1px solid " + sc.border,
          borderRadius: "12px",
          overflow: "hidden",
          color: "#e4e4e7",
          fontFamily: "'Source Sans 3', sans-serif"
        }
      }, [
        // Header bar
        el("div", {
          style: {
            background: sc.bg,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap"
          }
        }, [
          el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, [
            el("span", { style: { fontSize: "18px" } },
              data.severity === "critical" ? "\u26A0" : data.severity === "warning" ? "\u26A0" : "\u2139"
            ),
            el("span", {
              style: {
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                color: sc.color
              }
            }, text(data.severity, "info")),
            el("span", { style: { color: "#3f3f46" } }, "|"),
            el("span", {
              style: {
                fontSize: "11px",
                fontWeight: "600",
                color: "#a1a1aa",
                textTransform: "uppercase",
                letterSpacing: ".06em"
              }
            }, text(data.noticeType, "Safety Advisory"))
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

        // Content
        el("div", { style: { padding: "16px" } }, [
          el("h3", {
            style: {
              margin: "0 0 10px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "700",
              fontSize: "20px",
              lineHeight: "1.2",
              color: "#ffffff"
            }
          }, text(data.title, "Safety Notice")),

          el("p", {
            style: { margin: "0 0 12px", color: "#a1a1aa", fontSize: "13px", lineHeight: "1.6" }
          }, text(data.description, "No description.")),

          // Affected SKUs
          affectedSkus.length > 0
            ? el("div", { style: { marginBottom: "12px" } }, [
                el("div", {
                  style: {
                    fontSize: "11px",
                    color: "#71717a",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: "6px"
                  }
                }, "Affected SKUs (" + affectedSkus.length + ")"),
                el("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px" } },
                  affectedSkus.map(function(sku, i) {
                    return el("span", {
                      key: i,
                      style: {
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: sc.bg,
                        color: sc.color,
                        border: "1px solid " + sc.border,
                        fontFamily: "monospace"
                      }
                    }, text(sku, ""));
                  })
                )
              ])
            : null,

          // Resolution
          data.resolution
            ? el("div", {
                style: {
                  background: "rgba(74,222,128,0.08)",
                  border: "1px solid rgba(74,222,128,0.2)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginBottom: "12px"
                }
              }, [
                el("div", { style: { fontSize: "11px", color: "#4ade80", fontWeight: "700", marginBottom: "4px", textTransform: "uppercase", letterSpacing: ".06em" } }, "Resolution"),
                el("div", { style: { fontSize: "13px", color: "#d4d4d8", lineHeight: "1.5" } }, text(data.resolution, ""))
              ])
            : null,

          // Date
          data.date
            ? el("p", { style: { margin: "0", color: "#71717a", fontSize: "12px" } },
                "Issued: " + formatDate(data.date))
            : null
        ])
      ])
    );
  };
})();

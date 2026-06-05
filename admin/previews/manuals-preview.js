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

  function safeHref(href) {
    if (!href) return "#";
    var h = String(href).trim();
    if (/^(https?:|mailto:|tel:|\/|#)/i.test(h)) return h;
    if (/^[a-zA-Z0-9_\-\.]+$/.test(h) && !h.includes(" ")) return "/" + h;
    return "#";
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

  window.ManualsPreview = function(props) {
    var data = getData(props.entry);
    var draft = !!data.draft;
    var langNames = { en: "English", zh: "Chinese", ar: "Arabic", fr: "French", ru: "Russian", es: "Spanish" };

    return el("div",
      { className: "cms-preview-root", style: { maxWidth: "520px", margin: "1.5rem auto" } },
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
        el("div", { style: { padding: "16px" } }, [
          // Header
          el("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" } }, [
            el("span", {
              style: {
                fontSize: "11px",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "9999px",
                background: "rgba(74,222,128,0.12)",
                color: "#4ade80"
              }
            }, text(langNames[data.language], text(data.language, "Manual").toUpperCase())),
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

          // Title
          el("h3", {
            style: {
              margin: "0 0 6px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "600",
              fontSize: "18px",
              lineHeight: "1.2",
              color: "#ffffff"
            }
          }, text(data.title, "Manual Title")),

          // SKU
          data.productSku
            ? el("div", { style: { marginBottom: "10px" } }, [
                el("span", { style: { fontSize: "11px", color: "#71717a", fontFamily: "monospace" } }, text(data.productSku, ""))
              ])
            : null,

          // Meta grid
          el("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
              marginBottom: "12px"
            }
          }, [
            data.version
              ? el("div", { style: { background: "#09090b", border: "1px solid #27272a", borderRadius: "6px", padding: "6px 8px", fontSize: "11px" } }, [
                  el("div", { style: { color: "#71717a" } }, "Version"),
                  el("div", { style: { color: "#e4e4e7", fontWeight: "600" } }, text(data.version, ""))
                ])
              : null,
            data.pages
              ? el("div", { style: { background: "#09090b", border: "1px solid #27272a", borderRadius: "6px", padding: "6px 8px", fontSize: "11px" } }, [
                  el("div", { style: { color: "#71717a" } }, "Pages"),
                  el("div", { style: { color: "#e4e4e7", fontWeight: "600" } }, text(data.pages, "") + " pages")
                ])
              : null
          ].filter(Boolean)),

          // Date
          data.date
            ? el("div", { style: { fontSize: "12px", color: "#71717a", marginBottom: "12px" } },
                "Updated: " + formatDate(data.date))
            : null,

          // File link
          data.file
            ? el("a", {
                href: safeHref(data.file),
                target: "_blank",
                rel: "noopener noreferrer",
                style: {
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  background: "#4ade80",
                  color: "#09090b",
                  textDecoration: "none"
                }
              }, "\u2193 Download Manual")
            : el("p", { style: { color: "#71717a", fontSize: "12px" } }, "No file uploaded.")
        ])
      ])
    );
  };
})();

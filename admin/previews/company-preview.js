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

  function infoRow(icon, label, value, href) {
    var content = [
      el("span", { style: { fontSize: "16px", lineHeight: "1" } }, icon),
      el("div", { style: { minWidth: 0 } }, [
        el("div", { style: { fontSize: "11px", color: "#71717a", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "2px" } }, label),
        el("div", { style: { fontSize: "14px", color: "#e4e4e7", fontWeight: "500", wordBreak: "break-word" } }, text(value, "—"))
      ])
    ];
    if (href && String(value)) {
      return el("a", {
        href: safeHref(href),
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          padding: "10px 12px",
          background: "#09090b",
          border: "1px solid #27272a",
          borderRadius: "8px",
          textDecoration: "none",
          transition: "border-color 0.2s ease"
        }
      }, content);
    }
    return el("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "10px 12px",
        background: "#09090b",
        border: "1px solid #27272a",
        borderRadius: "8px"
      }
    }, content);
  }

  function toggleRow(label, active) {
    return el("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        background: "#09090b",
        border: "1px solid #27272a",
        borderRadius: "8px"
      }
    }, [
      el("span", { style: { fontSize: "13px", color: "#d4d4d8" } }, label),
      el("span", {
        style: {
          fontSize: "11px",
          fontWeight: "700",
          padding: "3px 10px",
          borderRadius: "9999px",
          background: active ? "rgba(74,222,128,0.15)" : "rgba(239,68,68,0.15)",
          color: active ? "#4ade80" : "#ef4444"
        }
      }, active ? "VISIBLE" : "HIDDEN")
    ]);
  }

  window.CompanyPreview = function(props) {
    var data = getData(props.entry);

    var contactItems = [];
    if (data.email) contactItems.push(infoRow("✉", "Email", data.email, "mailto:" + data.email));
    if (data.phone) contactItems.push(infoRow("☎", "Phone", data.phone, "tel:" + String(data.phone).replace(/[^\d+]/g, "")));
    if (data.address) contactItems.push(infoRow("◎", "Address", data.address));
    if (data.whatsapp) contactItems.push(infoRow("💬", "WhatsApp", data.whatsapp, "https://wa.me/" + String(data.whatsapp).replace(/[^\d]/g, "")));
    if (data.linkedin) contactItems.push(infoRow("in", "LinkedIn", data.linkedin, data.linkedin));
    if (data.youtube) contactItems.push(infoRow("▶", "YouTube", data.youtube, data.youtube));

    var toggleItems = [
      toggleRow("Team Section", !!data.showTeam),
      toggleRow("Certifications Section", !!data.showCertifications),
      toggleRow("Timeline Section", !!data.showTimeline)
    ];

    return el("section", {
      className: "cms-preview-root",
      style: {
        maxWidth: "900px",
        margin: "1.5rem auto",
        border: "1px solid #27272a",
        borderRadius: "14px",
        overflow: "hidden",
        background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
        color: "#e4e4e7",
        fontFamily: "'Source Sans 3', sans-serif"
      }
    }, [
      el("div", { style: { padding: "26px" } }, [
        // Header
        el("div", { style: { marginBottom: "20px" } }, [
          el("h2", {
            style: {
              margin: "0 0 6px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "700",
              fontSize: "32px",
              lineHeight: "1.1",
              color: "#ffffff"
            }
          }, text(data.companyName, "Ningbo Siyang Power Tools Co., Ltd.")),
          data.founded ? el("p", {
            style: { margin: "0", color: "#a1a1aa", fontSize: "14px" }
          }, "Established " + text(data.founded, "")) : null
        ]),

        // Contact Grid
        contactItems.length > 0
          ? el("div", {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "8px",
                marginBottom: "20px"
              }
            }, contactItems)
          : el("p", { style: { color: "#71717a", fontSize: "13px", marginBottom: "20px" } }, "No contact information provided."),

        // WeChat QR
        data.wechatQR
          ? el("div", {
              style: {
                marginBottom: "20px",
                padding: "14px",
                background: "#09090b",
                border: "1px solid #27272a",
                borderRadius: "10px"
              }
            }, [
              el("div", { style: { fontSize: "11px", color: "#71717a", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "10px" } }, "WeChat QR Code"),
              el("img", {
                src: data.wechatQR,
                alt: "WeChat QR",
                style: { width: "120px", height: "120px", borderRadius: "8px", objectFit: "cover", border: "1px solid #27272a" }
              })
            ])
          : null,

        // Section Toggles
        el("div", {
          style: {
            borderTop: "1px solid #27272a",
            paddingTop: "16px"
          }
        }, [
          el("h3", {
            style: {
              margin: "0 0 10px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "600",
              fontSize: "14px",
              color: "#facc15",
              textTransform: "uppercase",
              letterSpacing: ".08em"
            }
          }, "Page Sections"),
          el("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "8px"
            }
          }, toggleItems)
        ])
      ])
    ]);
  };
})();

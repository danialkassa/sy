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

  function safeHref(href) {
    if (!href) return "#";
    var h = String(href).trim();
    if (/^(https?:|mailto:|tel:|\/|#)/i.test(h)) return h;
    if (/^[a-zA-Z0-9_\-\.]+$/.test(h) && !h.includes(" ")) return "/" + h;
    return "#";
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

  window.OemOdmPreview = function(props) {
    var data = getData(props.entry);

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
        // Hero
        el("div", { style: { marginBottom: "24px" } }, [
          el("h2", {
            style: {
              margin: "0 0 8px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "700",
              fontSize: "36px",
              lineHeight: "1.1",
              color: "#ffffff"
            }
          }, text(data.pageTitle, "OEM/ODM Capabilities")),
          el("p", {
            style: {
              margin: "0 0 16px",
              color: "#a1a1aa",
              fontSize: "16px",
              lineHeight: "1.5"
            }
          }, text(data.subtitle, "Full-service OEM & ODM manufacturing solutions for global power tool brands"))
        ]),

        // CTA Button
        data.ctaText
          ? el("a", {
              href: safeHref(data.ctaLink),
              style: {
                display: "inline-block",
                background: "#facc15",
                color: "#09090b",
                padding: "12px 28px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "14px",
                textDecoration: "none",
                marginBottom: "24px",
                boxShadow: "0 4px 20px rgba(250,204,21,0.25)"
              }
            }, text(data.ctaText, "Start Your OEM Project"))
          : null,

        // Capabilities Grid
        el("div", {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
            marginBottom: "24px"
          }
        }, [
          el("div", {
            style: {
              background: "#09090b",
              border: "1px solid #27272a",
              borderRadius: "10px",
              padding: "16px"
            }
          }, [
            el("div", { style: { fontSize: "24px", marginBottom: "6px" } }, "🏭"),
            el("div", { style: { fontWeight: "600", color: "#ffffff", fontSize: "14px", marginBottom: "4px" } }, "OEM Manufacturing"),
            el("div", { style: { fontSize: "12px", color: "#a1a1aa", lineHeight: "1.4" } }, "Custom branding, packaging, and product customization")
          ]),
          el("div", {
            style: {
              background: "#09090b",
              border: "1px solid #27272a",
              borderRadius: "10px",
              padding: "16px"
            }
          }, [
            el("div", { style: { fontSize: "24px", marginBottom: "6px" } }, "⚙️"),
            el("div", { style: { fontWeight: "600", color: "#ffffff", fontSize: "14px", marginBottom: "4px" } }, "ODM Development"),
            el("div", { style: { fontSize: "12px", color: "#a1a1aa", lineHeight: "1.4" } }, "Full product design and engineering from concept to production")
          ]),
          el("div", {
            style: {
              background: "#09090b",
              border: "1px solid #27272a",
              borderRadius: "10px",
              padding: "16px"
            }
          }, [
            el("div", { style: { fontSize: "24px", marginBottom: "6px" } }, "📋"),
            el("div", { style: { fontWeight: "600", color: "#ffffff", fontSize: "14px", marginBottom: "4px" } }, "Quality Control"),
            el("div", { style: { fontSize: "12px", color: "#a1a1aa", lineHeight: "1.4" } }, "ISO 9001 certified with SGS verification at every stage")
          ])
        ]),

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
          }, [
            toggleRow("Case Studies Section", !!data.showCaseStudies),
            toggleRow("Certifications Section", !!data.showCertifications)
          ])
        ])
      ])
    ]);
  };
})();

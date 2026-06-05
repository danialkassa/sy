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

  window.DistributorPreview = function(props) {
    var data = getData(props.entry);
    var draft = !!data.draft;
    var regionColors = {
      "Asia-Pacific": "#60a5fa",
      "Europe": "#a78bfa",
      "North America": "#f472b6",
      "Middle East": "#fb923c",
      "Africa": "#4ade80",
      "South America": "#facc15"
    };
    var regionColor = regionColors[data.region] || "#a1a1aa";

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
        // Logo
        data.logo
          ? el("div", { style: { position: "relative", background: "#09090b", padding: "16px", display: "flex", justifyContent: "center" } }, [
              el("img", {
                src: data.logo,
                alt: text(data.companyName, "Distributor logo"),
                style: { maxHeight: "80px", maxWidth: "200px", objectFit: "contain" },
                onerror: "this.style.display='none'"
              }),
              draft
                ? el("span", {
                    style: {
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "#ef4444",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      boxShadow: "0 2px 12px rgba(239,68,68,0.4)"
                    }
                  }, "DRAFT")
                : null
            ])
          : null,

        el("div", { style: { padding: "16px" } }, [
          // Region badge
          el("div", { style: { marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" } }, [
            el("span", {
              style: {
                fontSize: "11px",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "9999px",
                background: regionColor + "20",
                color: regionColor,
                border: "1px solid " + regionColor + "40"
              }
            }, text(data.region, "Region")),
            el("span", { style: { fontSize: "13px", color: "#a1a1aa" } }, text(data.country, ""))
          ]),

          // Company name
          el("h3", {
            style: {
              margin: "0 0 10px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "600",
              fontSize: "20px",
              lineHeight: "1.2",
              color: "#ffffff"
            }
          }, text(data.companyName, "Company Name")),

          // Contact grid
          el("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
              marginBottom: "10px",
              fontSize: "11px"
            }
          }, [
            data.contactPerson
              ? el("div", { style: { background: "#09090b", border: "1px solid #27272a", borderRadius: "6px", padding: "6px 8px" } }, [
                  el("div", { style: { color: "#71717a" } }, "Contact"),
                  el("div", { style: { color: "#e4e4e7", fontWeight: "600" } }, text(data.contactPerson, ""))
                ])
              : null,
            data.phone
              ? el("div", { style: { background: "#09090b", border: "1px solid #27272a", borderRadius: "6px", padding: "6px 8px" } }, [
                  el("div", { style: { color: "#71717a" } }, "Phone"),
                  el("div", { style: { color: "#e4e4e7", fontWeight: "600" } }, text(data.phone, ""))
                ])
              : null
          ].filter(Boolean)),

          // Email
          data.email
            ? el("div", { style: { marginBottom: "8px" } }, [
                el("a", {
                  href: "mailto:" + text(data.email, ""),
                  style: { fontSize: "12px", color: "#60a5fa", textDecoration: "none" }
                }, text(data.email, ""))
              ])
            : null,

          // Address
          data.address
            ? el("p", { style: { margin: "0 0 8px", color: "#a1a1aa", fontSize: "12px", lineHeight: "1.5" } }, text(data.address, ""))
            : null,

          // Product lines
          data.productLines
            ? el("div", { style: { marginBottom: "8px" } }, [
                el("span", { style: { fontSize: "11px", color: "#71717a", textTransform: "uppercase", letterSpacing: ".06em" } }, "Product Lines: "),
                el("span", { style: { fontSize: "12px", color: "#d4d4d8" } }, text(data.productLines, ""))
              ])
            : null,

          // Website
          data.website
            ? el("a", {
                href: safeHref(data.website),
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
                  background: "#27272a",
                  color: "#e4e4e7",
                  textDecoration: "none",
                  border: "1px solid #3f3f46"
                }
              }, "\u2192 Visit Website")
            : null
        ])
      ])
    );
  };
})();

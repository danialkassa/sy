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

  window.PartnerPreview = function(props) {
    var data = getData(props.entry);
    var draft = !!data.draft;
    var typeColors = {
      "Distributor": "#60a5fa",
      "OEM Client": "#a78bfa",
      "Retail Chain": "#f472b6",
      "Supplier": "#4ade80",
      "Strategic Partner": "#facc15"
    };
    var typeColor = typeColors[data.partnerType] || "#a1a1aa";

    return el("div",
      { className: "cms-preview-root", style: { maxWidth: "420px", margin: "1.5rem auto" } },
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
          ? el("div", { style: { position: "relative", background: "#09090b", padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", height: "100px" } }, [
              el("img", {
                src: data.logo,
                alt: text(data.name, "Partner logo"),
                style: { maxHeight: "60px", maxWidth: "160px", objectFit: "contain" },
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

        el("div", { style: { padding: "14px" } }, [
          // Type badge
          el("div", { style: { marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" } }, [
            el("span", {
              style: {
                fontSize: "10px",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "9999px",
                background: typeColor + "20",
                color: typeColor,
                border: "1px solid " + typeColor + "40"
              }
            }, text(data.partnerType, "Partner")),
            data.country ? el("span", { style: { fontSize: "12px", color: "#a1a1aa" } }, text(data.country, "")) : null,
            data.order !== undefined && data.order !== null
              ? el("span", { style: { fontSize: "11px", color: "#71717a", fontFamily: "monospace" } }, "#" + text(data.order, "0"))
              : null
          ]),

          // Name
          el("h3", {
            style: {
              margin: "0 0 8px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "600",
              fontSize: "18px",
              lineHeight: "1.2",
              color: "#ffffff"
            }
          }, text(data.name, "Partner Name")),

          // Website
          data.website
            ? el("a", {
                href: safeHref(data.website),
                target: "_blank",
                rel: "noopener noreferrer",
                style: { fontSize: "12px", color: "#60a5fa", textDecoration: "none" }
              }, text(data.website, ""))
            : null
        ])
      ])
    );
  };
})();

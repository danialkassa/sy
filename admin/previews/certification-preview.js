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

  window.CertificationPreview = function(props) {
    var data = getData(props.entry);
    var draft = !!data.draft;
    var image = text(data.image, "");

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
        // Certificate image
        image
          ? el("div", { style: { position: "relative", background: "#09090b" } }, [
              el("img", {
                src: image,
                alt: text(data.name, "Certificate"),
                style: { width: "100%", height: "180px", objectFit: "contain", padding: "10px" },
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
          // Name
          el("h3", {
            style: {
              margin: "0 0 6px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "600",
              fontSize: "18px",
              lineHeight: "1.2",
              color: "#ffffff"
            }
          }, text(data.name, "Certification")),

          // Issuer & Year
          el("div", { style: { marginBottom: "10px", fontSize: "13px", color: "#a1a1aa" } }, [
            text(data.issuer, "Issuer"),
            data.year ? " \u00B7 " + text(data.year, "") : ""
          ]),

          // Cert number & expiry
          el("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
              marginBottom: "10px",
              fontSize: "11px"
            }
          }, [
            data.cert_number
              ? el("div", { style: { background: "#09090b", border: "1px solid #27272a", borderRadius: "6px", padding: "6px 8px" } }, [
                  el("div", { style: { color: "#71717a" } }, "Cert #"),
                  el("div", { style: { color: "#e4e4e7", fontWeight: "600", fontFamily: "monospace" } }, text(data.cert_number, ""))
                ])
              : null,
            data.expiryDate
              ? el("div", { style: { background: "#09090b", border: "1px solid #27272a", borderRadius: "6px", padding: "6px 8px" } }, [
                  el("div", { style: { color: "#71717a" } }, "Expires"),
                  el("div", { style: { color: "#e4e4e7", fontWeight: "600" } }, text(data.expiryDate, ""))
                ])
              : null
          ].filter(Boolean)),

          // Scope
          data.scope
            ? el("p", { style: { margin: "0 0 10px", color: "#a1a1aa", fontSize: "12px", lineHeight: "1.5" } }, text(data.scope, ""))
            : null,

          // Verify link
          data.verifyUrl
            ? el("a", {
                href: safeHref(data.verifyUrl),
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
              }, "\u2713 Verify Online")
            : null
        ])
      ])
    );
  };
})();

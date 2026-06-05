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

  window.TeamPreview = function(props) {
    var data = getData(props.entry);
    var draft = !!data.draft;
    var image = text(data.photo, "");

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
        // Photo
        el("div", { style: { position: "relative", background: "#09090b", aspectRatio: "1 / 1" } }, [
          image
            ? el("img", {
                src: image,
                alt: text(data.name, "Team member"),
                style: { width: "100%", height: "100%", objectFit: "cover" },
                onerror: "this.style.display='none'"
              })
            : el("div", {
                style: {
                  width: "100%", height: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#3f3f46", fontSize: "14px"
                }
              }, "No photo"),
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
        ]),

        el("div", { style: { padding: "14px" } }, [
          // Name
          el("h3", {
            style: {
              margin: "0 0 4px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "600",
              fontSize: "20px",
              lineHeight: "1.2",
              color: "#ffffff"
            }
          }, text(data.name, "Name")),

          // Title & Department
          el("div", { style: { marginBottom: "8px", fontSize: "13px", color: "#a1a1aa" } }, [
            el("span", { style: { color: "#e4e4e7", fontWeight: "500" } }, text(data.title, "Title")),
            data.department ? el("span", { style: { color: "#71717a" } }, " \u00B7 " + text(data.department, "")) : null
          ]),

          // Bio
          data.bio
            ? el("p", { style: { margin: "0 0 10px", color: "#a1a1aa", fontSize: "13px", lineHeight: "1.5" } }, text(data.bio, ""))
            : null,

          // Order
          data.order !== undefined && data.order !== null
            ? el("div", { style: { fontSize: "11px", color: "#71717a", fontFamily: "monospace", marginBottom: "10px" } }, "Order: " + text(data.order, "0"))
            : null,

          // Contact links
          (data.email || data.linkedin)
            ? el("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } }, [
                data.email
                  ? el("a", {
                      href: "mailto:" + text(data.email, ""),
                      style: {
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        background: "#27272a",
                        color: "#e4e4e7",
                        textDecoration: "none",
                        border: "1px solid #3f3f46"
                      }
                    }, "\u2709 Email")
                  : null,
                data.linkedin
                  ? el("a", {
                      href: safeHref(data.linkedin),
                      target: "_blank",
                      rel: "noopener noreferrer",
                      style: {
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        background: "#27272a",
                        color: "#e4e4e7",
                        textDecoration: "none",
                        border: "1px solid #3f3f46"
                      }
                    }, "in LinkedIn")
                  : null
              ])
            : null
        ])
      ])
    );
  };
})();

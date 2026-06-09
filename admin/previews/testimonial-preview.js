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

  window.TestimonialPreview = function(props) {
    if (window.CMSPreviewStyles) window.CMSPreviewStyles.inject();
    var data = getData(props.entry);
    var draft = !!data.draft;
    var archived = !!data.archived;
    var rating = Math.max(1, Math.min(5, parseInt(data.rating, 10) || 5));
    var image = text(data.avatar, "");

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
          // Header row
          el("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" } }, [
            // Avatar + name
            el("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, [
              image
                ? el("img", {
                    src: image,
                    alt: text(data.name, ""),
                    style: { width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "2px solid #27272a" },
                    onerror: "this.style.display='none'"
                  })
                : el("div", {
                    style: {
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: "#27272a", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px", fontWeight: "700", color: "#facc15"
                    }
                  }, text(data.name, "?").charAt(0).toUpperCase()),
              el("div", [
                el("div", { style: { fontWeight: "600", color: "#ffffff", fontSize: "14px" } }, text(data.name, "Name")),
                el("div", { style: { fontSize: "12px", color: "#a1a1aa" } }, [
                  text(data.position, ""),
                  data.position && data.company ? " \u00B7 " : "",
                  text(data.company, ""),
                  data.country ? " \u00B7 " + text(data.country, "") : ""
                ])
              ])
            ]),

            draft || archived
              ? el("div", {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    alignItems: "flex-end"
                  }
                }, [
                  draft ? el("span", { className: "cms-preview-badge cms-preview-badge--draft" }, "DRAFT") : null,
                  archived ? el("span", { className: "cms-preview-badge cms-preview-badge--archived" }, "ARCHIVED") : null
                ])
              : null
          ]),

          // Stars
          el("div", { style: { marginBottom: "10px", fontSize: "16px", letterSpacing: "2px" } },
            Array.from({ length: 5 }, function(_, i) {
              return i < rating ? "\u2605" : "\u2606";
            }).join("")
          ),

          // Quote
          el("p", {
            style: {
              margin: "0 0 10px",
              color: "#d4d4d8",
              fontSize: "14px",
              lineHeight: "1.6",
              fontStyle: "italic"
            }
          }, "\u201C" + text(data.quote, "No quote provided.") + "\u201D"),

          // Order
          data.order !== undefined && data.order !== null
            ? el("div", { style: { fontSize: "11px", color: "#71717a", fontFamily: "monospace" } }, "Display Order: " + text(data.order, "0"))
            : null
        ])
      ])
    );
  };
})();

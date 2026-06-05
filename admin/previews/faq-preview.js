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

  window.FaqPreview = function(props) {
    var data = getData(props.entry);
    var draft = !!data.draft;
    var categoryColors = {
      "Orders": "#60a5fa",
      "Payment": "#4ade80",
      "Shipping": "#fb923c",
      "Quality": "#f472b6",
      "Customization": "#a78bfa",
      "Warranty": "#facc15",
      "Support": "#38bdf8",
      "Partnership": "#a1a1aa"
    };
    var catColor = categoryColors[data.category] || "#a1a1aa";

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
        el("div", { style: { padding: "16px" } }, [
          // Category & order
          el("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" } }, [
            el("span", {
              style: {
                fontSize: "10px",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "9999px",
                background: catColor + "20",
                color: catColor,
                border: "1px solid " + catColor + "40"
              }
            }, text(data.category, "General")),
            data.order !== undefined && data.order !== null
              ? el("span", { style: { fontSize: "11px", color: "#71717a", fontFamily: "monospace" } }, "#" + text(data.order, "0"))
              : null,
            draft
              ? el("span", {
                  style: {
                    fontSize: "10px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    background: "#ef4444",
                    color: "#ffffff"
                  }
                }, "DRAFT")
              : null
          ]),

          // Question
          el("h3", {
            style: {
              margin: "0 0 8px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "600",
              fontSize: "16px",
              lineHeight: "1.3",
              color: "#ffffff"
            }
          }, text(data.question, "Question")),

          // Answer
          el("p", {
            style: { margin: "0", color: "#a1a1aa", fontSize: "13px", lineHeight: "1.6" }
          }, text(data.answer, "No answer provided."))
        ])
      ])
    );
  };
})();

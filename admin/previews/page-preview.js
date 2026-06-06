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

  window.PagePreview = function(props) {
    var data = getData(props.entry);
    var title = text(data.pageTitle || data.title, "Page Title");
    var subtitle = text(data.subtitle, "");
    var description = text(data.description, "");
    var body = text(data.body, "");

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
        // Title
        el("h2", {
          style: {
            margin: "0 0 8px",
            fontFamily: "'Oswald', sans-serif",
            fontWeight: "700",
            fontSize: "32px",
            lineHeight: "1.1",
            color: "#ffffff"
          }
        }, title),

        // Subtitle
        subtitle
          ? el("p", {
              style: {
                margin: "0 0 16px",
                color: "#a1a1aa",
                fontSize: "16px",
                lineHeight: "1.5"
              }
            }, subtitle)
          : null,

        // Description
        description
          ? el("p", {
              style: {
                margin: "0 0 16px",
                color: "#d4d4d8",
                fontSize: "14px",
                lineHeight: "1.6"
              }
            }, description)
          : null,

        // Body preview
        body
          ? el("div", {
              style: {
                borderTop: "1px solid #27272a",
                paddingTop: "16px",
                marginTop: "16px"
              }
            }, [
              el("div", {
                style: {
                  fontSize: "11px",
                  color: "#71717a",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: "8px"
                }
              }, "Page Content"),
              el("div", {
                style: {
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#d4d4d8",
                  maxHeight: "300px",
                  overflow: "hidden",
                  maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)"
                }
              }, body)
            ])
          : null
      ])
    ]);
  };
})();

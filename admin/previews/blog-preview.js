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

  window.BlogPreview = function(props) {
    var data = getData(props.entry);
    var bodyNode = props.widgetFor ? props.widgetFor("body") : null;

    return el("article",
      {
        style: {
          maxWidth: "860px",
          margin: "1.5rem auto",
          background: "#09090b",
          color: "#e4e4e7",
          border: "1px solid #27272a",
          borderRadius: "12px",
          overflow: "hidden",
          fontFamily: "'Source Sans 3', sans-serif"
        }
      },
      [
        data.image
          ? el("img", {
              src: data.image,
              alt: text(data.title, "Blog cover image"),
              style: { width: "100%", maxHeight: "380px", objectFit: "cover" }
            })
          : null,
        el("div",
          { style: { padding: "24px" } },
          [
            el("h1",
              {
                style: {
                  margin: "0 0 10px",
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: "700",
                  fontSize: "34px",
                  lineHeight: "1.1",
                  color: "#ffffff"
                }
              },
              text(data.title, "Post title")
            ),
            el("p",
              { style: { margin: "0 0 14px", color: "#a1a1aa", fontSize: "14px" } },
              ["By ", text(data.author, "Ningbo Siyang Team"), " \u00B7 ", text(data.date, "No date"), " \u00B7 ", text(data.category, "General")]
            ),
            el("p",
              {
                style: {
                  margin: "0 0 20px",
                  color: "#d4d4d8",
                  fontStyle: "italic",
                  borderLeft: "3px solid #facc15",
                  paddingLeft: "12px"
                }
              },
              text(data.excerpt, "Post excerpt appears here.")
            ),
            el("div",
              {
                style: {
                  lineHeight: "1.7",
                  color: "#d4d4d8"
                }
              },
              bodyNode || text(data.body, "Start writing your post...")
            )
          ]
        )
      ]
    );
  };
})();
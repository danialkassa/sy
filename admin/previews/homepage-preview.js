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

  function stat(label, value) {
    return el("div",
      {
        style: {
          background: "rgba(24, 24, 27, 0.85)",
          border: "1px solid #27272a",
          borderRadius: "10px",
          padding: "14px"
        }
      },
      [
        el("div",
          {
            style: {
              fontSize: "26px",
              lineHeight: "1",
              fontWeight: "700",
              color: "#facc15",
              fontFamily: "'Oswald', sans-serif"
            }
          },
          text(value, "0")
        ),
        el("div",
          {
            style: {
              marginTop: "6px",
              fontSize: "12px",
              color: "#a1a1aa",
              textTransform: "uppercase",
              letterSpacing: ".06em"
            }
          },
          text(label, "Stat")
        )
      ]
    );
  }

  window.HomepagePreview = function(props) {
    var data = getData(props.entry);
    return el("section",
      {
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
      },
      el("div",
        { style: { padding: "26px" } },
        [
          el("h2",
            {
              style: {
                margin: "0",
                fontFamily: "'Oswald', sans-serif",
                fontWeight: "700",
                fontSize: "46px",
                lineHeight: "1",
                color: "#ffffff"
              }
            },
            text(data.heroTitle, "POWER YOUR CRAFT")
          ),
          el("p",
            {
              style: {
                margin: "12px 0 0",
                color: "#a1a1aa",
                fontSize: "16px"
              }
            },
            text(data.heroSubtitle, "Professional Power Tools Since 1998")
          ),
          el("div",
            {
              style: {
                marginTop: "22px",
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "10px"
              }
            },
            [
              stat(data.stat1Label, data.stat1Value),
              stat(data.stat2Label, data.stat2Value),
              stat(data.stat3Label, data.stat3Value)
            ]
          )
        ]
      )
    );
  };
})();
(function() {
  var COLORS = [
    "#facc15",
    "#eab308",
    "#09090b",
    "#18181b",
    "#27272a",
    "#3f3f46",
    "#a1a1aa",
    "#e4e4e7",
    "#ffffff"
  ];

  function normalizeHex(value) {
    if (!value) return "";
    var v = String(value).trim();
    if (!v) return "";
    if (v[0] !== "#") v = "#" + v;
    return v.slice(0, 7);
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
        } else if (key === "type") {
          node.type = attrs[key];
        } else if (key === "onClick") {
          node.addEventListener("click", attrs[key]);
        } else if (key === "onChange") {
          node.addEventListener("input", attrs[key]);
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

  window.ColorSwatchControl = function(props) {
    var selected = normalizeHex(props.value || "#facc15");

    function setValue(next) {
      props.onChange(normalizeHex(next));
    }

    var swatchRow = el("div",
      { style: { display: "flex", flexWrap: "wrap", gap: "8px" } },
      COLORS.map(function(color) {
        var active = selected.toLowerCase() === color;
        return el("button", {
          type: "button",
          onClick: function() {
            setValue(color);
          },
          title: color,
          style: {
            width: "28px",
            height: "28px",
            borderRadius: "9999px",
            border: active ? "2px solid #facc15" : "2px solid #27272a",
            background: color,
            cursor: "pointer"
          }
        });
      })
    );

    var previewBox = el("div", {
      style: {
        width: "46px",
        height: "46px",
        borderRadius: "8px",
        border: "1px solid #3f3f46",
        background: selected || "#09090b"
      }
    });

    var hexInput = el("input", {
      type: "text",
      value: selected,
      onChange: function(event) {
        setValue(event.target.value);
      },
      placeholder: "#facc15",
      style: {
        flex: "1",
        height: "38px",
        borderRadius: "8px",
        border: "1px solid #3f3f46",
        background: "#09090b",
        color: "#e4e4e7",
        padding: "0 10px"
      }
    });

    var inputRow = el("div",
      { style: { display: "flex", gap: "10px", alignItems: "center" } },
      [previewBox, hexInput]
    );

    return el("div",
      { style: { display: "grid", gap: "10px" } },
      [swatchRow, inputRow]
    );
  };

  window.ColorSwatchPreview = function(props) {
    var val = normalizeHex(props.value || "#facc15") || "#09090b";
    return el("div", {
      style: {
        width: "24px",
        height: "24px",
        borderRadius: "9999px",
        border: "1px solid #3f3f46",
        background: val
      }
    });
  };
})();
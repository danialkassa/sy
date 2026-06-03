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

  window.BlogPreview = function(props) {
    var data = getData(props.entry);
    var bodyNode = props.widgetFor ? props.widgetFor("body") : null;
    return React.createElement(
      "article",
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
      data.image
        ? React.createElement("img", {
            src: data.image,
            alt: text(data.title, "Blog cover image"),
            style: { width: "100%", maxHeight: "380px", objectFit: "cover" }
          })
        : null,
      React.createElement(
        "div",
        { style: { padding: "24px" } },
        React.createElement(
          "h1",
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
        React.createElement(
          "p",
          { style: { margin: "0 0 14px", color: "#a1a1aa", fontSize: "14px" } },
          "By ",
          text(data.author, "Ningbo Siyang Team"),
          " · ",
          text(data.date, "No date"),
          " · ",
          text(data.category, "General")
        ),
        React.createElement(
          "p",
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
        React.createElement(
          "div",
          {
            style: {
              lineHeight: "1.7",
              color: "#d4d4d8"
            }
          },
          bodyNode || React.createElement("p", null, text(data.body, "Start writing your post..."))
        )
      )
    );
  };
})();

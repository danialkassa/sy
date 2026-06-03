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

  function stat(label, value) {
    return React.createElement(
      "div",
      {
        style: {
          background: "rgba(24, 24, 27, 0.85)",
          border: "1px solid #27272a",
          borderRadius: "10px",
          padding: "14px"
        }
      },
      React.createElement(
        "div",
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
      React.createElement(
        "div",
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
    );
  }

  window.HomepagePreview = function(props) {
    var data = getData(props.entry);
    return React.createElement(
      "section",
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
      React.createElement(
        "div",
        { style: { padding: "26px" } },
        React.createElement(
          "h2",
          {
            style: {
              margin: 0,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "700",
              fontSize: "46px",
              lineHeight: "1",
              color: "#ffffff"
            }
          },
          text(data.heroTitle, "POWER YOUR CRAFT")
        ),
        React.createElement(
          "p",
          {
            style: {
              margin: "12px 0 0",
              color: "#a1a1aa",
              fontSize: "16px"
            }
          },
          text(data.heroSubtitle, "Professional Power Tools Since 1998")
        ),
        React.createElement(
          "div",
          {
            style: {
              marginTop: "22px",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "10px"
            }
          },
          stat(data.stat1Label, data.stat1Value),
          stat(data.stat2Label, data.stat2Value),
          stat(data.stat3Label, data.stat3Value)
        )
      )
    );
  };
})();

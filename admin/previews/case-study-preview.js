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

  function formatDate(iso) {
    if (!iso) return "";
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch (e) {
      return String(iso);
    }
  }

  window.CaseStudyPreview = function(props) {
    var data = getData(props.entry);
    var draft = !!data.draft;
    var featured = !!data.featured;
    var results = Array.isArray(data.results) ? data.results : [];

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
        // Hero image
        data.image
          ? el("div", { style: { position: "relative", background: "#09090b" } }, [
              el("img", {
                src: data.image,
                alt: text(data.title, "Case study"),
                style: { width: "100%", height: "200px", objectFit: "cover" },
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
                : null,
              featured
                ? el("span", {
                    style: {
                      position: "absolute",
                      top: draft ? "40px" : "12px",
                      left: "12px",
                      background: "#facc15",
                      color: "#09090b",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      boxShadow: "0 2px 12px rgba(250,204,21,0.4)"
                    }
                  }, "Featured")
                : null
            ])
          : null,

        el("div", { style: { padding: "16px" } }, [
          // Meta
          el("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" } }, [
            data.countryFlag ? el("span", { style: { fontSize: "20px" } }, text(data.countryFlag, "")) : null,
            el("span", { style: { fontSize: "13px", color: "#a1a1aa" } }, [
              text(data.client, "Client"),
              data.country ? " \u00B7 " + text(data.country, "") : "",
              data.industry ? " \u00B7 " + text(data.industry, "") : ""
            ]),
            data.date
              ? el("span", { style: { fontSize: "11px", color: "#71717a" } }, formatDate(data.date))
              : null
          ]),

          // Title
          el("h3", {
            style: {
              margin: "0 0 10px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "700",
              fontSize: "20px",
              lineHeight: "1.2",
              color: "#ffffff"
            }
          }, text(data.title, "Case Study")),

          // Challenge
          data.challenge
            ? el("div", { style: { marginBottom: "10px" } }, [
                el("div", { style: { fontSize: "11px", color: "#ef4444", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "4px" } }, "Challenge"),
                el("p", { style: { margin: "0", color: "#a1a1aa", fontSize: "13px", lineHeight: "1.5" } }, text(data.challenge, ""))
              ])
            : null,

          // Solution
          data.solution
            ? el("div", { style: { marginBottom: "10px" } }, [
                el("div", { style: { fontSize: "11px", color: "#60a5fa", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "4px" } }, "Solution"),
                el("p", { style: { margin: "0", color: "#a1a1aa", fontSize: "13px", lineHeight: "1.5" } }, text(data.solution, ""))
              ])
            : null,

          // Results
          results.length > 0
            ? el("div", { style: { marginBottom: "10px" } }, [
                el("div", { style: { fontSize: "11px", color: "#4ade80", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "4px" } }, "Results"),
                el("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                  results.map(function(r, i) {
                    return el("div", {
                      key: i,
                      style: {
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "6px",
                        fontSize: "13px",
                        color: "#d4d4d8"
                      }
                    }, [
                      el("span", { style: { color: "#4ade80", fontWeight: "700" } }, "\u2713"),
                      text(r, "")
                    ]);
                  })
                )
              ])
            : null,

          // Testimonial
          data.testimonial
            ? el("div", {
                style: {
                  background: "rgba(250,204,21,0.06)",
                  border: "1px solid rgba(250,204,21,0.15)",
                  borderRadius: "8px",
                  padding: "12px",
                  marginTop: "10px"
                }
              }, [
                el("p", { style: { margin: "0 0 6px", fontStyle: "italic", color: "#d4d4d8", fontSize: "13px", lineHeight: "1.5" } }, "\u201C" + text(data.testimonial, "") + "\u201D"),
                data.testimonialAuthor
                  ? el("cite", { style: { fontStyle: "normal", fontSize: "12px", color: "#facc15", fontWeight: "600" } }, "\u2014 " + text(data.testimonialAuthor, ""))
                  : null
              ])
            : null
        ])
      ])
    );
  };
})();

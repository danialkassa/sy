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

  function toggleRow(label, active) {
    return el("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        background: "#09090b",
        border: "1px solid #27272a",
        borderRadius: "8px"
      }
    }, [
      el("span", { style: { fontSize: "13px", color: "#d4d4d8" } }, label),
      el("span", {
        style: {
          fontSize: "11px",
          fontWeight: "700",
          padding: "3px 10px",
          borderRadius: "9999px",
          background: active ? "rgba(74,222,128,0.15)" : "rgba(239,68,68,0.15)",
          color: active ? "#4ade80" : "#ef4444"
        }
      }, active ? "VISIBLE" : "HIDDEN")
    ]);
  }

  window.HomepagePreview = function(props) {
    var data = getData(props.entry);
    var featuredCategories = Array.isArray(data.featuredCategories) ? data.featuredCategories : [];

    return el("section",
      {
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
      },
      el("div",
        { style: { padding: "26px" } },
        [
          // Hero
          el("h2", {
            style: {
              margin: "0",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "700",
              fontSize: "46px",
              lineHeight: "1",
              color: "#ffffff"
            }
          }, text(data.heroTitle, "POWER YOUR CRAFT")),

          el("p", {
            style: {
              margin: "12px 0 0",
              color: "#a1a1aa",
              fontSize: "16px"
            }
          }, text(data.heroSubtitle, "Professional Power Tools Since 1998")),

          // CTA
          data.heroCtaText
            ? el("a", {
                href: safeHref(data.heroCtaLink),
                style: {
                  display: "inline-block",
                  marginTop: "16px",
                  background: "#facc15",
                  color: "#09090b",
                  padding: "12px 28px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "14px",
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(250,204,21,0.25)"
                }
              }, text(data.heroCtaText, "Request a Quote"))
            : null,

          // Stats (from list)
          el("div", {
            style: {
              marginTop: "22px",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "10px"
            }
          }, (Array.isArray(data.stats) ? data.stats : []).slice(0, 6).map(function(item, i) {
            return stat(text(item.label, "Stat"), text(item.value, "0"));
          })),

          // Featured Categories
          featuredCategories.length > 0
            ? el("div", { style: { marginTop: "20px" } }, [
                el("h3", {
                  style: {
                    margin: "0 0 10px",
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#facc15",
                    textTransform: "uppercase",
                    letterSpacing: ".08em"
                  }
                }, "Featured Categories (" + featuredCategories.length + ")"),
                el("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px" } },
                  featuredCategories.map(function(cat, i) {
                    return el("span", {
                      key: i,
                      style: {
                        fontSize: "11px",
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        background: "#09090b",
                        color: "#d4d4d8",
                        border: "1px solid #27272a",
                        fontFamily: "monospace"
                      }
                    }, text(cat, ""));
                  })
                )
              ])
            : null,

          // Section Toggles
          el("div", {
            style: {
              borderTop: "1px solid #27272a",
              paddingTop: "16px",
              marginTop: "20px"
            }
          }, [
            el("h3", {
              style: {
                margin: "0 0 10px",
                fontFamily: "'Oswald', sans-serif",
                fontWeight: "600",
                fontSize: "14px",
                color: "#facc15",
                textTransform: "uppercase",
                letterSpacing: ".08em"
              }
            }, "Page Sections"),
            el("div", {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "8px"
              }
            }, [
              toggleRow("Testimonials", !!data.showTestimonials),
              toggleRow("Partners", !!data.showPartners),
              toggleRow("Certifications", !!data.showCertifications)
            ])
          ])
        ]
      )
    );
  };
})();

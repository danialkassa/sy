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

  // ── Navigation Preview ─────────────────────────────────────

  window.NavigationPreview = function(props) {
    var data = getData(props.entry);
    var categories = Array.isArray(data.categories) ? data.categories : [];
    var mainLinks = Array.isArray(data.mainLinks) ? data.mainLinks : [];

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
        // Simulated Header
        el("div", {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "rgba(24,24,27,0.85)",
            border: "1px solid #27272a",
            borderRadius: "10px",
            marginBottom: "20px",
            backdropFilter: "blur(12px)"
          }
        }, [
          el("div", {
            style: {
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "700",
              fontSize: "18px",
              color: "#facc15"
            }
          }, "NINGBO SIYANG"),
          el("div", { style: { display: "flex", gap: "16px", fontSize: "13px", color: "#d4d4d8" } },
            mainLinks.slice(0, 4).map(function(link) {
              return el("span", { key: text(link.label, "") }, text(link.label, "Link"));
            }).concat(mainLinks.length > 4
              ? [el("span", { style: { color: "#71717a" } }, "+" + (mainLinks.length - 4))]
              : []
            )
          )
        ]),

        // Categories
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
        }, "Product Categories (" + categories.length + ")"),

        categories.length > 0
          ? el("div", {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "8px",
                marginBottom: "20px"
              }
            }, categories.map(function(cat, i) {
              return el("div", {
                key: i,
                style: {
                  background: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  padding: "10px 12px"
                }
              }, [
                el("div", { style: { fontWeight: "600", color: "#ffffff", fontSize: "13px", marginBottom: "2px" } }, text(cat.name, "Category")),
                el("div", { style: { fontSize: "11px", color: "#71717a" } }, text(cat.description, "No description")),
                el("div", { style: { fontSize: "10px", color: "#facc15", marginTop: "4px", fontFamily: "monospace" } }, "/" + text(cat.slug, "—"))
              ]);
            }))
          : el("p", { style: { color: "#71717a", fontSize: "13px", marginBottom: "20px" } }, "No categories configured."),

        // Main Links
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
        }, "Main Navigation Links (" + mainLinks.length + ")"),

        mainLinks.length > 0
          ? el("div", {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }
            }, mainLinks.map(function(link, i) {
              return el("div", {
                key: i,
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "6px",
                  padding: "8px 12px"
                }
              }, [
                el("span", { style: { fontWeight: "500", color: "#e4e4e7", fontSize: "13px" } }, text(link.label, "Link")),
                el("span", { style: { fontSize: "11px", color: "#facc15", fontFamily: "monospace" } }, safeHref(link.href))
              ]);
            }))
          : el("p", { style: { color: "#71717a", fontSize: "13px" } }, "No navigation links configured.")
      ])
    ]);
  };

  // ── Footer Preview ─────────────────────────────────────────

  window.FooterPreview = function(props) {
    var data = getData(props.entry);
    var columns = Array.isArray(data.columns) ? data.columns : [];
    var socialLinks = Array.isArray(data.socialLinks) ? data.socialLinks : [];
    var badges = Array.isArray(data.trustBadges) ? data.trustBadges.map(function(b) {
      return typeof b === 'string' ? b : (b.text || '');
    }).filter(Boolean) : [];

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
        // Copyright
        el("div", {
          style: {
            textAlign: "center",
            padding: "12px",
            background: "#09090b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "13px",
            color: "#a1a1aa"
          }
        }, text(data.copyright, "\u00a9 2025 Ningbo Siyang Power Tools Co., Ltd.")),

        // Badges
        badges.length > 0
          ? el("div", {
              style: {
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "20px"
              }
            }, badges.map(function(badge, i) {
              return el("span", {
                key: i,
                style: {
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  background: "rgba(250,204,21,0.12)",
                  color: "#facc15",
                  border: "1px solid rgba(250,204,21,0.25)"
                }
              }, text(badge, ""));
            }))
          : null,

        // Link Columns
        columns.length > 0
          ? el("div", {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "16px",
                marginBottom: "20px"
              }
            }, columns.map(function(col, i) {
              var links = Array.isArray(col.links) ? col.links : [];
              return el("div", { key: i }, [
                el("h4", {
                  style: {
                    margin: "0 0 8px",
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: "600",
                    fontSize: "13px",
                    color: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: ".06em"
                  }
                }, text(col.title, "Column")),
                el("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                  links.map(function(link, j) {
                    return el("span", {
                      key: j,
                      style: { fontSize: "12px", color: "#a1a1aa" }
                    }, text(link.label, "Link"));
                  })
                )
              ]);
            }))
          : el("p", { style: { color: "#71717a", fontSize: "13px", marginBottom: "20px" } }, "No footer columns configured."),

        // Social Links
        socialLinks.length > 0
          ? el("div", {
              style: {
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                paddingTop: "16px",
                borderTop: "1px solid #27272a"
              }
            }, socialLinks.map(function(link, i) {
              var platform = text(link.platform, "Social");
              var icons = {
                "LinkedIn": "in",
                "YouTube": "▶",
                "Facebook": "f",
                "Twitter": "X",
                "Instagram": "📷",
                "WeChat": "💬"
              };
              return el("span", {
                key: i,
                style: {
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#27272a",
                  fontSize: "14px",
                  color: "#d4d4d8"
                },
                title: platform
              }, icons[platform] || "●");
            }))
          : null
      ])
    ]);
  };
})();

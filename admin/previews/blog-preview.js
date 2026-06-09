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

  window.BlogPreview = function(props) {
    if (window.CMSPreviewStyles) window.CMSPreviewStyles.inject();
    var data = getData(props.entry);
    var draft = !!data.draft;
    var archived = !!data.archived;
    var featured = !!data.featured;
    var tags = Array.isArray(data.tags) ? data.tags : [];

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
        // Cover image
        data.image
          ? el("div", { style: { position: "relative", background: "#09090b" } }, [
              el("img", {
                src: data.image,
                alt: text(data.title, "Blog cover"),
                style: { width: "100%", height: "220px", objectFit: "cover" },
                onerror: "this.style.display='none'"
              }),
              draft || archived || featured
                ? el("div", {
                    style: {
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      alignItems: "flex-end"
                    }
                  }, [
                    draft ? el("span", { className: "cms-preview-badge cms-preview-badge--draft" }, "DRAFT") : null,
                    archived ? el("span", { className: "cms-preview-badge cms-preview-badge--archived" }, "ARCHIVED") : null,
                    featured ? el("span", { className: "cms-preview-badge cms-preview-badge--featured" }, "Featured") : null
                  ])
                : null
            ])
          : null,

        // Content
        el("div", { style: { padding: "20px" } }, [
          // Meta
          el("div", { style: { marginBottom: "10px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" } }, [
            el("span", {
              style: {
                fontSize: "11px",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "9999px",
                background: "rgba(250,204,21,0.12)",
                color: "#facc15"
              }
            }, text(data.category, "General")),
            data.readTime
              ? el("span", { style: { fontSize: "12px", color: "#71717a" } }, text(data.readTime, "") + " min read")
              : null
          ]),

          // Title
          el("h2", {
            style: {
              margin: "0 0 8px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "700",
              fontSize: "26px",
              lineHeight: "1.2",
              color: "#ffffff"
            }
          }, text(data.title, "Post Title")),

          // Slug
          data.slug
            ? el("div", {
                style: {
                  fontSize: "11px",
                  color: "#71717a",
                  fontFamily: "monospace",
                  marginBottom: "8px",
                  letterSpacing: ".02em"
                }
              }, "/blog/" + text(data.slug, ""))
            : null,

          // Author
          el("div", { style: { marginBottom: "12px", fontSize: "13px", color: "#a1a1aa" } }, [
            "By ",
            el("span", { style: { color: "#e4e4e7", fontWeight: "600" } }, text(data.author, "Ningbo Siyang Team")),
            data.authorRole ? el("span", { style: { color: "#71717a" } }, " — " + text(data.authorRole, "")) : null,
            " \u00B7 ",
            el("span", {}, formatDate(data.date))
          ]),

          // Excerpt
          el("p", {
            style: { margin: "0 0 14px", color: "#a1a1aa", fontSize: "14px", lineHeight: "1.6" }
          }, text(data.excerpt, "No excerpt available.")),

          // Tags
          tags.length > 0
            ? el("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" } },
                tags.map(function(tag, i) {
                  return el("span", {
                    key: i,
                    style: {
                      fontSize: "10px",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      background: "#09090b",
                      color: "#a1a1aa",
                      border: "1px solid #27272a"
                    }
                  }, text(tag, ""));
                })
              )
            : null,

          // Body preview
          data.body
            ? el("div", {
                style: {
                  borderTop: "1px solid #27272a",
                  paddingTop: "14px",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#d4d4d8"
                }
              }, [
                el("div", { style: { fontSize: "11px", color: "#71717a", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" } }, "Article Preview"),
                el("div", { style: { maxHeight: "200px", overflow: "hidden", maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" } }, text(data.body, ""))
              ])
            : null
        ])
      ])
    );
  };
})();

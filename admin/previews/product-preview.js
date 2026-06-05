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

  function categoryLabel(slug) {
    var map = {
      "drills-drivers": "Drills & Drivers",
      "saws": "Saws",
      "grinders": "Grinders",
      "sanders": "Sanders",
      "impact-tools": "Impact Tools",
      "combo-kits": "Combo Kits"
    };
    return map[slug] || text(slug, "General");
  }

  function specRow(label, value) {
    if (!value) return null;
    return el("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 10px",
        background: "#09090b",
        borderRadius: "6px",
        fontSize: "12px"
      }
    }, [
      el("span", { style: { color: "#71717a" } }, label),
      el("span", { style: { color: "#e4e4e7", fontWeight: "600", textAlign: "right" } }, text(value, "—"))
    ]);
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

  window.ProductPreview = function(props) {
    var data = getData(props.entry);
    var image = text(data.image, "");
    var featured = !!data.featured;
    var inStock = data.inStock !== false;
    var draft = !!data.draft;
    var specs = data.specs || {};
    var images = Array.isArray(data.images) ? data.images : [];
    var userBenefits = Array.isArray(data.userBenefits) ? data.userBenefits : [];
    var relatedProducts = Array.isArray(data.relatedProducts) ? data.relatedProducts : [];
    var compliance = text(data.compliance, "").split(",").map(function(s) { return s.trim(); }).filter(Boolean);

    // Collect all non-empty specs
    var specList = [];
    var specLabels = {
      voltage: "Voltage", motorType: "Motor Type", maxTorque: "Max Torque",
      noLoadSpeedLow: "No-Load Speed (Low)", noLoadSpeedHigh: "No-Load Speed (High)",
      noLoadSpeed: "No-Load Speed", chuckSize: "Chuck Size", clutchSettings: "Clutch Settings",
      weightToolOnly: "Weight (Tool Only)", weightWithBattery: "Weight (With Battery)",
      overallLength: "Overall Length", soundPower: "Sound Power", vibrationLevel: "Vibration Level",
      batteryPlatform: "Battery Platform", ledWorkLight: "LED Work Light", beltHook: "Belt Hook",
      cordLength: "Cord Length", discBladeDiameter: "Disc/Blade Diameter", arborSize: "Arbor Size",
      maxCuttingDepth: "Max Cutting Depth", padSize: "Pad Size", ipm: "Impacts Per Minute",
      spindleThread: "Spindle Thread", switchType: "Switch Type", auxHandle: "Auxiliary Handle"
    };
    Object.keys(specLabels).forEach(function(key) {
      if (specs[key]) specList.push(specRow(specLabels[key], specs[key]));
    });

    return el("div",
      { className: "cms-preview-root", style: { maxWidth: "520px", margin: "1.5rem auto" } },
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
        // ── Image ─────────────────────────────────────────
        el("div",
          { style: { position: "relative", background: "#09090b", aspectRatio: "1 / 1" } },
          [
            image
              ? el("img", {
                  src: image,
                  alt: text(data.name, "Product image"),
                  style: { width: "100%", height: "100%", objectFit: "cover" },
                  onerror: "this.style.display='none'"
                })
              : el("div", {
                  style: {
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#3f3f46", fontSize: "14px"
                  }
                }, "No image"),

            // Draft badge
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

            // Featured badge
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
          ]
        ),

        // ── Image Gallery ─────────────────────────────────
        images.length > 0
          ? el("div", {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(" + Math.min(images.length, 4) + ", 1fr)",
                gap: "4px",
                padding: "4px",
                background: "#09090b",
                borderTop: "1px solid #27272a"
              }
            }, images.slice(0, 4).map(function(img, i) {
              return el("div", {
                key: i,
                style: { position: "relative", aspectRatio: "1 / 1", overflow: "hidden", borderRadius: "6px" }
              }, el("img", {
                src: typeof img === "string" ? img : (img.img || ""),
                style: { width: "100%", height: "100%", objectFit: "cover" },
                onerror: "this.style.display='none'"
              }));
            }))
          : null,

        // ── Content ───────────────────────────────────────
        el("div", { style: { padding: "14px" } }, [
          // Brand & Category
          el("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" } }, [
            el("span", {
              style: {
                border: "1px solid #facc15",
                borderRadius: "9999px",
                padding: "3px 10px",
                fontSize: "11px",
                color: "#facc15",
                fontWeight: "700"
              }
            }, text(data.brand, "Ningbo Siyang")),
            el("span", {
              style: {
                border: "1px solid #27272a",
                borderRadius: "9999px",
                padding: "3px 10px",
                fontSize: "11px",
                color: "#a1a1aa"
              }
            }, categoryLabel(data.category))
          ]),

          // Name
          el("h3", {
            style: {
              margin: "0 0 6px",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: "600",
              fontSize: "20px",
              lineHeight: "1.2",
              color: "#ffffff"
            }
          }, text(data.name, "Product Name")),

          // SKU
          el("div", { style: { marginBottom: "8px" } }, [
            el("span", {
              style: {
                fontSize: "11px",
                color: "#71717a",
                fontFamily: "monospace",
                letterSpacing: ".04em"
              }
            }, text(data.sku, "NO-SKU"))
          ]),

          // Tagline (or description)
          el("p", {
            style: { margin: "0 0 10px", color: "#a1a1aa", fontSize: "13px", lineHeight: "1.5" }
          }, text(data.tagline || data.description, "No description available.")),

          // User Benefits
          userBenefits.length > 0
            ? el("div", { style: { marginBottom: "10px" } },
                userBenefits.map(function(b, i) {
                  var benefit = typeof b === "string" ? b : (b.benefit || "");
                  if (!benefit) return null;
                  return el("div", {
                    key: i,
                    style: {
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "6px",
                      fontSize: "12px",
                      color: "#d4d4d8",
                      marginBottom: "4px"
                    }
                  }, [
                    el("span", { style: { color: "#facc15", fontWeight: "700", flexShrink: "0" } }, "\u2713"),
                    benefit
                  ]);
                }).filter(Boolean)
              )
            : null,

          // Compliance badges
          compliance.length > 0
            ? el("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" } },
                compliance.map(function(cert, i) {
                  return el("span", {
                    key: i,
                    style: {
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      background: "rgba(74,222,128,0.12)",
                      color: "#4ade80",
                      border: "1px solid rgba(74,222,128,0.25)"
                    }
                  }, cert);
                })
              )
            : null,

          // Trade details grid
          el("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              marginBottom: "10px",
              fontSize: "12px"
            }
          }, [
            el("div", {
              style: { background: "#09090b", border: "1px solid #27272a", borderRadius: "8px", padding: "8px" }
            }, [
              el("div", { style: { color: "#71717a", fontSize: "11px" } }, "MOQ"),
              el("div", { style: { color: "#e4e4e7", fontWeight: "600" } }, text(data.moq, "500 units"))
            ]),
            el("div", {
              style: { background: "#09090b", border: "1px solid #27272a", borderRadius: "8px", padding: "8px" }
            }, [
              el("div", { style: { color: "#71717a", fontSize: "11px" } }, "Lead Time"),
              el("div", { style: { color: "#e4e4e7", fontWeight: "600" } }, text(data.leadTime, "30-45 days"))
            ])
          ]),

          // Warranty
          data.warranty
            ? el("div", {
                style: {
                  background: "rgba(250,204,21,0.08)",
                  border: "1px solid rgba(250,204,21,0.2)",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  marginBottom: "10px",
                  fontSize: "12px",
                  color: "#facc15",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }
              }, ["\u2605 ", text(data.warranty, "")])
            : null,

          // Stock status
          el("div", {
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: inStock ? "#4ade80" : "#ef4444",
              fontWeight: "700"
            }
          }, [
            el("span", { style: { fontSize: "14px" } }, inStock ? "\u2713" : "!"),
            " " + (inStock ? "In Stock" : "Out of Stock")
          ]),

          // Downloads
          data.downloads && (data.downloads.specSheet || data.downloads.manual)
            ? el("div", { style: { marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" } }, [
                data.downloads.specSheet
                  ? el("a", {
                      href: safeHref(data.downloads.specSheet),
                      target: "_blank",
                      rel: "noopener noreferrer",
                      style: {
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        background: "#27272a",
                        color: "#e4e4e7",
                        textDecoration: "none",
                        border: "1px solid #3f3f46"
                      }
                    }, "\u2193 Spec Sheet")
                  : null,
                data.downloads.manual
                  ? el("a", {
                      href: safeHref(data.downloads.manual),
                      target: "_blank",
                      rel: "noopener noreferrer",
                      style: {
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        background: "#27272a",
                        color: "#e4e4e7",
                        textDecoration: "none",
                        border: "1px solid #3f3f46"
                      }
                    }, "\u2193 Manual")
                  : null
              ])
            : null,

          // Related products
          relatedProducts.length > 0
            ? el("div", { style: { marginTop: "10px" } }, [
                el("div", {
                  style: {
                    fontSize: "11px",
                    color: "#71717a",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: "6px"
                  }
                }, "Related Products"),
                el("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px" } },
                  relatedProducts.map(function(sku, i) {
                    return el("span", {
                      key: i,
                      style: {
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: "#09090b",
                        color: "#a1a1aa",
                        border: "1px solid #27272a",
                        fontFamily: "monospace"
                      }
                    }, text(sku, ""));
                  })
                )
              ])
            : null
        ]),

        // ── Specifications ────────────────────────────────
        specList.length > 0
          ? el("div", {
              style: {
                borderTop: "1px solid #27272a",
                padding: "14px",
                background: "#111113"
              }
            }, [
              el("h4", {
                style: {
                  margin: "0 0 10px",
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: "600",
                  fontSize: "13px",
                  color: "#facc15",
                  textTransform: "uppercase",
                  letterSpacing: ".08em"
                }
              }, "Specifications (" + specList.length + ")"),
              el("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } }, specList)
            ])
          : null
      ])
    );
  };
})();

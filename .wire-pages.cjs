var fs = require("fs");
var b = "C:/Users/DanielkassaMuruts/Documents/B2B/html1-suite/public-website/";
var pages = {
  global: { file: "about/global.html", slug: "global" },
  "payment-terms": { file: "about/payment-terms.html", slug: "payment-terms" },
  brochure: { file: "about/brochure.html", slug: "brochure" },
  "about-index": { file: "about/index.html", slug: "about" },
  contact: { file: "contact.html", slug: "contact" },
  privacy: { file: "privacy.html", slug: "privacy" },
  terms: { file: "terms.html", slug: "terms" }
};

Object.keys(pages).forEach(function (key) {
  var pg = pages[key];
  var p = b + pg.file;
  var c = fs.readFileSync(p, "utf8");

  // Add CMS loader script before </body>
  var loader = '\n<script>if(typeof CMSLoader!=="undefined")CMSLoader.loadPageMarkdown("' + pg.slug + '","cms-page-content");</script>\n</body>';
  if (c.includes("cms-page-content")) {
    console.log(pg.file + ": already wired");
    return;
  }
  c = c.replace("</body>", loader);

  // Add id to the main content section's first child
  // The body content is typically in <section> or <div> within <main>
  c = c.replace('<main id="main-content"', '<main id="main-content"');
  // Wrap main children in cms-page-content if not already
  if (!c.includes('id="cms-page-content"')) {
    c = c.replace(/(<main[^>]*>)([\s\S]*?)(<\/main>)/, function (m, open, body, close) {
      return open + '<div id="cms-page-content" class="min-h-screen bg-zinc-950" style="min-height:auto">' + body + '</div>' + close;
    });
  }

  fs.writeFileSync(p, c, "utf8");
  console.log(pg.file + ": wired");
});

console.log("Done");

var fs = require("fs");
var b = "C:/Users/DanielkassaMuruts/Documents/B2B/html1-suite/public-website/";

// 1. CREATE CMS MARKDOWN FILES
var pages = {
  "global": { title: "Global Presence", fields: "title, body" },
  "payment-terms": { title: "Payment & Trade Terms", fields: "title, body" },
  "brochure": { title: "Company Brochure", fields: "title, body" },
  "about": { title: "About Ningbo Siyang", fields: "title, body" },
  "contact": { title: "Contact Us", fields: "title, body" },
  "privacy": { title: "Privacy Policy", fields: "title, body" },
  "terms": { title: "Terms of Service", fields: "title, body" }
};

Object.keys(pages).forEach(function (slug) {
  var p = b + "content/pages/" + slug + ".md";
  if (fs.existsSync(p)) { console.log(slug + ": exists, skipping"); return; }
  var content = "---\ntitle: \"" + pages[slug].title + "\"\n---\n\n" + pages[slug].title + " content. Edit this page from the CMS admin panel.";
  fs.writeFileSync(p, content, "utf8");
  console.log(slug + ": created");
});

// 2. UPDATE CONFIG.YML — add new page entries
var config = fs.readFileSync(b + "admin/config.yml", "utf8");
var newPages = "";
Object.keys(pages).forEach(function (slug) {
  var label = pages[slug].title;
  newPages += "\n      - label: \"" + label + "\"\n        name: \"" + slug + "\"\n        file: \"content/pages/" + slug + ".md\"\n        fields:\n          - {label: \"Page Title\", name: \"title\", widget: \"string\"}\n          - {label: \"Content\", name: \"body\", widget: \"markdown\"}\n";
});

var idx = config.lastIndexOf("      - label: \"OEM/ODM Capabilities\"");
if (idx >= 0) {
  var endOfOem = config.indexOf("\n", config.indexOf("fields:", idx) + 8);
  // Find the end of oem-odm block
  var nextTopLevel = config.indexOf("\n  - name:", idx + 100);
  if (nextTopLevel < 0) nextTopLevel = config.length;
  config = config.substring(0, nextTopLevel) + newPages + config.substring(nextTopLevel);
  fs.writeFileSync(b + "admin/config.yml", config, "utf8");
  console.log("config.yml: 7 new pages added");
} else {
  console.log("config.yml: COULD NOT FIND INSERTION POINT");
}

console.log("Done");

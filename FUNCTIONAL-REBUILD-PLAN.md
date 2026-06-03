# FUNCTIONAL REBUILD PLAN — Ningbo Siyang B2B Platform
# Zero vagueness. Line by line. No skipping. No minimal effort.

═══════════════════════════════════════════════════════════════════
 CURRENT STATE: 6/14 features work = 43% functional
 TARGET STATE:  14/14 features work = 100% functional
═══════════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════════
 SECTION A: CONTACT PAGE — "GET IN TOUCH" IS DECORATION
═══════════════════════════════════════════════════════════════════

PROBLEM: contact.html has 4 contact cards (Call, Email, Visit, Hours)
that look functional but the form submits to nowhere, the phone number
is fake (8888 8888), and the subscribe form goes to #subscribe.

ASSIGNED AI: DeepSeek V4 Pro (analytical, systematic)

───────────────────────────────────────────────────────────────────
A1. FIX CONTACT FORM SUBMISSION
───────────────────────────────────────────────────────────────────
FILE: contact.html
CURRENT: <form action="/contact" method="post">
PROBLEM: No backend exists. Form does nothing on submit.
FIX:
  1. Remove action="/contact" and method="post"
  2. Add id="contact-form" to the form element
  3. Add onsubmit="return handleContactSubmit(event)" to the form
  4. Add JavaScript function handleContactSubmit(e) that:
     a. e.preventDefault()
     b. Collects: name, email, subject, message from form fields
     c. Builds mailto: URL with subject and body
     d. Opens mailto: link using window.location.href
     e. Shows success message: "Your email client will open with a pre-filled message to our sales team."
     f. If mailto: fails (rare), shows fallback: "Please email us directly at sales@ningbosiyang.com"
  5. The mailto: recipient should be a configurable variable at top of script:
     var CONTACT_EMAIL = 'sales@ningbosiyang.com';
  6. Form validation: check name not empty, email has @, message not empty
  7. Show inline error messages below each invalid field
  8. Disable submit button during send, re-enable after
VERIFICATION: Fill form → click Send → email client opens with pre-filled message

───────────────────────────────────────────────────────────────────
A2. FIX "CALL US" CARD
───────────────────────────────────────────────────────────────────
FILE: contact.html
CURRENT: <a href="tel:+8657488888888">
PROBLEM: Phone number is fake (8888 8888)
FIX:
  1. The href="tel:..." link structure is CORRECT — keep it
  2. Change the displayed phone number to use a data attribute:
     data-phone="+86-574-XXXX-XXXX" (owner replaces later)
  3. The link text should read the data attribute
  4. Add a note in the CMS config.yml so the owner can update this
VERIFICATION: Click phone number → phone dialer opens on mobile

───────────────────────────────────────────────────────────────────
A3. FIX "EMAIL US" CARD
───────────────────────────────────────────────────────────────────
FILE: contact.html
CURRENT: <a href="mailto:support@ningbosiyang.com">
PROBLEM: Email may not exist
FIX:
  1. Keep the mailto: link structure — it's correct
  2. Change to configurable variable: CONTACT_EMAIL
  3. The card should also show the email as visible text
VERIFICATION: Click email → email client opens with To: field filled

───────────────────────────────────────────────────────────────────
A4. FIX "VISIT US" CARD
───────────────────────────────────────────────────────────────────
FILE: contact.html
CURRENT: Shows "Ningbo Industrial Zone, Zhejiang 315000, China"
PROBLEM: Generic address, no map, no directions
FIX:
  1. Keep the address text (owner will update via CMS)
  2. Add a "Get Directions" link that opens Google Maps:
     href="https://www.google.com/maps/search/Ningbo+Siyang+Power+Tools+Ningbo+China"
     target="_blank" rel="noopener noreferrer"
  3. Add a static map image placeholder (owner replaces with real map screenshot)
VERIFICATION: Click "Get Directions" → Google Maps opens

───────────────────────────────────────────────────────────────────
A5. FIX "BUSINESS HOURS" CARD
───────────────────────────────────────────────────────────────────
FILE: contact.html
CURRENT: Shows "Mon-Fri: 8:00 AM - 5:00 PM (CST)"
PROBLEM: No timezone context, no holiday info
FIX:
  1. Add "(China Standard Time, UTC+8)" after the hours
  2. Add a line: "Closed on Chinese public holidays"
  3. Add a "Schedule a Call" link that opens a mailto: with subject "Call Schedule Request"
VERIFICATION: Hours display correctly, "Schedule a Call" opens email client

───────────────────────────────────────────────────────────────────
A6. FIX NEWSLETTER SUBSCRIBE
───────────────────────────────────────────────────────────────────
FILE: contact.html (and index.html footer)
CURRENT: <form action="#subscribe"> or no action
PROBLEM: Goes nowhere
FIX:
  1. Remove the <form> wrapper entirely
  2. Replace with a simple layout:
     - Input field for email (type="email")
     - Button that says "Subscribe"
     - On click: build mailto: with subject "Newsletter Subscription"
       and body "Please add {email} to the Ningbo Siyang newsletter."
     - Show message: "Your subscription request has been sent!"
  3. Alternative: If owner has Mailchimp/external service, add their form action URL
VERIFICATION: Enter email → click Subscribe → email client opens

───────────────────────────────────────────────────────────────────
A7. FIX SOCIAL MEDIA LINKS
───────────────────────────────────────────────────────────────────
FILE: All HTML files (footer section)
CURRENT: facebook.com/ningbosiyang, twitter.com/ningbosiyang, linkedin.com/company/ningbosiyang
PROBLEM: These are fake URLs — the company likely doesn't have these accounts
FIX:
  1. Check if the company has real social media accounts
  2. If YES: update the hrefs to real URLs
  3. If NO: remove the social media icons entirely from the footer
     (having broken social links is WORSE than having none)
  4. Add WeChat and WhatsApp icons instead (standard for Chinese B2B)
     - WeChat: Show QR code image on hover/click (owner provides QR)
     - WhatsApp: href="https://wa.me/8657488888888" (owner updates number)
VERIFICATION: Every social link either works or doesn't exist

═══════════════════════════════════════════════════════════════════
 SECTION B: QUOTE CART — SUBMISSION IS INCOMPLETE
═══════════════════════════════════════════════════════════════════

PROBLEM: Quote cart can add/remove items (works), but the "Send Quote
Request" button uses mailto: which may not compose properly on all
devices, and the confirmation message says "Sent!" even though it
just opened an email client.

ASSIGNED AI: KIMI 2.6 (engineering, JS-heavy)

───────────────────────────────────────────────────────────────────
B1. FIX QUOTE CART SUBMISSION FLOW
───────────────────────────────────────────────────────────────────
FILE: assets/js/quote-cart.js
CURRENT: buildMailtoUrl() creates mailto:support@ningbosiyang.com?subject=...&body=...
PROBLEM:
  1. mailto: may not work on all devices (Chrome on Windows often fails)
  2. The confirmation says "Quote Request Sent!" but it only opened email client
  3. No way to send without email client
FIX:
  1. Change the "Send Quote Request" button to show TWO options:
     Option A: "Open in Email Client" → current mailto: behavior
     Option B: "Copy to Clipboard" → copies the quote text to clipboard
  2. Change the confirmation message to be honest:
     "Your quote request has been prepared. Please send the email that
      was opened in your email client, or paste the copied text into an
      email to sales@ningbosiyang.com"
  3. Add a "Copy Quote Details" button that:
     a. Builds the same text as buildEmailBody()
     b. Uses navigator.clipboard.writeText()
     c. Shows "Copied!" feedback
  4. Add fallback: if mailto: fails (detected by timeout), auto-show
     the clipboard option
VERIFICATION: Click Send → email client opens OR clipboard copy works

───────────────────────────────────────────────────────────────────
B2. ADD QUOTE CART ITEM QUANTITY EDITING
───────────────────────────────────────────────────────────────────
FILE: assets/js/quote-cart.js
CURRENT: Items can be added and removed, but quantity can only be +1/-1
PROBLEM: No way to set quantity to 50 or 100 (B2B needs bulk quantities)
FIX:
  1. Replace the +/- buttons with an editable number input
  2. Min value: 1, max value: 10000
  3. On change: update the cart in localStorage
  4. Re-render the drawer content
VERIFICATION: Open cart → change quantity to 100 → quantity updates

───────────────────────────────────────────────────────────────────
B3. ADD QUOTE CART "NOTES" FIELD
───────────────────────────────────────────────────────────────────
FILE: assets/js/quote-cart.js
CURRENT: No way to add notes to the quote request
PROBLEM: B2B buyers need to specify requirements (custom branding, packaging, etc.)
FIX:
  1. Add a textarea in the quote drawer before the Send button
  2. Label: "Additional Requirements (MOQ, custom branding, packaging, etc.)"
  3. Include the notes text in the email body and clipboard copy
VERIFICATION: Add note → send quote → note appears in email body

═══════════════════════════════════════════════════════════════════
 SECTION C: PRODUCT PAGES — NO DETAIL PAGES EXIST
═══════════════════════════════════════════════════════════════════

PROBLEM: Every product card links to "./index.html" (back to itself).
There are no individual product detail pages. A B2B buyer cannot
see full specifications, download spec sheets, or request a quote
for a specific product.

ASSIGNED AI: Copilot/GPT 5.2 (visual, UX, component design)

───────────────────────────────────────────────────────────────────
C1. CREATE PRODUCT DETAIL PAGE TEMPLATE
───────────────────────────────────────────────────────────────────
FILE: products/product.html (NEW FILE)
PURPOSE: A single template that loads product data from CMS markdown
STRUCTURE:
  1. Hero section: Product name, brand, category breadcrumb
  2. Image gallery: Main image + thumbnails (click to switch)
  3. Specifications table: Key specs in a clean table
  4. Description: Full product description
  5. "Add to Quote" button: Pre-fills quote cart with this product
  6. "Download Spec Sheet" link: Opens PDF (if available)
  7. Related products: 3 cards from same category
  8. CTA section: "Need bulk pricing? Request a quote"
DATA SOURCE:
  - URL parameter: product.html?sku=SY-DD2001
  - JavaScript reads the SKU from URL
  - Loads product data from content/products/{sku}.json
  - If JSON doesn't exist, shows "Product not found" message
VERIFICATION: Navigate to product.html?sku=SY-DD2001 → product details appear

───────────────────────────────────────────────────────────────────
C2. UPDATE PRODUCT CARD LINKS
───────────────────────────────────────────────────────────────────
FILES: products/index.html, products/drills-drivers.html, products/grinders.html,
       products/sanders.html, products/saws.html, products/combo-kits.html,
       products/impact-tools.html, index.html
CURRENT: All product card <a href="./index.html"> links
FIX:
  1. Change each product card's detail link from "./index.html"
     to "./product.html?sku={SKU}" using the data-quote-sku value
  2. The "View details" eye icon should also link to product.html?sku={SKU}
  3. Example: data-quote-sku="dd-1" → href="./product.html?sku=dd-1"
VERIFICATION: Click product card → opens product detail page with correct SKU

───────────────────────────────────────────────────────────────────
C3. CREATE PRODUCT JSON DATA FILES
───────────────────────────────────────────────────────────────────
FILES: content/products/dd-1.json, dd-2.json, etc. (NEW FILES)
PURPOSE: Each product gets a JSON file with full spec data
STRUCTURE per file:
  {
    "sku": "dd-1",
    "name": "20V MAX Brushless Drill/Driver",
    "brand": "Ningbo Siyang Pro",
    "category": "drills-drivers",
    "description": "Full product description...",
    "specs": {
      "Voltage": "20V",
      "Motor": "Brushless",
      "Torque": "530 in-lbs",
      "Speeds": "2-speed",
      "Chuck": "1/2\" metal",
      "Weight": "3.5 lbs"
    },
    "images": ["../images/istock/10001.jpg"],
    "inStock": true,
    "moq": "500 units",
    "leadTime": "30-45 days"
  }
GENERATION: Use the existing generate-index.js script pattern
VERIFICATION: Fetch content/products/dd-1.json → returns valid JSON

═══════════════════════════════════════════════════════════════════
 SECTION D: BLOG — ALL POSTS LINK TO SAME PAGE
═══════════════════════════════════════════════════════════════════

PROBLEM: blogs/index.html has 3 blog cards that all link to post.html
with no way to differentiate which post to show. post.html has no
mechanism to load different content.

ASSIGNED AI: Qwen 3.6 Plus (systematic, CMS-focused)

───────────────────────────────────────────────────────────────────
D1. FIX BLOG POST LINKS
───────────────────────────────────────────────────────────────────
FILE: blogs/index.html
CURRENT: All blog cards link to post.html
FIX:
  1. Each blog card should link to post.html?slug={slug}
  2. The slug comes from the blog's frontmatter (already exists in content/blog/*.md)
  3. Example: href="./post.html?slug=choosing-right-power-tools"
VERIFICATION: Click blog card → URL has ?slug= parameter

───────────────────────────────────────────────────────────────────
D2. MAKE post.html LOAD DYNAMIC CONTENT
───────────────────────────────────────────────────────────────────
FILE: blogs/post.html
CURRENT: Static HTML with one hardcoded blog post
FIX:
  1. Add JavaScript at the bottom of post.html that:
     a. Reads the ?slug= parameter from URL
     b. Fetches content/blog/{slug}.md via fetch()
     c. Parses the frontmatter (--- delimited)
     d. Renders the markdown to HTML
     e. Populates: title, date, author, category, featured image, body
     f. If slug not found, shows "Post not found" message
  2. Use the existing cms-loader.js for markdown parsing
  3. Add proper meta tags: <title>, og:title, og:description from frontmatter
VERIFICATION: Navigate to post.html?slug=choosing-right-power-tools → correct post appears

═══════════════════════════════════════════════════════════════════
 SECTION E: CHAT WIDGET — DECORATION, NOT FUNCTIONAL
═══════════════════════════════════════════════════════════════════

PROBLEM: A chat bubble sits in the bottom-right corner with a red
"1" notification badge, but clicking it does nothing. This is
deceptive — it implies live chat exists.

ASSIGNED AI: GLM 5.1 (strategic, honest UX)

───────────────────────────────────────────────────────────────────
E1. REPLACE FAKE CHAT WITH REAL MESSAGING LINKS
───────────────────────────────────────────────────────────────────
FILES: All HTML files (the chat widget is in every page's footer area)
CURRENT: A button with aria-label="Open chat support" that does nothing
FIX:
  1. Remove the fake chat button entirely
  2. Replace with a floating action button (FAB) that expands on click to show:
     - "WhatsApp" link → https://wa.me/8657488888888 (owner updates number)
     - "Email Us" link → mailto:sales@ningbosiyang.com
     - "WeChat" → Shows QR code image on click
  3. Remove the red "1" notification badge (deceptive)
  4. The FAB should use the same yellow-400 styling as current site
  5. On mobile: FAB shows at bottom-right, 56px from edges
  6. On desktop: Same position
VERIFICATION: Click FAB → WhatsApp/Email/WeChat options appear

═══════════════════════════════════════════════════════════════════
 SECTION F: NAVIGATION — DUPLICATE LINKS
═══════════════════════════════════════════════════════════════════

PROBLEM: The navigation has multiple links all pointing to contact.html:
- "Contact Us" (desktop nav)
- "Get a Quote" (desktop nav, was "Customer Portal")
- "Contact" (mobile nav)
- "Get a Quote" (mobile nav)
- "Support" (top bar)

ASSIGNED AI: DeepSeek V4 Pro (information architecture)

───────────────────────────────────────────────────────────────────
F1. RESTRUCTURE NAVIGATION — ELIMINATE DUPLICATES
───────────────────────────────────────────────────────────────────
FILES: All 20 HTML files
CURRENT NAV STRUCTURE (desktop):
  Top bar: Support | (+86 574 8888 8888)
  Main nav: Home | Products ▼ | About ▼ | Contact Us | Get a Quote
PROPOSED NAV STRUCTURE (desktop):
  Top bar: +86 574 XXXX XXXX | sales@ningbosiyang.com
  Main nav: Home | Products ▼ | About ▼ | Contact | Request Quote
CHANGES:
  1. Top bar: Remove "Support" link (redundant with Contact page)
  2. Top bar: Show phone number AND email side by side
  3. Main nav: "Contact Us" → "Contact" (shorter, cleaner)
  4. Main nav: "Get a Quote" → "Request Quote" (more professional B2B language)
  5. "Request Quote" should link to contact.html#quote-form
     (scrolls directly to the quote request section on the contact page)
  6. Mobile nav: Same labels, same links
VERIFICATION: Nav has exactly 2 unique links to contact.html (Contact + Request Quote)

───────────────────────────────────────────────────────────────────
F2. ADD ANCHOR SECTIONS TO CONTACT PAGE
───────────────────────────────────────────────────────────────────
FILE: contact.html
CURRENT: Single long page with no anchor points
FIX:
  1. Add id="contact-info" to the contact cards section
  2. Add id="quote-form" to the quote request form section
  3. Add id="office-location" to the map/directions section
  4. "Contact" nav link → contact.html (default view, scrolls to top)
  5. "Request Quote" nav link → contact.html#quote-form (scrolls to form)
VERIFICATION: Click "Request Quote" → page loads and scrolls to form

═══════════════════════════════════════════════════════════════════
 SECTION G: VIDEO MODAL — EXISTS BUT NOT CONNECTED
═══════════════════════════════════════════════════════════════════

PROBLEM: main.js has openVideo/closeVideo functions but no HTML
element triggers them. The hero section has a video that fails to
load (coverr.co CORS block).

ASSIGNED AI: KIMI 2.6 (engineering)

───────────────────────────────────────────────────────────────────
G1. FIX HERO VIDEO OR REMOVE IT
───────────────────────────────────────────────────────────────────
FILE: index.html
CURRENT: <video src="https://cdn.coverr.co/videos/.../1080p.mp4"> — blocked by CORS
FIX (choose one):
  Option A (if owner has product video):
    1. Replace the coverr.co URL with a local video file
    2. Place video in assets/videos/ directory
    3. Update <source> to point to local file
  Option B (if no video available — RECOMMENDED):
    1. Remove the <video> element entirely
    2. Replace with a static hero background image
    3. The hero text overlay stays the same
VERIFICATION: Homepage loads without CORS error

═══════════════════════════════════════════════════════════════════
 SECTION H: CMS — NOT END-TO-END TESTED
═══════════════════════════════════════════════════════════════════

PROBLEM: Decap CMS is configured (config.yml, admin/index.html) but
has never been tested with the Gitea backend. The owners need to
be able to add/edit products, blog posts, and company info.

ASSIGNED AI: Qwen 3.6 Plus (systematic, CMS expert)

───────────────────────────────────────────────────────────────────
H1. VERIFY CMS ADMIN ACCESS
───────────────────────────────────────────────────────────────────
FILE: admin/index.html, admin/config.yml
STEPS:
  1. Deploy the site to DigitalOcean (Nginx serving static files)
  2. Navigate to http://165.22.250.66/admin/
  3. Click "Login with Gitea"
  4. Verify OAuth redirect works
  5. Verify the CMS dashboard loads
  6. If it fails: debug the OAuth callback URL in Gitea settings
VERIFICATION: Admin panel loads and shows collections

───────────────────────────────────────────────────────────────────
H2. TEST CMS CONTENT EDITING
───────────────────────────────────────────────────────────────────
STEPS:
  1. In CMS dashboard, click "Products" collection
  2. Click an existing product
  3. Change the product name
  4. Click "Save" → verify the markdown file updates in Gitea
  5. Click "Blog" collection
  6. Click "New Post"
  7. Fill in title, date, body
  8. Click "Save" → verify new .md file appears in content/blog/
VERIFICATION: Content changes persist in Gitea repository

───────────────────────────────────────────────────────────────────
H3. ADD MISSING CMS COLLECTIONS
───────────────────────────────────────────────────────────────────
FILE: admin/config.yml
CURRENT COLLECTIONS: blog, products, pages, settings
MISSING COLLECTIONS:
  1. testimonials — Customer quotes/testimonials
  2. team_members — Team member name, title, photo, bio
  3. certifications — Cert name, issuer, cert number, image
  4. faq — Question and answer pairs
  5. partners — Partner logo, name, website URL
ADD for each:
  - name, label, folder, create: true, slug template
  - fields with proper widgets (string, text, image, markdown, etc.)
VERIFICATION: Each new collection appears in CMS dashboard

═══════════════════════════════════════════════════════════════════
 SECTION I: B2B-SPECIFIC FEATURES — COMPLETELY MISSING
═══════════════════════════════════════════════════════════════════

PROBLEM: This is supposed to be a B2B manufacturing platform, but
it has zero B2B-specific functionality. No OEM/ODM section, no
MOQ info, no lead times, no trade show schedule, no quality
assurance documentation.

ASSIGNED AI: Copilot/GPT 5.2 (visual, UX, business logic)

───────────────────────────────────────────────────────────────────
I1. ADD OEM/ODM CAPABILITIES PAGE
───────────────────────────────────────────────────────────────────
FILE: about/oem-odm.html (NEW FILE)
PURPOSE: Show manufacturing capabilities for OEM/ODM buyers
SECTIONS:
  1. Hero: "Your Brand, Our Manufacturing Excellence"
  2. OEM Services: Custom labeling, packaging, specifications
  3. ODM Services: Product design, prototyping, testing
  4. Manufacturing Process: 5-step visual (Design → Prototype → Sample → Production → QC → Shipping)
  5. MOQ & Lead Times: Table with typical MOQ and lead times per product category
  6. Quality Assurance: Certifications, testing lab photos
  7. CTA: "Discuss Your Project" → contact.html#quote-form
NAV: Add "OEM/ODM" link to About dropdown menu
VERIFICATION: Navigate to about/oem-odm.html → page loads with all sections

───────────────────────────────────────────────────────────────────
I2. ADD MOQ & LEAD TIME INFO TO PRODUCT CARDS
───────────────────────────────────────────────────────────────────
FILES: products/index.html, all category pages
CURRENT: Product cards show: name, description, rating, "In Stock"
FIX: Add two lines below "In Stock":
  1. "MOQ: 500 units" (minimum order quantity)
  2. "Lead Time: 30-45 days"
  3. These should be data attributes on the product card div:
     data-moq="500" data-lead-time="30-45 days"
  4. JavaScript reads these and displays them
VERIFICATION: Product cards show MOQ and lead time

───────────────────────────────────────────────────────────────────
I3. ADD "DOWNLOAD CATALOG" FUNCTIONALITY
───────────────────────────────────────────────────────────────────
FILE: about/brochure.html
CURRENT: Page exists but likely has no real download
FIX:
  1. Add a download button that links to a PDF file
  2. PDF path: /assets/downloads/product-catalog.pdf
  3. If PDF doesn't exist yet, show "Catalog coming soon" message
  4. Add download attribute to the link: <a href="/assets/downloads/product-catalog.pdf" download>
VERIFICATION: Click download → PDF file downloads (or "coming soon" shows)

═══════════════════════════════════════════════════════════════════
 SECTION J: CONFIGURATION — HARD-CODED VALUES
═══════════════════════════════════════════════════════════════════

PROBLEM: Phone numbers, emails, addresses are hard-coded in 20+ HTML
files. When the owner updates their phone number, they'd have to
edit 20 files. This is unmanageable.

ASSIGNED AI: Qwen 3.6 Plus (systematic, infrastructure)

───────────────────────────────────────────────────────────────────
J1. CREATE SITE CONFIGURATION FILE
───────────────────────────────────────────────────────────────────
FILE: assets/js/site-config.js (NEW FILE)
PURPOSE: Single source of truth for all site-wide data
CONTENTS:
  var SITE_CONFIG = {
    companyName: 'Ningbo Siyang',
    phone: '+86-574-XXXX-XXXX',
    phoneDisplay: '+86 574 XXXX XXXX',
    email: 'sales@ningbosiyang.com',
    address: 'Ningbo Industrial Zone, Zhejiang 315000, China',
    whatsapp: '+8657488888888',
    wechatQR: '/assets/images/wechat-qr.png',
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      wechat: '/assets/images/wechat-qr.png'
    },
    businessHours: 'Mon-Fri: 8:00 AM - 5:00 PM (CST, UTC+8)',
    moq: {
      default: '500 units',
      drills: '300 units',
      grinders: '200 units'
    },
    leadTime: {
      default: '30-45 days',
      custom: '60-90 days'
    }
  };
LOAD: Add <script src="./assets/js/site-config.js"></script> to ALL pages
      BEFORE other scripts
USAGE: Replace all hard-coded phone/email/address references with
       SITE_CONFIG.phone, SITE_CONFIG.email, etc.
VERIFICATION: Change phone in site-config.js → all pages show new phone

───────────────────────────────────────────────────────────────────
J2. UPDATE ALL PAGES TO USE SITE_CONFIG
───────────────────────────────────────────────────────────────────
FILES: All 20 HTML files
CHANGES:
  1. Add <script src="[path]site-config.js"></script> to every page
  2. In contact.html: Replace hard-coded phone with <span data-site-phone></span>
  3. In all footers: Replace hard-coded phone/email with data attributes
  4. Add a small script at the end of main.js that:
     a. document.querySelectorAll('[data-site-phone]').forEach(el => {
          el.textContent = SITE_CONFIG.phoneDisplay;
          if (el.tagName === 'A') el.href = 'tel:' + SITE_CONFIG.phone;
        });
     b. Same for data-site-email, data-site-address, data-site-hours
VERIFICATION: Change config value → all pages reflect the change

═══════════════════════════════════════════════════════════════════
 EXECUTION ORDER
═══════════════════════════════════════════════════════════════════

PHASE 1 (Foundation — must be done first):
  J1 → J2 → F1 → F2
  (Config system + Navigation fix — everything else depends on these)

PHASE 2 (Core Functionality):
  A1 → A2 → A3 → A4 → A5 → A6 → A7
  (Contact page — make every element functional)

PHASE 3 (Quote System):
  B1 → B2 → B3
  (Quote cart — make submission actually work)

PHASE 4 (Product System):
  C1 → C2 → C3 → I2
  (Product detail pages + MOQ info)

PHASE 5 (Blog System):
  D1 → D2
  (Blog post routing and dynamic loading)

PHASE 6 (B2B Features):
  I1 → I3
  (OEM/ODM page + Catalog download)

PHASE 7 (Cleanup):
  E1 → G1
  (Replace fake chat + Fix/remove broken video)

PHASE 8 (CMS):
  H1 → H2 → H3
  (CMS testing + missing collections)

═══════════════════════════════════════════════════════════════════
 AI ASSIGNMENTS
═══════════════════════════════════════════════════════════════════

DeepSeek V4 Pro:    A1-A7 (Contact page), F1-F2 (Navigation)
KIMI 2.6:          B1-B3 (Quote cart), G1 (Video)
Copilot/GPT 5.2:   C1-C3 (Product pages), I1-I3 (B2B features)
Qwen 3.6 Plus:     D1-D2 (Blog), H1-H3 (CMS), J1-J2 (Config)
GLM 5.1:           E1 (Chat → messaging), Overall coordination

═══════════════════════════════════════════════════════════════════
 NON-NEGOTIABLE RULES
═══════════════════════════════════════════════════════════════════

1. NO SKIP — Every sub-task must be completed before moving on
2. NO MINIMAL — Each fix must be fully implemented, not stubbed
3. NO VAGUE — Every change must specify exact file, line, and code
4. VERIFY BEFORE COMPLETE — Test each feature before marking done
5. NO PLACEHOLDER — If a feature can't work without real data,
   build the mechanism and use configurable defaults
6. NO DECORATION — If something looks functional but isn't, either
   make it functional or remove it entirely
7. ONE OWNER PER ELEMENT — Each interactive element must have
   exactly one JS handler, no duplicates
8. CONFIG OVER HARDCODE — All business data must come from
   site-config.js, not be embedded in HTML
9. HONEST UX — Never show a button/link/icon that implies
   functionality that doesn't exist
10. TEST ON MOBILE — Every feature must work on mobile viewport

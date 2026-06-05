(function() {
  'use strict';
  var _t = function(key, fallback) {
    if (typeof i18n !== 'undefined' && i18n.t) { var val = i18n.t(key); return val && val !== key ? val : fallback; }
    return fallback;
  };


  var RECOMMENDATIONS = {
    "drilling-cordless-wood": { skus: ["SY-DD-20V-BL", "SY-DD-RHT-18V", "SY-DD-MIX-KIT"], reason: "High-speed cordless drills with multiple clutch settings for precise wood drilling. Our 20V brushless models deliver up to 57% more runtime." },
    "drilling-cordless-metal": { skus: ["SY-DD-20V-BL", "SY-DD-RH-DEM", "SY-DD-RHT-18V"], reason: "Brushless motor delivers consistent torque for metal drilling applications. Variable speed control prevents bit walking on hard surfaces." },
    "drilling-cordless-concrete": { skus: ["SY-DD-SDS-PLU", "SY-DD-RH-1IN", "SY-DD-RH-DEM"], reason: "SDS-Plus rotary hammers with active vibration control designed for concrete and masonry. Pneumatic hammer mechanism ensures fast penetration." },
    "drilling-cordless-general": { skus: ["SY-DD-20V-BL", "SY-DD-MIX-KIT", "SY-DD-CRD-HMR"], reason: "Versatile drill/drivers suitable for most common tasks. Two-speed gearboxes handle both high-speed drilling and high-torque driving." },
    "drilling-corded-wood": { skus: ["SY-DD-CRD-HMR", "SY-DD-RH-DEM2"], reason: "Corded drills offer unlimited runtime with consistent power. Ideal for workshop environments where outlets are readily available." },
    "drilling-corded-metal": { skus: ["SY-DD-CRD-HMR", "SY-DD-RH-DEM", "SY-DD-RH-DEM2"], reason: "Heavy-duty corded rotary hammers provide the torque and endurance needed for metal fabrication and structural work." },
    "drilling-corded-concrete": { skus: ["SY-DD-SDS-PLU", "SY-DD-RH-1IN", "SY-DD-RH-DEM"], reason: "Corded SDS-Plus hammers with high impact energy ratings. Ideal for heavy concrete drilling, anchor setting, and demolition tasks." },
    "drilling-corded-general": { skus: ["SY-DD-CRD-HMR", "SY-DD-MIX-KIT"], reason: "All-purpose corded hammer drills with auxiliary handles for improved control and reduced fatigue." },
    "drilling-nopref-wood": { skus: ["SY-DD-20V-BL", "SY-DD-RHT-18V", "SY-DD-MIX-KIT"], reason: "Best-in-class wood drilling tools. Choose between cordless freedom and corded power based on your workspace." },
    "drilling-nopref-metal": { skus: ["SY-DD-20V-BL", "SY-DD-RH-DEM", "SY-DD-CRD-HMR"], reason: "Balanced selection of brushless cordless and robust corded drills for metalworking applications." },
    "drilling-nopref-concrete": { skus: ["SY-DD-SDS-PLU", "SY-DD-RH-1IN", "SY-DD-RH-DEM"], reason: "Our top rotary hammer lineup. From 1-inch SDS-Plus to 1-9/16-inch demolition work, these tools handle any concrete task." },
    "drilling-nopref-general": { skus: ["SY-DD-20V-BL", "SY-DD-MIX-KIT", "SY-DD-CRD-HMR"], reason: "General-purpose drilling tools combining portability, power, and value." },
    "cutting-cordless-wood": { skus: ["SY-SW-CIR-714", "SY-SW-JIG-VAR", "SY-SW-MIT-10IN"], reason: "Cordless circular saws and jigsaws for clean, accurate wood cuts on the jobsite. Laser guides and LED lights improve accuracy." },
    "cutting-cordless-metal": { skus: ["SY-SW-CIR-714", "SY-SW-BAND-9IN", "SY-SW-REC-12A"], reason: "Cordless circular and band saws with abrasive cutting capacity. Lightweight design for overhead and tight-space metal cutting." },
    "cutting-cordless-tile": { skus: ["SY-SW-JIG-VAR", "SY-SW-OSC-MUL", "SY-SW-CIR-6.5"], reason: "Oscillating multi-tool and jigsaw with specialized blades for clean tile and ceramic cutting without chipping." },
    "cutting-cordless-multi": { skus: ["SY-SW-OSC-MUL", "SY-SW-REC-12A", "SY-SW-JIG-VAR"], reason: "Multi-material cutting solution: oscillating tool for plunge cuts, jigsaw for curves, reciprocating saw for demolition." },
    "cutting-corded-wood": { skus: ["SY-SW-CIR-714", "SY-SW-TAB-10IN", "SY-SW-MIT-10IN"], reason: "Table saws and miter saws for precise wood cutting in workshop settings. Powerful motors handle hardwood and sheet goods." },
    "cutting-corded-metal": { skus: ["SY-SW-REC-12A", "SY-SW-BAND-9IN", "SY-SW-CIR-6.5"], reason: "Reciprocating saws and portable band saws deliver aggressive metal cutting with unlimited runtime from corded power." },
    "cutting-corded-tile": { skus: ["SY-SW-JIG-VAR", "SY-SW-MIT-10IN", "SY-SW-OSC-MUL"], reason: "Corded jigsaw with variable speed and specialized tile blades. Miter saw handles precise angle cuts in tile and stone." },
    "cutting-corded-multi": { skus: ["SY-SW-REC-12A", "SY-SW-TAB-10IN", "SY-SW-CIR-714"], reason: "Workshop multi-material setup: table saw for sheet goods, circular for framing, reciprocating for demolition and pruning." },
    "cutting-nopref-wood": { skus: ["SY-SW-CIR-714", "SY-SW-JIG-VAR", "SY-SW-MIT-10IN"], reason: "Wood cutting essentials: circular saw for rip cuts, jigsaw for curves, miter saw for angles." },
    "cutting-nopref-metal": { skus: ["SY-SW-REC-12A", "SY-SW-BAND-9IN", "SY-SW-CIR-6.5"], reason: "Metal cutting powerhouses: reciprocating saw for demolition, band saw for clean cuts, circular for sheet work." },
    "cutting-nopref-tile": { skus: ["SY-SW-JIG-VAR", "SY-SW-OSC-MUL", "SY-SW-MIT-10IN"], reason: "Tile and masonry cutting tools with variable speed control and dust management for clean jobsite results." },
    "cutting-nopref-multi": { skus: ["SY-SW-OSC-MUL", "SY-SW-REC-12A", "SY-SW-CIR-714"], reason: "All-purpose cutting set covering plunge cuts, curves, demolition, and framing with one versatile toolkit." },
    "grinding-cordless-metal": { skus: ["SY-GR-ANG-4.5", "SY-GR-DIE-1-4"], reason: "Cordless angle grinder and die grinder for portable metal grinding, cutting, and surface preparation." },
    "grinding-cordless-stone": { skus: ["SY-GR-ANG-4.5", "SY-GR-ANG-7IN"], reason: "Cordless grinders with diamond blade compatibility for stone and concrete grinding. Compact design for overhead work." },
    "grinding-cordless-sharpening": { skus: ["SY-GR-BCH-6IN", "SY-GR-DIE-1-4"], reason: "Bench grinder with adjustable tool rest for precise sharpening. Die grinder handles detailed edge work on blades and bits." },
    "grinding-cordless-surface": { skus: ["SY-GR-ANG-4.5", "SY-GR-POL-6IN", "SY-GR-STR-ANG"], reason: "Surface preparation lineup: angle grinder for rust removal, polisher for finishing, straight grinder for tight access." },
    "grinding-corded-metal": { skus: ["SY-GR-ANG-7IN", "SY-GR-STR-ANG", "SY-GR-BCH-8IN"], reason: "Heavy-duty corded grinders for continuous metal grinding. Larger wheels for faster stock removal in fabrication shops." },
    "grinding-corded-stone": { skus: ["SY-GR-ANG-7IN", "SY-GR-ANG-4.5", "SY-GR-CRD-ANG"], reason: "Corded grinders with continuous-duty motors for stone, concrete, and masonry. Sustained power for all-day jobsite work." },
    "grinding-corded-sharpening": { skus: ["SY-GR-BCH-8IN", "SY-GR-BCH-6IN", "SY-GR-DIE-1-4"], reason: "Large bench grinders for heavy sharpening tasks. Die grinder provides precision for detailed edge finishing." },
    "grinding-corded-surface": { skus: ["SY-GR-STR-ANG", "SY-GR-POL-6IN", "SY-GR-ANG-7IN"], reason: "Corded surface finishing tools: straight grinder for weld cleanup, polisher for paint prep, angle grinder for heavy rust removal." },
    "grinding-nopref-metal": { skus: ["SY-GR-ANG-4.5", "SY-GR-ANG-7IN", "SY-GR-BCH-6IN"], reason: "Versatile grinding lineup from 4.5-inch angle grinders to 6-inch bench grinders for all metalworking needs." },
    "grinding-nopref-stone": { skus: ["SY-GR-ANG-7IN", "SY-GR-ANG-4.5", "SY-GR-CRD-ANG"], reason: "Durable grinders with diamond blade support for stone, tile, and concrete across all power preferences." },
    "grinding-nopref-sharpening": { skus: ["SY-GR-BCH-8IN", "SY-GR-BCH-6IN", "SY-GR-DIE-1-4"], reason: "Complete sharpening station: bench grinders for tools and blades, die grinder for precision edge work." },
    "grinding-nopref-surface": { skus: ["SY-GR-ANG-4.5", "SY-GR-POL-6IN", "SY-GR-STR-ANG"], reason: "Surface preparation kit with angle grinder, polisher, and straight grinder for comprehensive rust, paint, and weld cleanup." },
    "sanding-cordless-wood": { skus: ["SY-SA-ORB-5IN", "SY-SA-DTL-2.4", "SY-SA-ORB-6IN"], reason: "Cordless sanders for wood finishing on the go. Random orbital for smooth surfaces, detail sander for tight corners." },
    "sanding-cordless-paint": { skus: ["SY-SA-ORB-5IN", "SY-SA-BLT-3X21", "SY-SA-SHT-1-4"], reason: "Paint removal specialists: orbital sander for flat surfaces, belt sander for aggressive stripping, sheet sander for edges." },
    "sanding-cordless-detail": { skus: ["SY-SA-DTL-2.4", "SY-SA-SHT-1-4", "SY-SA-ORB-5IN"], reason: "Detail-oriented cordless sanders: triangular detail pad for corners, sheet sander for profiles, orbital for blending." },
    "sanding-cordless-large": { skus: ["SY-SA-BLT-3X21", "SY-SA-ORB-6IN", "SY-SA-PLN-3.25"], reason: "Large surface sanding: belt sander for rapid stock removal, 6-inch orbital for wide coverage, planer for thickness adjustment." },
    "sanding-corded-wood": { skus: ["SY-SA-CRD-ORB", "SY-SA-DSK-5IN", "SY-SA-ORB-5IN"], reason: "Corded wood finishing lineup: stationary disc sander for precision, orbital for handheld work, continuous power for production shops." },
    "sanding-corded-paint": { skus: ["SY-SA-BLT-3X21", "SY-SA-CRD-ORB", "SY-SA-SHT-1-4"], reason: "Aggressive paint removal with unlimited runtime. Belt sander for heavy stripping, orbital for surface prep, sheet sander for trim." },
    "sanding-corded-detail": { skus: ["SY-SA-DTL-2.4", "SY-SA-CRD-ORB", "SY-SA-SHT-1-4"], reason: "Corded detail sanding: triangular pad for corners, random orbital for contours, 1/4-sheet for flat profiles." },
    "sanding-corded-large": { skus: ["SY-SA-BLT-3X21", "SY-SA-DSK-5IN", "SY-SA-PLN-3.25"], reason: "Large-scale corded sanding: belt sander for floors, disc sander for tabletops, electric planer for beams and joists." },
    "sanding-nopref-wood": { skus: ["SY-SA-ORB-5IN", "SY-SA-BLT-3X21", "SY-SA-DTL-2.4"], reason: "Complete wood sanding selection: orbital for fine finish, belt for aggressive removal, detail sander for corners." },
    "sanding-nopref-paint": { skus: ["SY-SA-ORB-5IN", "SY-SA-BLT-3X21", "SY-SA-SHT-1-4"], reason: "Paint preparation and removal: orbital for smooth surfaces, belt for heavy stripping, sheet for trim and edges." },
    "sanding-nopref-detail": { skus: ["SY-SA-DTL-2.4", "SY-SA-ORB-5IN", "SY-SA-SHT-1-4"], reason: "Detail sanding collection: triangular pad for corners, orbital for curved surfaces, sheet sander for flat profiles." },
    "sanding-nopref-large": { skus: ["SY-SA-BLT-3X21", "SY-SA-ORB-6IN", "SY-SA-PLN-3.25"], reason: "Large surface toolkit: belt sander for rapid removal, 6-inch orbital for coverage, planer for dimensional adjustments." },
    "fastening-cordless-light-duty": { skus: ["SY-IT-DRV-1-4", "SY-IT-DRV-20V", "SY-IT-DRV-BRUS"], reason: "Compact cordless drivers for light assembly and finish work. Precision clutches prevent over-driving and stripping." },
    "fastening-cordless-heavy-duty": { skus: ["SY-IT-DRV-20V", "SY-IT-WRN-20V", "SY-IT-RCH-20V"], reason: "Heavy-duty cordless fastening: impact driver for studs and lag bolts, impact wrench for automotive and equipment assembly." },
    "fastening-cordless-automotive": { skus: ["SY-IT-WRN-20V", "SY-IT-WRN-18V", "SY-IT-RCH-20V"], reason: "Automotive cordless tools: impact wrenches with hog ring and detent pin for tire changes, ratchet for engine bay access." },
    "fastening-cordless-construction": { skus: ["SY-IT-DRV-20V", "SY-IT-WRN-20V", "SY-IT-RCH-20V"], reason: "Jobsite cordless fastening: impact driver for deck screws, impact wrench for anchor bolts, ratchet for tight framing." },
    "fastening-corded-light-duty": { skus: ["SY-IT-WRN-CRD", "SY-IT-WRN-3-4", "SY-IT-DRV-1-4"], reason: "Corded fastening for continuous light assembly. Corded impact wrench provides consistent torque without battery swaps." },
    "fastening-corded-heavy-duty": { skus: ["SY-IT-WRN-3-4", "SY-IT-WRN-CRD", "SY-IT-DRV-20V"], reason: "Corded heavy-duty fastening: 3/4-inch drive impact wrench for industrial assembly, corded for production line consistency." },
    "fastening-corded-automotive": { skus: ["SY-IT-WRN-3-4", "SY-IT-WRN-CRD", "SY-IT-WRN-20V"], reason: "Corded automotive tools: impact wrenches for tire and suspension work, unlimited power for high-volume shops." },
    "fastening-corded-construction": { skus: ["SY-IT-WRN-CRD", "SY-IT-WRN-3-4", "SY-IT-DRV-20V"], reason: "Corded construction fastening: impact wrenches for structural bolting, reliable power for all-day steel and timber work." },
    "fastening-nopref-light-duty": { skus: ["SY-IT-DRV-1-4", "SY-IT-DRV-20V", "SY-IT-DRV-BRUS"], reason: "Light-duty fastening options: compact drivers with precision clutches for cabinetry, trim, and electronics assembly." },
    "fastening-nopref-heavy-duty": { skus: ["SY-IT-DRV-20V", "SY-IT-WRN-20V", "SY-IT-WRN-3-4"], reason: "Heavy-duty fastening: impact drivers and wrenches for construction, manufacturing, and equipment maintenance." },
    "fastening-nopref-automotive": { skus: ["SY-IT-WRN-20V", "SY-IT-WRN-3-4", "SY-IT-RCH-20V"], reason: "Automotive fastening: impact wrenches for lug nuts and suspension, cordless ratchet for engine compartment access." },
    "fastening-nopref-construction": { skus: ["SY-IT-DRV-20V", "SY-IT-WRN-20V", "SY-IT-WRN-CRD"], reason: "Construction fastening: impact driver for framing and decking, impact wrench for anchor bolts, corded for continuous use." },
    "combo-cordless-diy": { skus: ["SY-CK-3PC-HOM", "SY-CK-2PC-DRL", "SY-CK-3PC-OAK"], reason: "Home DIY combos: 2-3 tool kits with drills, drivers, and basic accessories. Perfect starter sets for home projects." },
    "combo-cordless-pro": { skus: ["SY-CK-4PC-CON", "SY-CK-5PC-ELE", "SY-CK-6PC-20V"], reason: "Professional cordless combo kits: 4-6 tools with high-capacity batteries. Covers drilling, driving, cutting, and grinding." },
    "combo-cordless-industrial": { skus: ["SY-CK-6PC-20V", "SY-CK-8PC-PRO", "SY-CK-5PC-ELE"], reason: "Industrial-grade combo kits with 6-8 tools. Includes brushless drill, impact driver, circular saw, grinder, and more." },
    "combo-nopref-diy": { skus: ["SY-CK-3PC-HOM", "SY-CK-2PC-DRL", "SY-CK-3PC-OAK"], reason: "DIY combo sets: affordable multi-tool kits with batteries, charger, and storage. Ideal for homeowners and hobbyists." },
    "combo-nopref-pro": { skus: ["SY-CK-4PC-CON", "SY-CK-5PC-ELE", "SY-CK-6PC-20V"], reason: "Professional combo kits: 4-6 tool sets with brushless technology for contractors and serious craftsmen." },
    "combo-nopref-industrial": { skus: ["SY-CK-6PC-20V", "SY-CK-8PC-PRO", "SY-CK-2PC-GRN"], reason: "Industrial combo selection: heavy-duty multi-tool kits with extended runtime batteries for demanding production environments." }
  };

  function normalizeApp(app) {
    var map = {
      "Concrete/Masonry": "concrete", "Stone/Concrete": "stone",
      "Surface Prep": "surface", "Multi-material": "multi",
      "Wood Finishing": "wood", "Paint Removal": "paint",
      "Detail Work": "detail", "Large Surfaces": "large",
      "Light Duty": "light-duty", "Heavy Duty": "heavy-duty",
      "Home DIY": "diy", "Professional": "pro",
      "Industrial": "industrial", "General Purpose": "general"
    };
    return map[app] || app.toLowerCase();
  }

  function getKey(steps) {
    return (steps.work || 'drilling').toLowerCase() + '-' + (steps.power || 'nopref').toLowerCase() + '-' + normalizeApp(steps.app || 'general');
  }

  function getAppOptions(workType) {
    var opts = {
      "Drilling": ["Wood", "Metal", "Concrete/Masonry", "General Purpose"],
      "Cutting": ["Wood", "Metal", "Tile", "Multi-material"],
      "Grinding": ["Metal", "Stone/Concrete", "Sharpening", "Surface Prep"],
      "Sanding": ["Wood Finishing", "Paint Removal", "Detail Work", "Large Surfaces"],
      "Fastening": ["Light Duty", "Heavy Duty", "Automotive", "Construction"],
      "Combo": ["Home DIY", "Professional", "Industrial"]
    };
    return opts[workType] || opts["Drilling"];
  }

  var state = { step: 1, data: {} };

  function renderStep1() {
    var content = document.getElementById('selector-content');
    if (!content) return;
    content.innerHTML = '<h3 class="font-oswald text-xl font-bold text-white mb-4">' + _t('selector.step1Title','What type of work do you need to do?') + '</h3>' +
      '<div class="grid grid-cols-2 md:grid-cols-3 gap-3">' +
      [_t("selector.workDrilling","Drilling"), _t("selector.workCutting","Cutting"), _t("selector.workGrinding","Grinding"), _t("selector.workSanding","Sanding"), _t("selector.workFastening","Fastening"), _t("selector.workCombo","Multiple (Combo)")].map(function(opt) {
        return '<button type="button" class="selector-option" data-value="' + opt + '">' +
          '<span class="font-semibold text-white text-sm">' + opt + '</span>' +
        '</button>';
      }).join('') + '</div>';
    bindOptionClicks('work');
  }

  function renderStep2() {
    var content = document.getElementById('selector-content');
    if (!content) return;
    content.innerHTML = '<h3 class="font-oswald text-xl font-bold text-white mb-4">' + _t('selector.step2Title','What power source do you prefer?') + '</h3>' +
      '<div class="space-y-2 max-w-md">' +
      [_t("selector.powerCordless","Cordless (20V MAX)"), _t("selector.powerCorded","Corded"), _t("selector.powerNoPref","No preference")].map(function(opt) {
        return '<button type="button" class="selector-option" data-value="' + opt + '">' +
          '<span class="font-semibold text-white text-sm">' + opt + '</span>' +
        '</button>';
      }).join('') + '</div>';
    bindOptionClicks('power');
  }

  function renderStep3() {
    var content = document.getElementById('selector-content');
    if (!content) return;
    var apps = getAppOptions(state.data.work);
    content.innerHTML = '<h3 class="font-oswald text-xl font-bold text-white mb-4">' + _t('selector.step3Title','What specific application?') + '</h3>' +
      '<div class="grid grid-cols-2 gap-3 max-w-xl">' +
      apps.map(function(opt) {
        return '<button type="button" class="selector-option" data-value="' + opt + '">' +
          '<span class="font-semibold text-white text-sm">' + opt + '</span>' +
        '</button>';
      }).join('') + '</div>';
    bindOptionClicks('app');
  }

  function renderResults() {
    var content = document.getElementById('selector-content');
    if (!content) return;
    var rawKey = getKey(state.data);
    var rec = RECOMMENDATIONS[rawKey] || RECOMMENDATIONS['drilling-nopref-general'];
    content.innerHTML = '<h3 class="font-oswald text-xl font-bold text-white mb-4">' + _t('selector.recommendedTools','Recommended Tools') + '</h3>' +
      '<p class="text-zinc-400 text-sm mb-6">' + rec.reason + '</p>' +
      '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">' +
      rec.skus.map(function(sku) {
        return '<div class="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-center">' +
          '<div class="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center mx-auto mb-3">' +
            '<svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' +
          '</div>' +
          '<p class="text-white font-semibold text-sm mb-1">' + sku + '</p>' +
          '<a href="' + (window.location.pathname.indexOf('/products/') >= 0 ? './product.html?sku=' + sku : './products/product.html?sku=' + sku) + '" class="text-yellow-400 hover:text-yellow-300 text-xs font-medium inline-flex items-center gap-1">' + _t('selector.viewDetails','View Details') + ' <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>' +
        '</div>';
      }).join('') + '</div>' +
      '<div class="flex gap-3">' +
        '<a href="' + (window.location.pathname.indexOf('/products/') >= 0 ? './product.html?sku=' + rec.skus[0] : './products/product.html?sku=' + rec.skus[0]) + '" class="inline-flex items-center justify-center h-11 px-6 bg-yellow-400 text-zinc-900 hover:bg-yellow-300 font-bold rounded-md shadow-lg transition-colors text-sm">' + _t('selector.viewTopPick','View Top Pick') + '</a>' +
        '<button type="button" id="selector-restart" class="inline-flex items-center justify-center h-11 px-6 border border-zinc-700 text-zinc-300 hover:text-yellow-400 hover:border-yellow-400 rounded-md transition-colors text-sm">' + _t('selector.startOver','Start Over') + '</button>' +
      '</div>';
    document.getElementById('selector-restart').addEventListener('click', restart);
  }

  function bindOptionClicks(stepKey) {
    var opts = document.querySelectorAll('#selector-content .selector-option');
    for (var i = 0; i < opts.length; i++) {
      opts[i].addEventListener('click', function() {
        state.data[stepKey] = this.getAttribute('data-value');
        var nextStep = state.step + 1;
        if (nextStep > 4) nextStep = 4;
        goToStep(nextStep);
      });
    }
  }

  function goToStep(step) {
    state.step = step;
    updateProgress();

    if (step === 1) renderStep1();
    else if (step === 2) renderStep2();
    else if (step === 3) renderStep3();
    else renderResults();

    var backBtn = document.getElementById('selector-back');
    var nextBtn = document.getElementById('selector-next');
    if (backBtn) backBtn.classList.toggle('hidden', step <= 1);
    if (nextBtn) nextBtn.classList.toggle('hidden', step >= 4);
  }

  function updateProgress() {
    var steps = document.querySelectorAll('.selector-step');
    for (var i = 0; i < steps.length; i++) {
      var stepNum = parseInt(steps[i].getAttribute('data-step'), 10);
      steps[i].classList.remove('active', 'completed');
      if (stepNum < state.step) steps[i].classList.add('completed');
      if (stepNum === state.step) steps[i].classList.add('active');
    }
  }

  function restart() {
    state = { step: 1, data: {} };
    goToStep(1);
  }

  document.addEventListener('DOMContentLoaded', function() {
    var wizard = document.getElementById('selector-wizard');
    if (!wizard) return;

    var backBtn = document.getElementById('selector-back');
    var nextBtn = document.getElementById('selector-next');

    if (backBtn) backBtn.addEventListener('click', function() {
      if (state.step > 1) goToStep(state.step - 1);
    });

    if (nextBtn) nextBtn.addEventListener('click', function() {
      if (state.step < 3) goToStep(state.step + 1);
    });

    goToStep(1);
    if (typeof i18n !== "undefined" && i18n.applyTranslations) i18n.applyTranslations();

    document.addEventListener('languageChanged', function() {
      if (typeof i18n !== 'undefined' && i18n.applyTranslations) i18n.applyTranslations();
      goToStep(state.step);
    });
  });
})();

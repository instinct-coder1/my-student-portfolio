(() => {
  "use strict";
  if (window.__RAJIN_EXPERIENCE_LAYER__) return;
  window.__RAJIN_EXPERIENCE_LAYER__ = true;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // Additive surface texture. It never targets or changes the portrait element.
  const grain = document.createElement("div");
  grain.className = "xp-grain";
  grain.setAttribute("aria-hidden", "true");
  document.body.append(grain);

  const topButton = document.createElement("button");
  topButton.className = "xp-top-trigger";
  topButton.type = "button";
  topButton.setAttribute("aria-label", "Back to top");
  topButton.textContent = "↑";
  topButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  document.body.append(topButton);

  const commandButton = document.createElement("button");
  commandButton.className = "xp-command-trigger";
  commandButton.type = "button";
  commandButton.setAttribute("aria-label", "Open quick navigation");
  commandButton.innerHTML = "⌘<kbd>CTRL / ⌘ + K</kbd>";
  document.body.append(commandButton);

  const backdrop = document.createElement("div");
  backdrop.className = "xp-palette-backdrop";
  backdrop.innerHTML = '<section class="xp-palette" role="dialog" aria-modal="true" aria-label="Quick navigation"><div class="xp-palette-head"><span>RAJIN / GO TO</span><input type="search" autocomplete="off" placeholder="Search pages, sections, projects..." aria-label="Search navigation"></div><div class="xp-palette-list" role="listbox"></div><div class="xp-palette-foot"><span>ENTER TO OPEN</span><span>ESC TO CLOSE</span></div></section>';
  document.body.append(backdrop);
  const palette = $(".xp-palette", backdrop);
  const search = $("input", palette);
  const list = $(".xp-palette-list", palette);
  let lastFocus = null;
  let activeItems = [];

  const collectItems = () => {
    const items = [];
    $$("header a[href], main a[href], footer a[href]").forEach((link) => {
      const label = (link.textContent || "").replace(/\s+/g, " ").trim();
      const href = link.getAttribute("href");
      if (!label || !href || href === "#") return;
      if (items.some(item => item.href === href && item.label === label)) return;
      items.push({ label, href, category: href.startsWith("mailto:") ? "CONTACT" : href.includes("#") ? "SECTION" : "PAGE" });
    });
    return items;
  };

  let allItems = collectItems();
  const renderItems = (query = "") => {
    const q = query.trim().toLowerCase();
    activeItems = allItems.filter(item => (item.label + " " + item.href + " " + item.category).toLowerCase().includes(q)).slice(0, 14);
    list.replaceChildren();
    if (!activeItems.length) {
      const empty = document.createElement("div");
      empty.className = "xp-palette-empty";
      empty.textContent = "NO MATCHES — TRY ANOTHER SEARCH";
      list.append(empty);
      return;
    }
    activeItems.forEach((item, index) => {
      const button = document.createElement("button");
      button.className = "xp-palette-item";
      button.type = "button";
      button.setAttribute("role", "option");
      button.innerHTML = "<span></span><small></small>";
      $("span", button).textContent = item.label;
      $("small", button).textContent = item.category;
      button.addEventListener("click", () => navigate(item.href));
      list.append(button);
      if (index === 0) button.dataset.first = "true";
    });
  };

  const openPalette = () => {
    lastFocus = document.activeElement;
    allItems = collectItems();
    renderItems(search.value = "");
    backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => search.focus(), 30);
  };
  const closePalette = () => {
    backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  };
  const navigate = href => {
    closePalette();
    if (href.startsWith("#")) {
      const target = $(href);
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      else window.location.href = href;
    } else {
      window.location.href = href;
    }
  };

  commandButton.addEventListener("click", openPalette);
  search.addEventListener("input", () => renderItems(search.value));
  backdrop.addEventListener("click", event => { if (event.target === backdrop) closePalette(); });
  document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();
    if ((event.metaKey || event.ctrlKey) && key === "k") { event.preventDefault(); openPalette(); }
    if (event.key === "Escape" && backdrop.classList.contains("is-open")) closePalette();
    if (event.key === "Enter" && backdrop.classList.contains("is-open") && activeItems.length) {
      const first = $(".xp-palette-item[data-first]", list);
      if (first) first.click();
    }
  });

  // Current-page section rail; only appears after the hero and only on pages with sections.
  const sections = $$("main section[id], main [id].section, main [id].focus-section, main [id].stack-section").filter(node => node.id);
  if (sections.length > 2) {
    const rail = document.createElement("nav");
    rail.className = "xp-rail";
    rail.setAttribute("aria-label", "Page sections");
    const links = sections.map(section => {
      const link = document.createElement("a");
      const heading = $("h1, h2, h3", section);
      const label = (heading?.textContent || section.id).replace(/\s+/g, " ").trim().slice(0, 32);
      link.href = "#" + section.id;
      link.setAttribute("aria-label", label);
      link.title = label;
      link.addEventListener("click", event => {
        event.preventDefault();
        section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
      rail.append(link);
      return { section, link };
    });
    document.body.append(rail);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(item => item.link.classList.toggle("is-active", item.section === entry.target));
        rail.classList.toggle("is-visible", entry.target.id !== "home");
      });
    }, { rootMargin: "-35% 0px -50% 0px", threshold: 0 });
    sections.forEach(section => observer.observe(section));
  }

  // Small live status line: a real client-side interaction, not a fake backend status.
  const heroCopy = $(".hero-copy");
  if (heroCopy && !$(".xp-live-note", heroCopy)) {
    const note = document.createElement("div");
    note.className = "xp-live-note";
    note.innerHTML = '<i aria-hidden="true"></i><span>BUILD LOG / <b>IN THE MAKING</b></span>';
    const anchor = $(".hero-description", heroCopy);
    if (anchor) anchor.insertAdjacentElement("afterend", note);
    else heroCopy.append(note);
  }

  // Pointer-following light on existing cards. No transforms are applied to the portrait.
  if (finePointer && !reduceMotion) {
    $$(".project-card, .focus-card, .stat-card, .journal-card, .directory-item").forEach(card => {
      card.classList.add("xp-card-glow");
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--xp-x", (event.clientX - rect.left) + "px");
        card.style.setProperty("--xp-y", (event.clientY - rect.top) + "px");
      }, { passive: true });
    });
  }

  // Page entry and top control.
  if (!reduceMotion) {
    const main = $("main");
    if (main) main.classList.add("xp-page-entry");
  }
  let ticking = false;
  const updateScroll = () => {
    topButton.classList.toggle("is-visible", window.scrollY > 520);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  updateScroll();

  // Keep the command palette's search useful after page links are changed by other scripts.
  window.addEventListener("load", () => { allItems = collectItems(); });
})();
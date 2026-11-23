(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  // Project archive: real client-side search and category filters over existing project entries.
  function enhanceProjects() {
    const list = $("#projectsList");
    if (!list) return;

    const toolbar = make("section", "portfolio-tools");
    toolbar.setAttribute("aria-label", "Search and filter projects");
    const searchWrap = make("label", "portfolio-search");
    searchWrap.append(make("span", "", "FIND"));
    const search = make("input");
    search.type = "search";
    search.placeholder = "Search projects or technologies...";
    search.setAttribute("aria-label", "Search projects or technologies");
    search.autocomplete = "off";
    searchWrap.append(search);

    const filters = make("div", "portfolio-filters");
    const categories = [
      ["all", "ALL WORK"],
      ["web", "WEB"],
      ["ai", "AI / ML"],
      ["game", "GAMES"]
    ];
    let active = "all";
    const filterButtons = categories.map(([value, label]) => {
      const button = make("button", "portfolio-filter", label);
      button.type = "button";
      button.dataset.filter = value;
      button.setAttribute("aria-pressed", value === active ? "true" : "false");
      button.addEventListener("click", () => {
        active = value;
        filterButtons.forEach(item => item.setAttribute("aria-pressed", item === button ? "true" : "false"));
        apply();
      });
      filters.append(button);
      return button;
    });
    const count = make("p", "portfolio-result-count", "");
    count.setAttribute("aria-live", "polite");
    toolbar.append(searchWrap, filters, count);
    list.parentNode.insertBefore(toolbar, list);

    const empty = make("p", "portfolio-no-results", "No projects match that search. Try another keyword or category.");
    empty.hidden = true;
    list.after(empty);

    function apply() {
      const query = search.value.trim().toLowerCase();
      const items = Array.from(list.querySelectorAll(".directory-item"));
      let visible = 0;
      items.forEach(item => {
        const content = item.textContent.toLowerCase();
        const category = /ai|machine learning|recognizer|tutor/.test(content) ? "ai"
          : /game|space adventure/.test(content) ? "game"
          : "web";
        const matches = (!query || content.includes(query)) && (active === "all" || active === category);
        item.hidden = !matches;
        if (matches) visible++;
      });
      count.textContent = visible + (visible === 1 ? " PROJECT FOUND" : " PROJECTS FOUND");
      empty.hidden = visible !== 0;
    }
    search.addEventListener("input", apply);
    apply();
  }

  // Journal: a small, self-contained reading experience with locally stored static articles.
  const articles = [
    {
      id: "web-building-blocks",
      category: "WEB FUNDAMENTALS",
      read: "4 MIN READ",
      title: "HTML, CSS and JavaScript: three different jobs",
      summary: "A simple mental model for understanding the three core technologies behind most websites.",
      sections: [
        ["HTML gives the page structure", "HTML describes what is on a page: headings, paragraphs, images, links, forms and sections. Think of it as the content and structure of a building."],
        ["CSS controls presentation", "CSS decides how that structure looks. It handles spacing, colours, typography, responsive layouts and visual states such as hover and focus."],
        ["JavaScript adds behaviour", "JavaScript makes a page respond to people. It can validate a form, filter a project list, open a dialog or update content without reloading the page."],
        ["How they work together", "A browser reads the HTML, applies the CSS rules and runs JavaScript. A useful beginner workflow is to build the structure first, style it second and add interaction last."]
      ]
    },
    {
      id: "browser-to-server",
      category: "WEB FUNDAMENTALS",
      read: "5 MIN READ",
      title: "What happens after you enter a website address?",
      summary: "Follow the basic path from a browser request to the page that appears on your screen.",
      sections: [
        ["1. The browser prepares a request", "When you enter a web address, the browser identifies the site and prepares a request for its resources."],
        ["2. The server responds", "A web server receives the request and returns a response. For a static website, that response can be HTML, CSS, JavaScript and image files."],
        ["3. The browser builds the page", "The browser parses the HTML, downloads linked resources, applies styles and executes scripts. It then lays out and paints the visible page."],
        ["4. Interaction continues in the browser", "Buttons, menus and filters can work entirely in the browser. Features that need shared accounts or central storage usually need a backend service."]
      ]
    },
    {
      id: "frontend-backend",
      category: "FULL-STACK BASICS",
      read: "5 MIN READ",
      title: "Frontend vs backend: where does each part run?",
      summary: "Understand the difference between the interface people use and the server-side logic behind it.",
      sections: [
        ["Frontend", "The frontend is the part that runs in the browser. It displays information and handles interface interactions. HTML, CSS and JavaScript are its foundations; React is one library used to organise larger interfaces."],
        ["Backend", "The backend runs on a server. It can authenticate users, validate requests, apply business rules and communicate with a database. Node.js lets developers run JavaScript on the server."],
        ["Database", "A database stores information so it can be retrieved later and shared across users or devices. A browser-only demo can store preferences locally, but that is not a replacement for a shared database."],
        ["Putting the pieces together", "A common flow is: browser interface → API request → backend logic → database → API response → updated interface. Each layer has a separate responsibility."]
      ]
    },
    {
      id: "responsive-design",
      category: "FRONTEND PRACTICE",
      read: "4 MIN READ",
      title: "Responsive design is more than shrinking a desktop page",
      summary: "A practical checklist for making a website comfortable to use on phones, tablets and desktops.",
      sections: [
        ["Start with flexible layout", "Use flexible widths, grid or flexbox instead of fixed page widths. Let content wrap naturally when space becomes limited."],
        ["Choose useful breakpoints", "Add breakpoints when the layout itself starts to feel crowded—not only for specific device names."],
        ["Make interaction touch-friendly", "Keep buttons and links easy to tap, avoid hover-only information and ensure navigation works with a keyboard."],
        ["Test real content", "Long titles, empty states, large images and error messages often expose layout problems that a short placeholder will not."]
      ]
    }
  ];

  function enhanceJournal() {
    const emptyState = $(".empty-blog");
    if (!emptyState) return;

    const grid = make("div", "journal-grid");
    grid.setAttribute("aria-label", "Learning articles");
    articles.forEach(article => {
      const button = make("button", "journal-article");
      button.type = "button";
      button.setAttribute("aria-haspopup", "dialog");
      const top = make("div", "journal-article-top");
      top.append(make("span", "", article.category), make("span", "", article.read));
      button.append(top, make("h2", "", article.title), make("p", "", article.summary));
      const bottom = make("div", "journal-article-bottom");
      bottom.append(make("span", "", "READ ARTICLE"), make("b", "", "↗"));
      button.append(bottom);
      button.addEventListener("click", () => openArticle(article));
      grid.append(button);
    });
    emptyState.replaceWith(grid);
  }

  let dialog;
  let lastTrigger;
  function buildDialog() {
    if (dialog) return dialog;
    dialog = make("div", "article-dialog");
    dialog.hidden = true;
    dialog.setAttribute("role", "presentation");
    const panel = make("article", "article-dialog-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "articleDialogTitle");
    const close = make("button", "article-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close article");
    const meta = make("p", "article-meta");
    const title = make("h2");
    title.id = "articleDialogTitle";
    const summary = make("p", "article-summary");
    const body = make("div", "article-body");
    close.addEventListener("click", closeArticle);
    dialog.addEventListener("click", event => { if (event.target === dialog) closeArticle(); });
    panel.append(close, meta, title, summary, body);
    dialog.append(panel);
    document.body.append(dialog);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !dialog.hidden) closeArticle();
      if (event.key === "Tab" && !dialog.hidden) {
        const focusable = Array.from(panel.querySelectorAll("button,a,[tabindex]:not([tabindex='-1'])"));
        if (!focusable.length) return;
        if (event.shiftKey && document.activeElement === focusable[0]) {
          event.preventDefault(); focusable[focusable.length - 1].focus();
        } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
          event.preventDefault(); focusable[0].focus();
        }
      }
    });
    return dialog;
  }

  function openArticle(article) {
    lastTrigger = document.activeElement;
    const root = buildDialog();
    const panel = $(".article-dialog-panel", root);
    $(".article-meta", panel).textContent = article.category + "  /  " + article.read;
    $("#articleDialogTitle", panel).textContent = article.title;
    $(".article-summary", panel).textContent = article.summary;
    const body = $(".article-body", panel);
    body.replaceChildren();
    article.sections.forEach(([heading, paragraph]) => {
      body.append(make("h3", "", heading), make("p", "", paragraph));
    });
    root.hidden = false;
    document.body.style.overflow = "hidden";
    $(".article-close", panel).focus();
  }

  function closeArticle() {
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    document.body.style.overflow = "";
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
  }

  function init() {
    enhanceProjects();
    enhanceJournal();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
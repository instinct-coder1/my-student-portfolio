(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  document.documentElement.classList.remove("no-js");
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile navigation works on every page.
  const menu = $("#menu");
  const nav = $("#navLinks");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.classList.toggle("active", open);
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    $$("a", nav).forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menu.classList.remove("active");
      menu.setAttribute("aria-expanded", "false");
    }));
  }

  // Scroll progress.
  const progress = $("#progress");
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // Custom cursor — only on a precise pointer.
  const dot = $("#cursorDot");
  const ring = $("#cursorRing");
  if (finePointer && dot && ring && !reduceMotion) {
    window.addEventListener("pointermove", event => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
      dot.style.left = event.clientX + "px";
      dot.style.top = event.clientY + "px";
      ring.animate([{ left: ring.style.left || event.clientX + "px", top: ring.style.top || event.clientY + "px" }, { left: event.clientX + "px", top: event.clientY + "px" }], { duration: 240, fill: "forwards", easing: "ease-out" });
      ring.style.left = event.clientX + "px";
      ring.style.top = event.clientY + "px";
    }, { passive: true });
    $$("a,button,.project-card,.focus-card").forEach(item => {
      item.addEventListener("pointerenter", () => ring.classList.add("is-hover"));
      item.addEventListener("pointerleave", () => ring.classList.remove("is-hover"));
    });
    document.addEventListener("pointerleave", () => { dot.style.opacity = "0"; ring.style.opacity = "0"; });
  }

  // Text that changes over time.
  const rotatingWord = $(".rotating-word");
  if (rotatingWord) {
    const words = (rotatingWord.dataset.words || "").split("|").filter(Boolean);
    if (words.length > 1) {
      let index = 0;
      const changeWord = () => {
        index = (index + 1) % words.length;
        if (window.gsap && !reduceMotion) {
          gsap.to(rotatingWord, { y: -9, opacity: 0, duration: .22, onComplete: () => {
            rotatingWord.textContent = words[index];
            gsap.fromTo(rotatingWord, { y: 9, opacity: 0 }, { y: 0, opacity: 1, duration: .32, ease: "power3.out" });
          }});
        } else {
          rotatingWord.textContent = words[index];
        }
      };
      if (!reduceMotion) window.setInterval(changeWord, 2700);
    }
  }

  // Portrait reacts to pointer movement without modifying the image itself.
  const stage = $("#portraitStage");
  const portraitFrame = stage && $(".portrait-frame", stage);
  if (stage && portraitFrame && finePointer && !reduceMotion) {
    stage.addEventListener("pointermove", event => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      portraitFrame.style.transform = "rotateY(" + (-8 + x * 15) + "deg) rotateX(" + (3 - y * 12) + "deg) translateZ(14px)";
    });
    stage.addEventListener("pointerleave", () => {
      portraitFrame.style.transform = "rotateY(-8deg) rotateX(3deg)";
    });
  }

  // Subtle 3D tilt for work cards.
  if (finePointer && !reduceMotion) {
    $$(".tilt-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = "perspective(1000px) rotateX(" + (-y * 4) + "deg) rotateY(" + (x * 5) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  // Magnetic hover on major calls to action.
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach(button => {
      button.addEventListener("pointermove", event => {
        const rect = button.getBoundingClientRect();
        const dx = (event.clientX - rect.left - rect.width / 2) * .11;
        const dy = (event.clientY - rect.top - rect.height / 2) * .11;
        button.style.transform = "translate(" + dx + "px," + dy + "px)";
      });
      button.addEventListener("pointerleave", () => { button.style.transform = ""; });
    });
  }

  // Project content shared by the home page, archive and detail pages.
  const projects = {
    "gpa-calculator": {
      name: "GPA Calculator", type: "WEB APPLICATION",
      summary: "A retro-inspired CGPA / SGPA calculator built to make semester grade tracking easier.",
      description: "The calculator supports multiple semesters and subjects, credit-weighted grade calculations, grade-scale selection and a running cumulative GPA. It is built with plain HTML, CSS and JavaScript and runs directly in a browser.",
      stack: ["HTML", "CSS", "JavaScript", "Local Storage"], repo: "https://github.com/instinct-coder1/gpa-calculator",
      features: ["Add multiple semesters and subjects", "Calculate SGPA and overall CGPA using credits", "Switch between 10-point and 4-point grading scales", "Save data locally in the browser", "Responsive layout and print-friendly results"]
    },
    "handwritten-digit-recognizer": {
      name: "Handwritten Digit Recognizer", type: "MACHINE LEARNING",
      summary: "A machine-learning project exploring recognition of handwritten numerical digits.",
      description: "This project explores a classic computer-vision task: recognising handwritten digits from image data. The repository is the source of truth for its implementation and dependencies.",
      stack: ["Python", "Handwriting Recognition", "Image Processing"], repo: "https://github.com/instinct-coder1/handwritten-digit-recognizer",
      features: ["Handwritten digit recognition project", "Python-based repository", "Explore the source code and setup instructions on GitHub"]
    },
    "space-adventure": {
      name: "Space Adventure Game", type: "GAME DEVELOPMENT",
      summary: "An interactive space-shooter game with an arcade-inspired visual direction.",
      description: "A small game project centred on space adventure and shooter-style interaction. Visit the repository for the current implementation and instructions.",
      stack: ["HTML", "CSS", "JavaScript"], repo: "https://github.com/instinct-coder1/Space-Adventure-Game-Interactive-Space-Shooter",
      features: ["Space-shooter game concept", "Interactive arcade-style experience", "Source code available on GitHub"]
    },
    "opentutorai": {
      name: "OpenTutorAI", type: "AI APPLICATION",
      summary: "An AI learning-assistant project exploring a conversational tutoring experience.",
      description: "OpenTutorAI is an evolving AI education project. Its repository includes the project source and development setup; visit GitHub for the latest implementation details.",
      stack: ["React", "TypeScript", "AI Application"], repo: "https://github.com/instinct-coder1/opentutorai",
      features: ["AI-focused learning assistant concept", "Web application project", "Development source available on GitHub"]
    }
  };

  const detail = $("#projectDetail");
  if (detail) {
    const id = new URLSearchParams(window.location.search).get("id");
    const project = projects[id];
    if (project) {
      document.title = project.name + " — Rajin Shaikh";
      detail.innerHTML =
        '<div class="section-label"><span>PROJECT / ' + project.type + '</span><i></i><span>CASE STUDY</span></div>' +
        '<p class="eyebrow">SELECTED WORK / 2026</p>' +
        '<h1 class="display-heading">' + project.name + '<span class="accent-word">.</span></h1>' +
        '<p class="detail-lead">' + project.summary + '</p>' +
        '<div class="detail-panel"><div><span class="detail-label">OVERVIEW</span><p>' + project.description + '</p><span class="detail-label">TECHNOLOGIES</span><div class="project-tags">' + project.stack.map(item => "<span>" + item + "</span>").join("") + '</div></div>' +
        '<div><span class="detail-label">PROJECT NOTES</span><ul>' + project.features.map(item => "<li>" + item + "</li>").join("") + '</ul><a class="button button-primary" href="' + project.repo + '" target="_blank" rel="noreferrer"><span>VIEW GITHUB REPOSITORY</span><b>↗</b></a></div></div>';
    } else {
      detail.innerHTML = '<h1 class="display-heading">PROJECT NOT FOUND<span class="accent-word">.</span></h1><p class="detail-lead">Choose a project from the directory to view its details.</p>';
    }
  }

  const projectsList = $("#projectsList");
  if (projectsList) {
    projectsList.innerHTML = Object.keys(projects).map((id, index) => {
      const project = projects[id];
      const number = String(index + 1).padStart(2, "0");
      return '<a class="directory-item" href="project.html?id=' + id + '"><span>' + number + '</span><div><h2>' + project.name + '</h2><p>' + project.summary + '</p></div><b>↗</b></a>';
    }).join("");
  }

  // Motion system: GSAP if the CDN is available, IntersectionObserver otherwise.
  const initMotion = () => {
    if (reduceMotion) {
      $$(".reveal-up,.reveal-lines").forEach(el => { el.style.opacity = "1"; el.style.transform = "none"; el.style.clipPath = "none"; });
      return;
    }
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      const loader = $("#introLoader");
      const loaderBar = $("#loaderBar");
      const loaderNumber = $("#loaderNumber");
      const counter = { value: 0 };
      const loaderTimeline = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: () => { if (loader) loader.remove(); } });
      if (loaderBar) loaderTimeline.to(counter, { value: 100, duration: .9, onUpdate: () => {
        loaderBar.style.width = Math.round(counter.value) + "%";
        if (loaderNumber) loaderNumber.textContent = String(Math.round(counter.value)).padStart(2, "0");
      }}, 0);
      if (loader) loaderTimeline.to(loader, { yPercent: -105, duration: .8, ease: "power4.inOut" }, .92);
      loaderTimeline.from(".hero-line > span", { yPercent: 120, opacity: 0, duration: .9, stagger: .13, ease: "power4.out" }, .7);
      loaderTimeline.from(".eyebrow,.hero-description,.role-row,.hero-actions,.hero-social", { y: 22, opacity: 0, duration: .65, stagger: .08 }, .98);
      loaderTimeline.from(".portrait-float", { y: 45, opacity: 0, scale: .92, duration: 1.1, ease: "power3.out" }, .88);
      loaderTimeline.from(".orbit,.orbit-track,.orbit-chip", { opacity: 0, scale: .7, duration: .7, stagger: .08 }, 1.05);

      $$(".reveal-up").forEach((element, index) => {
        if (element.closest(".hero")) return;
        gsap.fromTo(element, { y: 34, opacity: 0 }, {
          y: 0, opacity: 1, duration: .8, ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true }
        });
      });
      $$(".reveal-lines").forEach(element => {
        gsap.fromTo(element, { y: 35, opacity: 0, clipPath: "inset(0 0 100% 0)" }, {
          y: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 1.05, ease: "power4.out",
          scrollTrigger: { trigger: element, start: "top 86%", once: true }
        });
      });
      $$(".stat-card b[data-count]").forEach(element => {
        const target = Number(element.dataset.count || 0);
        const count = { value: 0 };
        gsap.to(count, { value: target, duration: 1.25, ease: "power2.out", snap: { value: 1 },
          scrollTrigger: { trigger: element, start: "top 90%", once: true },
          onUpdate: () => { element.textContent = String(Math.round(count.value)).padStart(2, "0"); }
        });
      });
      gsap.to(".ambient-a", { x: 80, y: 120, scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 2 } });
      gsap.to(".ambient-b", { x: -80, y: -160, scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 2 } });
      ScrollTrigger.refresh();
    } else {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: .12, rootMargin: "0px 0px -35px 0px" });
      $$(".reveal-up,.reveal-lines").forEach(element => observer.observe(element));
      const loader = $("#introLoader");
      if (loader) loader.remove();
    }
  };

  if (document.readyState === "complete") initMotion();
  else window.addEventListener("load", initMotion, { once: true });
})();
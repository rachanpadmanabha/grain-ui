const html = document.documentElement;
html.dataset.js = "true";

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

const resolvedTheme = () => {
  return html.dataset.theme || (prefersDark.matches ? "dark" : "light");
};

const setSidebarOpen = (value) => {
  html.dataset.sidebarOpen = value ? "true" : "false";
  updateSidebarButtons();
};

const sunIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
const moonIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

const updateThemeButtons = () => {
  const isDark = resolvedTheme() === "dark";
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(isDark));
    button.innerHTML = isDark ? sunIcon : moonIcon;
    button.setAttribute("data-tooltip", isDark ? "Switch to light" : "Switch to dark");
    button.setAttribute("data-side", "bottom");
  });
};

const updateSidebarButtons = () => {
  const isOpen = html.dataset.sidebarOpen === "true";
  document.querySelectorAll("[data-sidebar-toggle]").forEach((button) => {
    button.setAttribute("aria-expanded", String(isOpen));
  });
};

const copyText = async (text) => {
  if (!navigator.clipboard) {
    return false;
  }

  await navigator.clipboard.writeText(text);
  return true;
};

const storedTheme = localStorage.getItem("gr-theme");
if (storedTheme) {
  html.dataset.theme = storedTheme;
}
updateThemeButtons();
updateSidebarButtons();

prefersDark.addEventListener?.("change", () => {
  if (!localStorage.getItem("gr-theme")) {
    updateThemeButtons();
  }
});

/* ------------------------------------------------------------------ */
/*  Page-specific initialization (re-run after each navigation)       */
/* ------------------------------------------------------------------ */

let sectionObserver = null;

const initPage = () => {
  // Theme toggle buttons
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    if (button._grBound) return;
    button._grBound = true;
    button.addEventListener("click", () => {
      const current = resolvedTheme();
      const next = current === "dark" ? "light" : "dark";
      html.dataset.theme = next;
      localStorage.setItem("gr-theme", next);
      updateThemeButtons();
    });
  });
  updateThemeButtons();

  // Sidebar toggle
  document.querySelectorAll("[data-sidebar-toggle]").forEach((button) => {
    if (button._grBound) return;
    button._grBound = true;
    button.addEventListener("click", () => {
      setSidebarOpen(html.dataset.sidebarOpen !== "true");
    });
  });

  // Sidebar anchor links close sidebar
  document.querySelectorAll('.docs-sidebar a[href^="#"]').forEach((link) => {
    if (link._grBound) return;
    link._grBound = true;
    link.addEventListener("click", () => {
      setSidebarOpen(false);
    });
  });

  // Sidebar backdrop
  const sidebar = document.querySelector(".docs-sidebar");
  if (sidebar && !document.querySelector(".docs-sidebar-backdrop")) {
    const backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "docs-sidebar-backdrop";
    backdrop.setAttribute("aria-label", "Close section menu");
    backdrop.addEventListener("click", () => setSidebarOpen(false));
    document.body.appendChild(backdrop);
  }

  // Disconnect previous section observer
  if (sectionObserver) {
    sectionObserver.disconnect();
    sectionObserver = null;
  }

  // Sidebar section scroll tracking
  const sectionLinks = Array.from(document.querySelectorAll('.docs-sidebar a[href^="#"]'));
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sectionLinks.length && sections.length && "IntersectionObserver" in window) {
    const setCurrentSection = (id) => {
      sectionLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setCurrentSection(visible.target.id);
        }
      },
      {
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0.1, 0.3, 0.6]
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));

    if (sections[0]?.id) {
      setCurrentSection(sections[0].id);
    }
  }

  // Copy text buttons
  document.querySelectorAll("[data-copy-text]").forEach((button) => {
    if (button._grBound) return;
    button._grBound = true;
    button.addEventListener("click", async () => {
      const original = button.textContent;
      try {
        const copied = await copyText(button.dataset.copyText || "");
        button.textContent = copied ? "Copied!" : "Copy unavailable";
      } catch {
        button.textContent = "Copy failed";
      }

      window.setTimeout(() => {
        button.textContent = original;
      }, 1800);
    });
  });

  // Code block copy buttons
  document.querySelectorAll("pre").forEach((pre) => {
    if (pre.querySelector(".pre-copy-btn")) {
      return;
    }

    const button = document.createElement("button");
    button.textContent = "Copy";
    button.dataset.variant = "ghost";
    button.dataset.size = "sm";
    button.className = "pre-copy-btn";

    button.addEventListener("click", async () => {
      const text = pre.querySelector("code")?.textContent || pre.textContent || "";
      const original = button.textContent;
      try {
        const copied = await copyText(text.trim());
        button.textContent = copied ? "Copied!" : "Copy unavailable";
      } catch {
        button.textContent = "Copy failed";
      }

      window.setTimeout(() => {
        button.textContent = original;
      }, 1800);
    });

    pre.appendChild(button);
  });

  // Code block language labels
  document.querySelectorAll("pre").forEach((pre) => {
    if (pre.querySelector(".pre-lang-label")) return;
    const code = pre.querySelector("code");
    if (!code) return;
    const langClass = Array.from(code.classList).find((c) => c.startsWith("language-"));
    if (!langClass) return;
    const lang = langClass.replace("language-", "");
    const labelMap = { html: "HTML", xml: "HTML", css: "CSS", javascript: "JS", js: "JS", typescript: "TS", bash: "SHELL", shell: "SHELL" };
    const label = document.createElement("span");
    label.className = "pre-lang-label";
    label.textContent = labelMap[lang] || lang.toUpperCase();
    pre.appendChild(label);
  });

  // Hue control sliders
  document.querySelectorAll("[data-hue-control]").forEach((input) => {
    if (input._grBound) return;
    input._grBound = true;
    const output = document.querySelector(`[data-hue-output="${input.id}"]`);
    const previewContainer =
      input.closest(".docs-theme-preview") ||
      input.closest(".docs-theme-lab") ||
      input.closest(".docs-theming-teaser");

    const sync = () => {
      const hue = input.value;
      const targets = previewContainer
        ? [previewContainer]
        : [html];

      targets.forEach((el) => {
        el.style.setProperty("--gr-hue", hue);
        el.style.setProperty("--gr-accent", `hsl(${hue} 70% 50%)`);
        el.style.setProperty("--gr-accent-hover", `hsl(${hue} 70% 44%)`);
        el.style.setProperty("--gr-accent-light", `hsl(${hue} 70% 96%)`);
        el.style.setProperty("--gr-accent-text", `hsl(${hue} 70% 36%)`);
        el.style.setProperty("--gr-border-focus", `hsl(${hue} 70% 50%)`);
      });

      if (output) {
        output.textContent = hue;
      }
    };

    input.addEventListener("input", sync);
    sync();
  });

  // Syntax highlighting
  window.hljs?.highlightAll();

  // Attach router to new links
  attachRouterLinks();
};

const handleDropdownClose = (event) => {
  document.querySelectorAll("grain-dropdown details[open]").forEach((details) => {
    if (!details.closest("grain-dropdown").contains(event.target)) {
      details.open = false;
      const summary = details.querySelector("summary");
      summary?.setAttribute("aria-expanded", "false");
    }
  });
};

/* ------------------------------------------------------------------ */
/*  Client-side router                                                */
/* ------------------------------------------------------------------ */

const pageCache = new Map();
const TRANSITION_MS = 180;

const isLocalLink = (anchor) => {
  if (!anchor || !anchor.href) return false;
  if (anchor.target === "_blank") return false;
  if (anchor.origin !== location.origin) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("javascript:")) return false;
  return true;
};

const resolveURL = (href) => {
  const url = new URL(href, location.href);
  return url;
};

const attachRouterLinks = () => {
  document.querySelectorAll("a").forEach((link) => {
    if (link._grRouter) return;
    if (!isLocalLink(link)) return;
    link._grRouter = true;

    // Prefetch on hover
    link.addEventListener("mouseenter", () => {
      const url = resolveURL(link.href);
      if (!pageCache.has(url.pathname)) {
        fetch(url.pathname).then((r) => r.ok ? r.text() : null).then((text) => {
          if (text) pageCache.set(url.pathname, text);
        }).catch(() => {});
      }
    }, { once: true });

    link.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      navigateTo(link.href);
    });
  });
};

const navigateTo = async (href, pushState = true) => {
  const url = resolveURL(href);

  // Same page hash navigation
  if (url.pathname === location.pathname && url.hash) {
    const target = document.querySelector(url.hash);
    if (target) {
      if (pushState) history.pushState(null, "", url.href);
      target.scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  // Fade out
  document.body.style.opacity = "0";
  document.body.style.transition = `opacity ${TRANSITION_MS}ms ease`;

  let pageHTML = pageCache.get(url.pathname);
  if (!pageHTML) {
    try {
      const response = await fetch(url.pathname);
      if (!response.ok) {
        location.href = href;
        return;
      }
      pageHTML = await response.text();
      pageCache.set(url.pathname, pageHTML);
    } catch {
      location.href = href;
      return;
    }
  }

  // Wait for fade-out to complete
  await new Promise((r) => setTimeout(r, TRANSITION_MS));

  // Parse fetched page
  const parser = new DOMParser();
  const doc = parser.parseFromString(pageHTML, "text/html");

  // Swap body content
  document.title = doc.title;
  document.body.replaceChildren(...Array.from(doc.body.childNodes).map((n) => document.adoptNode(n)));
  document.body.setAttribute("data-page", doc.body.getAttribute("data-page") || "");

  // Update <html> level attributes if needed
  setSidebarOpen(false);

  // Update browser history
  if (pushState) {
    history.pushState(null, "", url.href);
  }

  // Scroll to top or hash target
  if (url.hash) {
    const target = document.querySelector(url.hash);
    if (target) target.scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }

  // Re-initialize page behaviors
  initPage();

  // Fade in
  requestAnimationFrame(() => {
    document.body.style.opacity = "1";
  });
};

// Handle browser back/forward
window.addEventListener("popstate", () => {
  navigateTo(location.href, false);
});

/* ------------------------------------------------------------------ */
/*  Boot                                                              */
/* ------------------------------------------------------------------ */

// Global event handlers (only bind once)
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSidebarOpen(false);
  }
});

document.addEventListener("pointerdown", handleDropdownClose);

// Initial page setup
initPage();

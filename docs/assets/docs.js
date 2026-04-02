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

const updateThemeButtons = () => {
  const isDark = resolvedTheme() === "dark";
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(isDark));
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

document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const current = resolvedTheme();
    const next = current === "dark" ? "light" : "dark";
    html.dataset.theme = next;
    localStorage.setItem("gr-theme", next);
    updateThemeButtons();
  });
});

document.querySelectorAll("[data-sidebar-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    setSidebarOpen(html.dataset.sidebarOpen !== "true");
  });
});

document.querySelectorAll('.docs-sidebar a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    setSidebarOpen(false);
  });
});

const sidebar = document.querySelector(".docs-sidebar");
if (sidebar) {
  const backdrop = document.createElement("button");
  backdrop.type = "button";
  backdrop.className = "docs-sidebar-backdrop";
  backdrop.setAttribute("aria-label", "Close section menu");
  backdrop.addEventListener("click", () => setSidebarOpen(false));
  document.body.appendChild(backdrop);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setSidebarOpen(false);
    }
  });
}

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

  const observer = new IntersectionObserver(
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

  sections.forEach((section) => observer.observe(section));

  if (sections[0]?.id) {
    setCurrentSection(sections[0].id);
  }
}

document.querySelectorAll("[data-copy-text]").forEach((button) => {
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

document.querySelectorAll("[data-hue-control]").forEach((input) => {
  const output = document.querySelector(`[data-hue-output="${input.id}"]`);
  const sync = () => {
    html.style.setProperty("--gr-hue", input.value);
    if (output) {
      output.textContent = input.value;
    }
  };

  input.addEventListener("input", sync);
  sync();
});

window.addEventListener("load", () => {
  window.hljs?.highlightAll();
});

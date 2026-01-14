// Small vanilla JS enhancements: mobile menu, scroll-reveal, contact mailto helper, back-to-top.
(() => {
  const menuBtn = document.querySelector(".menu-btn");
  const mobileMenu = document.getElementById("mobileMenu");
  const backToTop = document.getElementById("backToTop");
  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");
  const headerEl = document.querySelector(".site-header");
  const navLinks = Array.from(document.querySelectorAll(".nav a[href^='#']"));

  function setMenuOpen(open) {
    if (!menuBtn || !mobileMenu) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    mobileMenu.hidden = !open;
    menuBtn.classList.toggle("is-open", open);
  }

  if (menuBtn && mobileMenu) {
    // Ensure consistent initial state (prevents duplicated nav on refresh / resize)
    setMenuOpen(false);

    menuBtn.addEventListener("click", () => {
      const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });

    // Close after clicking a link
    mobileMenu.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.tagName === "A") setMenuOpen(false);
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    });

    // If user opens menu on mobile and then resizes to desktop, close it.
    const mq = window.matchMedia("(max-width: 720px)");
    const syncMenuToViewport = () => {
      if (!mq.matches) setMenuOpen(false);
    };
    syncMenuToViewport();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", syncMenuToViewport);
    } else if (typeof mq.addListener === "function") {
      // Safari/old browsers
      mq.addListener(syncMenuToViewport);
    }
  }

  // Scroll reveal
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: show everything
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Active nav link + header shadow on scroll
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      if (!id) return null;
      const el = document.getElementById(id);
      return el ? { link, el } : null;
    })
    .filter(Boolean);

  function updateActiveNav() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (headerEl) {
      headerEl.classList.toggle("is-scrolled", scrollY > 10);
    }

    let current = null;
    for (const item of sections) {
      const rect = item.el.getBoundingClientRect();
      const offsetTop = rect.top + scrollY - 90; // header offset
      if (scrollY >= offsetTop) current = item;
    }

    navLinks.forEach((link) => link.classList.remove("is-active"));
    if (current) current.link.classList.add("is-active");
  }

  if (sections.length) {
    updateActiveNav();
    window.addEventListener("scroll", updateActiveNav, { passive: true });
  }

  // Back to top
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Contact form: builds a mailto link (no backend needed)
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const name = String(fd.get("name") || "").trim();
      const message = String(fd.get("message") || "").trim();

      if (!name || !message) {
        if (formNote) formNote.textContent = "Please fill out both fields.";
        return;
      }

      const to = "raunak.eleven@email.com";
      const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
      const body = encodeURIComponent(message + "\n\n— " + name);
      const mailto = `mailto:${to}?subject=${subject}&body=${body}`;

      if (formNote) formNote.textContent = "Opening your email app…";
      window.location.href = mailto;
    });
  }
})();


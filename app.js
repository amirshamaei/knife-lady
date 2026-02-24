// ════════════════════════════════════════════
//  app.js — Interactive logic for Knife Lady
// ════════════════════════════════════════════

(function () {
    "use strict";

    // ─── State ───────────────────────────────
    let currentLang = "en";
    const RTL_LANGS = ["fa", "ar"];

    // ─── DOM refs ────────────────────────────
    const body = document.body;
    const navbar = document.getElementById("navbar");
    const burger = document.getElementById("burger");
    const navLinks = document.getElementById("nav-links");
    const langBtns = document.querySelectorAll(".lang-btn");

    // ─── Apply language ──────────────────────
    function applyLang(lang) {
        currentLang = lang;
        const t = translations[lang];
        if (!t) return;

        // html lang attribute + dir
        document.documentElement.lang = lang;
        const isRTL = RTL_LANGS.includes(lang);
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
        body.classList.toggle("rtl", isRTL);
        if (lang === "ar") body.setAttribute("lang", "ar");
        else body.removeAttribute("lang");

        // translate all [data-i18n] elements
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (t[key] !== undefined) {
                // allow simple HTML in translations (e.g. <strong>)
                el.innerHTML = t[key];
            }
        });

        // update active button
        langBtns.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.lang === lang);
        });

        // save preference
        try { localStorage.setItem("kl_lang", lang); } catch (_) { }
    }

    // ─── Navbar scroll effect ────────────────
    function onScroll() {
        navbar.classList.toggle("scrolled", window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial check

    // ─── Mobile burger menu ──────────────────
    burger.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");
        burger.classList.toggle("open", open);
        body.style.overflow = open ? "hidden" : "";
    });

    // close menu on nav link click
    navLinks.addEventListener("click", e => {
        if (e.target.tagName === "A") {
            navLinks.classList.remove("open");
            burger.classList.remove("open");
            body.style.overflow = "";
        }
    });

    // ─── Language switcher ───────────────────
    langBtns.forEach(btn => {
        btn.addEventListener("click", () => applyLang(btn.dataset.lang));
    });

    // ─── Reveal on scroll ────────────────────
    function setupReveal() {
        const els = document.querySelectorAll(
            ".product-card, .shipping-card, .stat-card, .about-text, .about-stats"
        );
        els.forEach((el, i) => {
            el.classList.add("reveal");
            el.style.transitionDelay = `${(i % 4) * 0.1}s`;
        });

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        els.forEach(el => observer.observe(el));
    }

    // ─── Smooth active nav highlight ─────────
    function setupActiveNav() {
        const sections = document.querySelectorAll("section[id]");
        const links = document.querySelectorAll(".nav-links a[href^='#']");

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        links.forEach(a => {
                            a.style.color = a.getAttribute("href") === `#${id}`
                                ? "var(--gold)"
                                : "";
                        });
                    }
                });
            },
            { rootMargin: "-40% 0px -55% 0px" }
        );

        sections.forEach(s => observer.observe(s));
    }

    // ─── Detect saved/preferred language ────
    function detectInitialLang() {
        try {
            const saved = localStorage.getItem("kl_lang");
            if (saved && translations[saved]) return saved;
        } catch (_) { }
        // browser language sniff
        const bl = (navigator.language || "en").slice(0, 2).toLowerCase();
        const map = { fa: "fa", ar: "ar", tr: "tr" };
        return map[bl] || "en";
    }

    // ─── Init ────────────────────────────────
    document.addEventListener("DOMContentLoaded", () => {
        setupReveal();
        setupActiveNav();
        const initLang = detectInitialLang();
        applyLang(initLang);
    });

})();

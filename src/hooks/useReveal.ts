import { useEffect } from "react";

/**
 * Adds `is-visible` class to all `.reveal` elements when they enter viewport.
 * Lightweight, single observer per page.
 */
export const useReveal = () => {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
          } else {
            e.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "-50px 0px -50px 0px" }
    );

    const observe = () => {
      const els = document.querySelectorAll(".reveal");
      els.forEach((el) => io.observe(el));
    };

    // Initial observe
    observe();

    // Watch for new elements
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
};

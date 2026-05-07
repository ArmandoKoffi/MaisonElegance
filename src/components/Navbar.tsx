import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, Settings, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/produits", label: "Boutique" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { totalItems } = useCart();
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || 
             localStorage.getItem("theme") === "dark" ||
             (window.matchMedia("(prefers-color-scheme: dark)").matches && !localStorage.getItem("theme"));
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-40 bg-background/75 backdrop-blur-xl border-b border-border/60 transition-colors duration-500">
      <div className="container-elegance flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="font-serif text-2xl md:text-3xl tracking-wider transition-transform hover:scale-[1.02]">
          Mimi<span className="text-accent">Élégance</span>
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "relative text-sm uppercase tracking-widest transition-colors hover:text-accent after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-accent after:transition-all after:duration-300",
                  isActive ? "text-accent after:w-full" : "text-foreground/80 after:w-0 hover:after:w-full"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-secondary transition-all btn-press text-accent overflow-hidden relative group"
            aria-label="Changer le thème"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0.8 : 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              {isDark ? <Moon className="w-6 h-6 fill-accent" /> : <Sun className="w-6 h-6" />}
            </motion.div>
            <span className="absolute inset-0 bg-accent/10 scale-0 group-hover:scale-100 transition-transform rounded-full -z-10" />
          </button>

          <Link to="/panier" className="relative p-2 rounded-full hover:bg-secondary transition-colors btn-press">
            <ShoppingCart className="w-6 h-6" />
            <AnimatePresence mode="popLayout">
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-glow"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors btn-press"
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container-elegance py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "py-3 text-sm uppercase tracking-widest border-b border-border/50 last:border-0",
                  pathname === l.to ? "text-accent" : "text-foreground/80"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

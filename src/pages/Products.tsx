import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/useReveal";
import { ChevronDown, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [gender, setGender] = useState("all");
  useReveal();

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setCategory(cat);
    } else {
      setCategory("all");
    }
  }, [searchParams]);

  const products = useLiveQuery(() => db.products.toArray()) || [];
  const rawCategories = useLiveQuery(() => db.categories.toArray()) || [];
  
  // Remove duplicate categories if they exist in the DB to prevent React key warnings
  const uniqueCategories = Array.from(new Map(rawCategories.map(c => [c.slug, c])).values());
  const allCategoriesList = [{ slug: "all", name: "Toutes les catégories" }, ...uniqueCategories];
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);

  const [sort, setSort] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, gender, sort]);

  const filteredProducts = products
    .filter((p) => {
      const searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
      const categoryMatch = category === "all" || p.category === category;
      const genderMatch = gender === "all" || p.gender === gender;
      return searchMatch && categoryMatch && genderMatch;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section className="py-12 md:py-20 bg-mesh min-h-screen">
      <div className="container-elegance">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* SIDEBAR FILTERS */}
          <aside className="lg:w-72 shrink-0 reveal">
            <div className="sticky top-28 space-y-10">
              <div>
                <h3 className="font-serif text-2xl mb-6">Recherche</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Un article en particulier ?"
                    className="w-full bg-card rounded-2xl px-6 py-4 border border-border focus:border-accent outline-none transition-all shadow-soft"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl mb-6">Catégories</h3>
                <div 
                  className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-6 py-4"
                  onMouseLeave={() => setHoveredCategoryIndex(null)}
                >
                  {allCategoriesList.map((cat, index) => {
                    const distance = hoveredCategoryIndex !== null ? Math.abs(hoveredCategoryIndex - index) : Infinity;
                    const scale = hoveredCategoryIndex === null ? 1 : Math.max(1, 1.05 - distance * 0.02);
                    const translateX = hoveredCategoryIndex === null ? 0 : Math.max(0, 8 - distance * 4);
                    const opacity = hoveredCategoryIndex === null ? 1 : Math.max(0.6, 1 - distance * 0.15);

                    return (
                      <button
                        key={cat.slug}
                        onMouseEnter={() => setHoveredCategoryIndex(index)}
                        onClick={() => {
                          setCategory(cat.slug);
                          if (cat.slug === "all") {
                            searchParams.delete("category");
                          } else {
                            searchParams.set("category", cat.slug);
                          }
                          setSearchParams(searchParams);
                        }}
                        className={cn(
                          "w-full text-left px-5 py-3 rounded-xl text-sm border origin-left relative",
                          category === cat.slug ? "bg-accent text-white border-accent shadow-glow" : "bg-card text-foreground/70 border-border"
                        )}
                        style={{
                          transform: `scale(${scale}) translateX(${translateX}px)`,
                          opacity: category === cat.slug ? 1 : opacity,
                          transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                          zIndex: hoveredCategoryIndex === index ? 10 : 1
                        }}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl mb-6">Pour qui ?</h3>
                {/* Forces VSCode to refresh JSX parser */}
                <div className="flex flex-wrap gap-3">
                  {["all", "Homme", "Femme", "Enfant"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={cn(
                        "px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-bold transition-all duration-300 border hover:-translate-y-1 hover:shadow-md active:scale-95",
                        gender === g ? "bg-primary text-white border-primary shadow-lg" : "bg-card text-foreground/60 border-border hover:border-primary/30 hover:text-primary"
                      )}
                    >
                      {g === "all" ? "Tous" : g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-bold">Aide</p>
                <p className="text-sm text-muted-foreground leading-relaxed">Besoin d'un conseil ? Contactez notre service client sur WhatsApp.</p>
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1">
            <div className="mb-8 reveal">
              <h2 className="font-serif text-4xl">
                {category === "all" 
                  ? "Toute la collection" 
                  : uniqueCategories.find(c => c.slug === category)?.name || "Catégorie"}
              </h2>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 reveal relative z-50">
              <p className="text-muted-foreground text-sm">
                Affichage de <span className="text-foreground font-bold">{paginatedProducts.length}</span> sur <span className="text-foreground font-bold">{filteredProducts.length}</span> articles
              </p>
              <div className="h-[1px] flex-1 bg-border/50 mx-6 hidden md:block" />
              <div className="flex items-center gap-4 relative group/sort z-50">
                <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground whitespace-nowrap">Trier par:</span>
                <div className="relative">
                  <button className="flex items-center gap-3 px-5 py-3 bg-card border border-border rounded-xl text-sm font-bold shadow-soft hover:border-accent hover:shadow-md transition-all active:scale-95">
                    {sort === "newest" ? "Nouveautés" : sort === "price-asc" ? "Prix croissant" : "Prix décroissant"}
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover/sort:rotate-180 transition-transform duration-300" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-elegant opacity-0 invisible translate-y-4 group-hover/sort:opacity-100 group-hover/sort:visible group-hover/sort:translate-y-0 transition-all duration-300 z-50 overflow-hidden">
                    {[
                      { val: "newest", label: "Nouveautés" },
                      { val: "price-asc", label: "Prix croissant" },
                      { val: "price-desc", label: "Prix décroissant" }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setSort(opt.val)}
                        className={cn(
                          "w-full text-left px-6 py-4 text-sm transition-all duration-300 hover:pl-8 hover:pr-4 hover:bg-secondary relative overflow-hidden group/item",
                          sort === opt.val ? "text-accent font-bold bg-accent/5" : "text-foreground/70"
                        )}
                      >
                        <span className={cn(
                          "absolute left-0 top-0 bottom-0 w-1 bg-accent transition-all duration-300",
                          sort === opt.val ? "opacity-100" : "opacity-0 -translate-x-full group-hover/item:opacity-100 group-hover/item:translate-x-0"
                        )} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {paginatedProducts.length > 0 ? (
                <motion.div
                  key={`products-grid-${category}-${gender}-${sort}-${search}-${currentPage}`}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    },
                    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
                  }}
                >
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {paginatedProducts.map((product) => (
                      <motion.div 
                        key={product.id}
                        variants={{
                          hidden: { opacity: 0, y: 30, scale: 0.95 },
                          show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
                        }}
                      >
                        <ProductCard product={product as any} />
                      </motion.div>
                    ))}
                  </div>

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div className="mt-16 flex justify-center items-center gap-4 reveal">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-3 rounded-xl border border-border text-sm font-bold uppercase tracking-widest btn-slide disabled:opacity-30"
                      >
                        <span className="relative z-10">Précédent</span>
                      </button>
                      <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1;
                          if (
                            page === 1 || 
                            page === totalPages || 
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                  "w-12 h-12 rounded-xl text-sm font-bold transition-all",
                                  currentPage === page ? "bg-accent text-white shadow-glow" : "bg-card border border-border hover:border-accent"
                                )}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 || 
                            page === currentPage + 2
                          ) {
                            return <span key={page} className="text-muted-foreground">...</span>;
                          }
                          return null;
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-6 py-3 rounded-xl border border-border text-sm font-bold uppercase tracking-widest btn-slide disabled:opacity-30"
                      >
                        <span className="relative z-10">Suivant</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : products.length === 0 ? (
                <motion.div 
                  key={`empty-db-${category}-${gender}-${search}-${sort}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-24 bg-card/50 rounded-[3rem] border border-dashed border-border"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                    <ShoppingBag className="w-8 h-8 text-accent" />
                  </div>
                  <p className="font-serif text-3xl md:text-4xl mb-4">Bientôt Disponible</p>
                  <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                    Notre nouvelle collection arrive très prochainement. Tous nos articles actuels sont momentanément épuisés.
                    Restez connectés pour découvrir nos nouvelles pépites !
                  </p>
                  <button 
                    onClick={() => { window.location.href = "/"; }}
                    className="px-8 py-4 bg-primary text-white rounded-full uppercase tracking-widest font-bold text-xs btn-slide"
                  >
                    <span className="relative z-10">Retour à l'accueil</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key={`empty-search-${category}-${gender}-${search}-${sort}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-24 bg-card/50 rounded-[3rem] border border-dashed border-border"
                >
                  <p className="font-serif text-3xl mb-4">Aucun article trouvé</p>
                  <p className="text-muted-foreground mb-8">Essayez de modifier vos filtres ou votre recherche.</p>
                  <button 
                    onClick={() => { setCategory("all"); setGender("all"); setSearch(""); }}
                    className="px-8 py-4 bg-primary text-white rounded-full uppercase tracking-widest font-bold text-xs btn-slide"
                  >
                    <span className="relative z-10">Réinitialiser les filtres</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/useReveal";
import { ChevronDown } from "lucide-react";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [gender, setGender] = useState("all");
  useReveal();

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
  }, [searchParams]);

  const products = useLiveQuery(() => db.products.toArray()) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];

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
                <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                  <button
                    onClick={() => {
                      setCategory("all");
                      searchParams.delete("category");
                      setSearchParams(searchParams);
                    }}
                    className={cn(
                      "w-full text-left px-5 py-3 rounded-xl text-sm transition-all border",
                      category === "all" ? "bg-accent text-white border-accent shadow-glow" : "bg-card text-foreground/70 border-border hover:border-accent/30"
                    )}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        setCategory(cat.slug);
                        setSearchParams({ category: cat.slug });
                      }}
                      className={cn(
                        "w-full text-left px-5 py-3 rounded-xl text-sm transition-all border",
                        category === cat.slug ? "bg-accent text-white border-accent shadow-glow" : "bg-card text-foreground/70 border-border hover:border-accent/30"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl mb-6">Pour qui ?</h3>
                <div className="flex flex-wrap gap-2">
                  {["all", "Homme", "Femme", "Enfant"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={cn(
                        "px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-bold transition-all border",
                        gender === g ? "bg-primary text-white border-primary shadow-lg" : "bg-card text-foreground/60 border-border hover:border-primary/20"
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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 reveal relative z-50">
              <p className="text-muted-foreground text-sm">
                Affichage de <span className="text-foreground font-bold">{paginatedProducts.length}</span> sur <span className="text-foreground font-bold">{filteredProducts.length}</span> articles
              </p>
              <div className="h-[1px] flex-1 bg-border/50 mx-6 hidden md:block" />
              <div className="flex items-center gap-4 relative group/sort z-50">
                <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground whitespace-nowrap">Trier par:</span>
                <div className="relative">
                  <button className="flex items-center gap-3 px-5 py-3 bg-card border border-border rounded-xl text-sm font-bold shadow-soft hover:border-accent transition-all">
                    {sort === "newest" ? "Nouveautés" : sort === "price-asc" ? "Prix croissant" : "Prix décroissant"}
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover/sort:rotate-180 transition-transform duration-300" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-elegant opacity-0 invisible group-hover/sort:opacity-100 group-hover/sort:visible transition-all duration-300 z-50 overflow-hidden">
                    {[
                      { val: "newest", label: "Nouveautés" },
                      { val: "price-asc", label: "Prix croissant" },
                      { val: "price-desc", label: "Prix décroissant" }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setSort(opt.val)}
                        className={cn(
                          "w-full text-left px-6 py-4 text-sm transition-all hover:bg-secondary",
                          sort === opt.val ? "text-accent font-bold bg-accent/5" : "text-foreground/70"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {paginatedProducts.map((product, i) => (
                    <div key={product.id} className="reveal" style={{ transitionDelay: `${(i % 12) * 50}ms` }}>
                      <ProductCard product={product as any} />
                    </div>
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
              </>
            ) : (
              <div className="text-center py-24 bg-card/50 rounded-[3rem] border border-dashed border-border reveal">
                <p className="font-serif text-3xl mb-4">Aucun article trouvé</p>
                <p className="text-muted-foreground mb-8">Essayez de modifier vos filtres ou votre recherche.</p>
                <button 
                  onClick={() => { setCategory("all"); setGender("all"); setSearch(""); }}
                  className="px-8 py-4 bg-primary text-white rounded-full uppercase tracking-widest font-bold text-xs btn-slide"
                >
                  <span className="relative z-10">Réinitialiser</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;

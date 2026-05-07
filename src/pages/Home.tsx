import { Link } from "react-router-dom";
import { Truck, Shield, Wallet, Award, Star, Flame, Smartphone, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { useReveal } from "@/hooks/useReveal";
import heroImage from '../assets/heroImage.jfif';

const advantages = [
  { icon: Award, title: "Qualité Premium", text: "Des articles sélectionnés avec soin pour vous." },
  { icon: Wallet,   title: "Meilleurs Prix",        text: "Le luxe accessible à tous les budgets." },
  { icon: Truck,    title: "Livraison 24h",       text: "Recevez votre commande rapidement à Abidjan." },
  { icon: Smartphone, title: "Paiement Facile",    text: "Paiement à la livraison ou par Mobile Money." },
];

const steps = [
  { n: "01", t: "Explorez",     d: "Parcourez nos catégories et trouvez vos articles préférés." },
  { n: "02", t: "Panier",    d: "Ajoutez vos articles au panier en un clic." },
  { n: "03", t: "WhatsApp",    d: "Validez votre commande via WhatsApp." },
  { n: "04", t: "Livraison",           d: "Recevez vos articles en 24h et payez à la porte." },
];

const Home = () => {
  useReveal();
  const featuredProducts = useLiveQuery(() => db.products.limit(8).toArray()) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-primary text-white">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Marketplace background"
            className="w-full h-full object-cover opacity-30 scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
        </div>
        <div className="container-elegance relative z-10 py-20">
          <div className="max-w-3xl reveal">
            <p className="text-xs uppercase tracking-[0.5em] text-accent mb-6 font-bold">Mimi Élégance • Abidjan</p>
            <h1 className="font-serif text-6xl md:text-8xl leading-[0.95] mb-8">
              L'excellence du <span className="italic text-accent text-gradient-gold">Style</span> Ivoirien
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-xl leading-relaxed">
              Découvrez notre collection exclusive de mode premium. Livraison express en 24h à votre porte.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                to="/produits"
                className="inline-flex items-center justify-center px-12 py-5 text-sm uppercase tracking-widest font-bold bg-accent text-accent-foreground btn-slide transition-all rounded-full shadow-glow btn-press"
              >
                Explorer la collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-24 bg-secondary/50 border-y border-border/50">
        <div className="container-elegance">
          <div className="text-center mb-16 reveal">
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-4 font-bold">Inspirations</p>
            <h2 className="font-serif text-5xl md:text-6xl mb-6">Nos Univers</h2>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
          </div>
          <div className="relative">
            <div 
              className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 -mx-4 px-4 flex-nowrap cursor-grab active:cursor-grabbing touch-pan-x"
              onMouseDown={(e) => {
                const el = e.currentTarget;
                let startX = e.pageX - el.offsetLeft;
                let scrollLeft = el.scrollLeft;
                const onMouseMove = (e: MouseEvent) => {
                  const x = e.pageX - el.offsetLeft;
                  const walk = (x - startX) * 2;
                  el.scrollLeft = scrollLeft - walk;
                };
                const onMouseUp = () => {
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);
                };
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
              }}
            >
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.slug}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-none"
                >
                  <Link 
                    to={`/produits?category=${cat.slug}`}
                    className="relative block w-[280px] md:w-[350px] overflow-hidden rounded-[2.5rem] aspect-[4/5] reveal snap-center shadow-card hover:shadow-elegant transition-all duration-500 bg-secondary group"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none group-hover:from-black/95 transition-all duration-500" />
                    <div className="absolute inset-x-0 bottom-0 p-8 text-white pointer-events-none">
                      <h3 className="text-2xl font-serif mb-2 group-hover:translate-x-2 transition-transform duration-500">{cat.name}</h3>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-500 [transition-delay:50ms]">
                        Découvrir la collection <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="py-24 bg-secondary/20">
        <div className="container-elegance">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {advantages.map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className="reveal group text-center p-10 bg-card rounded-[2.5rem] shadow-soft hover:shadow-elegant transition-all duration-500 border border-transparent hover:border-accent/20"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/5 mb-6 group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                  <Icon className="w-8 h-8 text-accent group-hover:text-white" />
                </div>
                <h3 className="font-serif text-xl mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24 bg-secondary/30">
        <div className="container-elegance">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 reveal gap-6">
            <div className="text-center md:text-left">
              <p className="text-xs uppercase tracking-[0.4em] text-accent mb-4 font-bold">Tendance</p>
              <h2 className="font-serif text-5xl md:text-6xl">Nouveautés</h2>
            </div>
            <Link to="/produits" className="group flex items-center gap-3 text-sm uppercase tracking-[0.3em] font-bold text-accent btn-slide px-6 py-3 rounded-full">
              Voir toute la boutique <span className="w-12 h-[2px] bg-accent group-hover:bg-primary transition-all" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {featuredProducts.map((p, i) => (
              <div key={p.id} className="reveal" style={{ transitionDelay: `${i * 150}ms` }}>
                <ProductCard product={p as any} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO ORDER */}
      <section className="py-24 bg-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12 translate-x-1/2" />
        <div className="container-elegance relative z-10">
          <div className="text-center mb-16 reveal">
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-4 font-bold">Processus</p>
            <h2 className="font-serif text-5xl md:text-6xl mb-6">Comment Commander ?</h2>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="reveal group relative p-10 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all duration-500"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="font-serif text-6xl text-accent/20 mb-6 group-hover:text-accent transition-colors duration-500">{s.n}</div>
                <h3 className="font-serif text-2xl mb-3">{s.t}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-16 reveal">
            <Link to="/produits" className="inline-flex items-center gap-4 px-10 py-5 bg-accent text-accent-foreground font-bold rounded-full uppercase tracking-widest btn-slide transition-all shadow-glow">
              <span className="relative z-10">Démarrer mon shopping</span> <ShoppingBag className="w-5 h-5 relative z-10" />
            </Link>
          </div>
        </div>
      </section>

      {/* URGENCY BANNER */}
      <section className="py-24 bg-mesh relative overflow-hidden">
        <div className="container-elegance relative z-10">
          <div className="max-w-4xl mx-auto bg-primary rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10 reveal">
              <Flame className="w-16 h-16 mx-auto mb-8 text-accent animate-bounce" />
              <h2 className="font-serif text-5xl md:text-7xl mb-6 leading-tight">Stock Limité à <span className="text-accent italic">Abidjan</span></h2>
              <p className="text-lg md:text-xl mb-10 text-white/70 max-w-2xl mx-auto leading-relaxed">
                Nos pièces exclusives sont très demandées. Profitez de la livraison en 24h avant épuisement du stock.
              </p>
              <Link to="/produits" className="inline-block px-12 py-6 bg-accent text-accent-foreground font-bold rounded-full uppercase tracking-widest text-lg shadow-glow btn-press btn-slide">
                <span className="relative z-10">Vérifier la disponibilité</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

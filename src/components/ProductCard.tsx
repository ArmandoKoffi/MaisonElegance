import { Link } from "react-router-dom";
import { formatPrice } from "@/data/products";
import { type Product } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { Button } from "./ui/button";
import { Flame, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { motion } from "framer-motion";

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const isLow = product.stock === "low";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 'out') {
      toast.error('Ce produit est en rupture de stock.');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} ajouté au panier`);
  };

  const fallbackImage = "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop";

  return (
    <article className="group flex flex-col bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all duration-500 hover-lift h-full border">
      <Link to={`/produits/${product.id}`} className="relative block overflow-hidden bg-secondary aspect-square">
        <img
          src={product.image || fallbackImage}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = fallbackImage;
          }}
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {product.badge && (
            <span className="bg-accent text-accent-foreground text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
              {product.badge}
            </span>
          )}
          {isLow && (
            <span className="bg-orange-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
              <Flame className="w-3 h-3" /> Stock limité
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-20">
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/20 shadow-xl">
            <span className={cn(
              "w-2 h-2 rounded-full shadow-inner",
              product.stock !== 'out' ? "bg-green-400 animate-pulse" : "bg-red-400"
            )} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">
               {product.stock !== 'out' ? `${product.stock_count} dispo` : "Épuisé"}
            </span>
          </div>
          <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-[8px] uppercase tracking-[0.2em] font-bold border border-white/20 text-white/90">
            {product.gender}
          </span>
        </div>
      </Link>
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex justify-between items-start gap-4">
          <Link to={`/produits/${product.id}`} className="font-serif text-xl hover:text-accent transition-colors line-clamp-1 flex-1">
            {product.name}
          </Link>
          <span className="text-[9px] uppercase tracking-widest bg-secondary px-2 py-1 rounded-lg text-muted-foreground font-bold border border-border/50">
            {product.category}
          </span>
        </div>
        <div className="flex items-center justify-between mt-auto mb-2">
          <p className="text-xl font-bold text-foreground tracking-tight">{formatPrice(product.price)}</p>
        </div>
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="mt-auto"
        >
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock === 'out'}
            className="w-full gap-2 rounded-xl py-6 font-bold btn-slide bg-accent text-white border-none shadow-none"
          >
            <ShoppingCart className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{product.stock === 'out' ? "Indisponible" : "Ajouter au panier"}</span>
          </Button>
        </motion.div>
      </div>
    </article>
  );
};

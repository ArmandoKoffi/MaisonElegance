import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Truck, Shield, Check, Flame, ShoppingCart, MessageSquare } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  useReveal();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('products').select('*').eq('id', Number(id)).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (!product) {
    return (
      <div className="container-elegance py-32 text-center">
        <h1 className="font-serif text-3xl mb-4 text-muted-foreground animate-pulse">
          {isLoading ? "Chargement..." : "Produit introuvable"}
        </h1>
        <Link to="/produits" className="text-accent underline">Retour à la boutique</Link>
      </div>
    );
  }

  const isLow = product.stock === "low";

  const handleAddToCart = () => {
    if (product.stock === 'out' || product.stock_count === 0) {
      toast.error('Ce produit est en rupture de stock.');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} ajouté au panier`);
  };

  const handleWhatsAppDirect = () => {
    const message = `Bonjour, je suis intéressé par l'article : ${product.name} (${formatPrice(product.price)})`;
    window.open(buildWhatsAppLink(message), '_blank');
  };

  return (
    <section className="py-12 md:py-20">
      <div className="container-elegance">
        <nav className="text-xs uppercase tracking-widest text-muted-foreground mb-8">
          <Link to="/" className="hover:text-accent transition-colors">Accueil</Link> / <Link to="/produits" className="hover:text-accent transition-colors">Boutique</Link> / <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="reveal">
            <div className="bg-secondary aspect-square overflow-hidden rounded-2xl shadow-card border">
              <img
                key={activeImage}
                src={(product.images && product.images[activeImage]) || product.image}
                alt={product.name}
                className="w-full h-full object-cover animate-scale-in"
              />
            </div>
            {product.images && product.images.length > 0 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl bg-secondary overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === i ? "border-accent shadow-soft scale-95" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="reveal" style={{ transitionDelay: "100ms" }}>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-block bg-secondary text-foreground text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                {product.category}
              </span>
              {product.badge && (
                <span className="inline-block bg-accent text-accent-foreground text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                  {product.badge}
                </span>
              )}
              {isLow && (
                <span className="inline-flex items-center gap-1.5 bg-[hsl(var(--warning))] text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                  <Flame className="w-3 h-3" /> Stock limité
                </span>
              )}
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl mb-4 leading-tight">{product.name}</h1>
            <p className="text-3xl font-bold text-foreground mb-6">{formatPrice(product.price)}</p>
            
            <div className="space-y-4 mb-8">
              <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">Genre</span>
                <span className="font-bold">{product.gender}</span>
              </div>
              <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">Stock disponible</span>
                <span className={`font-bold ${product.stockCount > 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                  {product.stockCount > 0 ? `${product.stockCount} articles` : "Rupture de stock"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button 
                  onClick={handleAddToCart} 
                  disabled={product.stockCount === 0}
                  className="w-full gap-3 py-7 text-lg rounded-2xl font-bold shadow-lg shadow-primary/20 btn-slide bg-primary"
                >
                  <ShoppingCart className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">{product.stockCount > 0 ? "Ajouter au panier" : "Indisponible"}</span>
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button 
                  onClick={handleWhatsAppDirect} 
                  variant="outline" 
                  className="w-full gap-3 py-7 text-lg rounded-2xl border-accent text-accent btn-slide"
                >
                  <MessageSquare className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">Achat rapide</span>
                </Button>
              </motion.div>
            </div>

            <div className="space-y-6 border-t pt-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Livraison Rapide</h3>
                  <p className="text-sm text-muted-foreground">24h à Abidjan & environs. Expédition nationale possible.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Paiement Sécurisé</h3>
                  <p className="text-sm text-muted-foreground">Paiement à la livraison à Abidjan ou Mobile Money.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;

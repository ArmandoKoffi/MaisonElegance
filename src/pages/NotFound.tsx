import { Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
      <div className="max-w-2xl w-full text-center">
        <div className="relative inline-block mb-8">
          <h1 className="text-[12rem] md:text-[18rem] font-serif leading-none text-secondary select-none opacity-50">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <ShoppingBag className="w-24 h-24 md:w-32 md:h-32 text-accent opacity-20" />
          </div>
        </div>
        
        <h2 className="font-serif text-4xl md:text-5xl mb-6 leading-tight">Cette page est <br /><span className="italic text-accent">hors collection</span></h2>
        
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10 leading-relaxed">
          Il semble que l'article ou la page que vous cherchez n'existe plus ou a été déplacé dans nos archives.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild variant="default" size="lg" className="rounded-xl px-10 py-7 text-lg gap-2">
            <Link to="/">
               <ArrowLeft className="w-5 h-5" />
               Retour à l'accueil
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl px-10 py-7 text-lg gap-2">
            <Link to="/produits">
               Explorer la boutique
            </Link>
          </Button>
        </div>
        
        <div className="mt-20 pt-8 border-t border-border/50">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Maison Élégance • Abidjan</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

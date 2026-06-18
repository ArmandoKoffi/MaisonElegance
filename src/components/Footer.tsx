import { Link } from "react-router-dom";
import { Facebook, MessageCircle, MapPin } from "lucide-react";

export const Footer = () => (
  <footer className="bg-primary text-primary-foreground mt-24">
    <div className="container-elegance py-14 grid gap-10 md:grid-cols-4">
      <div>
        <h3 className="font-serif text-2xl mb-3">Mimi<span className="text-accent">Élégance</span></h3>
        <p className="text-sm text-primary-foreground/70 leading-relaxed">
          L'élégance accessible à toutes les femmes de Côte d'Ivoire.
        </p>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest mb-4 text-accent">Boutique</h4>
        <ul className="space-y-2 text-sm text-primary-foreground/80">
          <li><Link to="/produits" className="hover:text-accent transition-colors">Découvrez nos produits</Link></li>
          <li><Link to="/a-propos" className="hover:text-accent transition-colors">Notre histoire</Link></li>
          <li><Link to="/contact" className="hover:text-accent transition-colors">Contact & FAQ</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest mb-4 text-accent">Livraison</h4>
        <ul className="space-y-2 text-sm text-primary-foreground/80">
          <li>Abidjan : 1500 à 2000 FCFA</li>
          <li>Autres villes : 2500 à 3500 FCFA</li>
          <li>Livraison en 24h à Abidjan</li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest mb-4 text-accent">Contact</h4>
        <ul className="space-y-3 text-sm text-primary-foreground/80">
          <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp Lun-Sam</li>
          <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Abidjan, Côte d'Ivoire</li>
          <li className="flex items-center gap-2"><Facebook className="w-4 h-4" /> Mimi Élégance</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-primary-foreground/10 py-5 text-center text-xs text-primary-foreground/50">
      © {new Date().getFullYear()} Mimi Élégance — Tous droits réservés.
    </div>
  </footer>
);

import bag1 from "@/assets/bag-1.jpg";
import bag2 from "@/assets/bag-2.jpg";
import bag3 from "@/assets/bag-3.jpg";
import bag4 from "@/assets/bag-4.jpg";
import bag5 from "@/assets/bag-5.jpg";
import bag6 from "@/assets/bag-6.jpg";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  images: string[];
  gender: "Homme" | "Femme" | "Enfant";
  category: string;
  description: string;
  longDescription?: string;
  badge?: string;
  stock: "available" | "low";
};

export const products: Product[] = [
  { id: "tote-nude",     name: "Sac Tote Nude",        price: 7000, image: bag1, images: [bag1, bag5], gender: "Femme", category: "sacs", description: "Un sac pratique et élégant conçu pour sublimer votre style au quotidien.", longDescription: "Ce tote spacieux en ton nude allie simplicité, élégance et praticité. Parfait pour vos sorties, votre travail ou vos rendez-vous. Sa conception vous permet de transporter vos essentiels avec style.", badge: "Best-seller", stock: "low" },
  { id: "epaule-noir",   name: "Sac Épaule Noir",      price: 7000, image: bag2, images: [bag2, bag6], gender: "Femme", category: "sacs", description: "Un sac pratique et élégant conçu pour sublimer votre style au quotidien.", longDescription: "Élégance intemporelle en noir profond, finitions soignées et bandoulière ajustable. Idéal pour passer du bureau au dîner sans changer de sac.", stock: "available" },
  { id: "enfant-set-1",  name: "Ensemble Junior Chic",  price: 12000, image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=800", images: ["https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=800"], gender: "Enfant", category: "enfant", description: "Un ensemble élégant et confortable pour vos petits.", longDescription: "Confectionné avec des matières douces et résistantes, cet ensemble junior allie style et aisance pour toutes les occasions.", badge: "Nouveau", stock: "available" },
  { id: "bando-caramel", name: "Bandoulière Caramel",  price: 7000, image: bag3, images: [bag3, bag1], gender: "Femme", category: "sacs", description: "Petit format chic, parfait pour les sorties.", longDescription: "Sa teinte caramel chaleureuse et son format compact en font le compagnon parfait des sorties. Ferme par zip discret pour sécuriser vos effets.", badge: "Nouveau", stock: "available" },
  { id: "matelasse-rose",name: "Matelassé Rose Doré",  price: 7000, image: bag4, images: [bag4, bag3], gender: "Femme", category: "sacs", description: "L'allure d'une pièce de créateur à prix accessible.", longDescription: "Matelassé tendance avec chaîne dorée, ce sac apporte une touche couture à toutes vos tenues. Élégant, féminin, raffiné.", stock: "low" },
  { id: "tote-beige",    name: "Tote Structuré Beige", price: 7000, image: bag5, images: [bag5, bag1], gender: "Femme", category: "sacs", description: "Lignes structurées et anses rigides, très élégant.", longDescription: "Structuré et raffiné, ce tote en beige chaud accompagne votre journée avec une silhouette nette. Spacieux, soigné, polyvalent.", stock: "available" },
  { id: "seau-chocolat", name: "Sac Seau Chocolat",    price: 7000, image: bag6, images: [bag6, bag2], gender: "Femme", category: "sacs", description: "Cuir profond, fermeture coulissante, sophistiqué.", longDescription: "Le sac seau chocolat conjugue volume et élégance. Sa fermeture coulissante préserve vos affaires tout en gardant une allure sophistiquée.", badge: "Stock limité", stock: "low" },
];

export const formatPrice = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

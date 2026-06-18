import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { generalMessage } from "@/lib/whatsapp";
import { MessageCircle, MapPin, Clock, Headphones, CreditCard, Zap } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const faqs = [
  { q: "Comment passer commande sur Mimi Élégance ?", a: "C'est simple ! Explorez notre boutique en ligne, ajoutez vos articles au panier, puis validez votre panier. Vous serez redirigé vers WhatsApp avec le détail de votre sélection pour finaliser la livraison avec notre équipe." },
  { q: "Quels sont les délais de livraison à Abidjan ?", a: "Pour Abidjan et ses quartiers, nous livrons sous 24 heures ouvrées après validation de votre commande." },
  { q: "Puis-je payer à la livraison ?", a: "Absolument. Nous proposons le paiement à la livraison à Abidjan pour que vous puissiez vérifier vos articles avant de payer. Nous acceptons aussi les paiements par Mobile Money." },
  { q: "Quels types d'articles proposez-vous ?", a: "Mimi Élégance est une boutique complète. Nous proposons des sacs à main, des vêtements tendance, des chaussures, des montres et divers accessoires de mode sélectionnés pour leur style et leur qualité." },
  { q: "Combien coûte la livraison ?", a: "Abidjan : entre 1500 et 2000 FCFA selon le quartier. Autres villes : entre 2500 et 3500 FCFA." },
  { q: "Est-il possible d'échanger un article ?", a: "En cas de défaut de fabrication ou de problème de taille sur les vêtements, un échange est possible sous 48h, à condition que l'article soit dans son emballage d'origine et non porté." },
];

const Contact = () => {
  useReveal();
  return (
    <section className="py-20 md:py-32">
      <div className="container-elegance">
        <header className="text-center mb-20 reveal">
          <p className="text-xs uppercase tracking-[0.5em] text-accent mb-4 font-bold">Service Clientèle</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-6">À votre entière disposition</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Besoin d'un conseil personnalisé ou d'une information sur une commande ? 
            Notre service conciergerie vous accompagne du lundi au samedi.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          <div className="reveal bg-card border rounded-[2.5rem] p-10 text-center hover:shadow-elegant transition-all duration-500 hover:-translate-y-2">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-whatsapp/10 text-whatsapp items-center justify-center mb-6">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl mb-4">WhatsApp Direct</h2>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">La méthode la plus rapide pour commander ou poser vos questions en direct.</p>
            <WhatsAppButton message={generalMessage} size="lg" className="w-full" />
          </div>

          <div className="reveal bg-card border rounded-[2.5rem] p-10 text-center hover:shadow-elegant transition-all duration-500 hover:-translate-y-2" style={{ transitionDelay: "100ms" }}>
            <div className="inline-flex w-16 h-16 rounded-2xl bg-accent/10 text-accent items-center justify-center mb-6">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl mb-4">Horaires d'écoute</h2>
            <p className="text-muted-foreground mb-2 text-sm">Lundi — Samedi : 08h00 - 20h00</p>
            <p className="text-muted-foreground text-sm font-medium text-destructive">Dimanche : Fermé</p>
            <div className="mt-8 pt-8 border-t flex items-center justify-center gap-2 text-accent">
              <Zap className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-bold">Réponse en moins de 15 min</span>
            </div>
          </div>

          <div className="reveal bg-card border rounded-[2.5rem] p-10 text-center hover:shadow-elegant transition-all duration-500 hover:-translate-y-2" style={{ transitionDelay: "200ms" }}>
            <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-6">
              <CreditCard className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl mb-4">Modes de Paiement</h2>
            <p className="text-muted-foreground mb-2 text-sm">Espèces à la livraison (Abidjan)</p>
            <p className="text-muted-foreground text-sm">Orange, MTN, Wave Money</p>
            <div className="mt-8 flex justify-center gap-4 grayscale opacity-50">
               {/* Placeholders for payment icons or just text */}
               <span className="text-[10px] uppercase tracking-widest font-bold">Orange</span>
               <span className="text-[10px] uppercase tracking-widest font-bold">MTN</span>
               <span className="text-[10px] uppercase tracking-widest font-bold">Wave</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="reveal bg-primary text-white rounded-[3rem] p-12 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-10 rounded-full -mr-32 -mt-32" />
            <h2 className="font-serif text-3xl md:text-4xl mb-10 relative z-10">Zones & Tarifs de Livraison</h2>
            <div className="space-y-8 relative z-10">
              <div className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xl font-serif mb-1">Abidjan</p>
                  <p className="text-white/60">1500 à 2000 FCFA — Livraison sous 24h</p>
                </div>
              </div>
              <div className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xl font-serif mb-1">Autres villes</p>
                  <p className="text-white/60">2500 à 3500 FCFA — Livraison selon les jours ouvrés</p>
                </div>
              </div>
            </div>
          </div>

          <div className="reveal bg-card border rounded-3xl p-10">
            <div className="flex items-center gap-4 mb-8">
               <Headphones className="w-6 h-6 text-accent" />
               <h2 className="font-serif text-3xl">Questions Fréquentes</h2>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border rounded-2xl px-6 bg-card overflow-hidden transition-all data-[state=open]:shadow-soft data-[state=open]:border-accent/20">
                  <AccordionTrigger className="text-left font-serif text-lg hover:no-underline py-6">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

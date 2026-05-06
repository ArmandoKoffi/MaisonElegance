import { WhatsAppButton } from "@/components/WhatsAppButton";
import { generalMessage } from "@/lib/whatsapp";
import { ShieldCheck, Truck, Heart, Award, Users } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import aboutImage from "../assets/aboutImage.jfif";
import heroImage from '../assets/heroImage.jfif';

const values = [
  { icon: Award, title: "Authenticité", text: "Chaque pièce est sélectionnée pour son design unique et sa qualité irréprochable." },
  { icon: ShieldCheck, title: "Confiance", text: "Paiement sécurisé à la livraison pour une tranquillité d'esprit totale." },
  { icon: Truck, title: "Réactivité", text: "Livraison express en 24h à Abidjan pour vos envies de dernière minute." },
  { icon: Users, title: "Proximité", text: "Un service client humain et disponible du lundi au samedi via WhatsApp." },
];

const About = () => {
  useReveal();
  return (
    <>
      <section className="relative py-28 md:py-40 bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage}
            alt="Boutique background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary via-transparent to-primary" />
        </div>
        <div className="container-elegance relative z-10 text-center">
          <p className="text-xs uppercase tracking-[0.6em] text-accent mb-6 reveal font-bold">Maison Élégance • Abidjan</p>
          <h1 className="font-serif text-6xl md:text-8xl mb-8 reveal leading-tight">L'Art de Vivre <br /><span className="italic text-accent">avec Élégance</span></h1>
          <p className="max-w-2xl mx-auto text-white/70 leading-relaxed text-xl reveal [animation-delay:200ms]">
            Plus qu'une boutique, une destination mode pour ceux qui recherchent l'exceptionnel au quotidien.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container-elegance grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative reveal">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src={aboutImage}
                alt="Fashion collection" 
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent rounded-[2rem] p-10 hidden md:flex flex-col justify-end text-accent-foreground shadow-xl">
              <Heart className="w-12 h-12 mb-4" />
              <p className="font-serif text-2xl leading-tight">Sélectionné avec <br />passion</p>
            </div>
          </div>
          <div className="reveal" style={{ transitionDelay: "200ms" }}>
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-4 font-bold">Notre Vision</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-8 leading-tight">Une mode sans frontières pour l'ivoirienne moderne</h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                Maison Élégance est née à Abidjan de l'envie d'offrir une expérience de shopping premium, accessible et humaine. 
                Ce qui a commencé par une passion pour la maroquinerie est devenu aujourd'hui une boutique complète regroupant 
                le meilleur de la mode : sacs, vêtements, montres et accessoires de luxe.
              </p>
              <p>
                Nous croyons que le luxe n'est pas une question de prix, mais de goût. C'est pourquoi nous parcourons les 
                tendances pour vous proposer des pièces fortes qui affirment votre personnalité, tout en garantissant un 
                excellent rapport qualité-prix.
              </p>
              <p className="font-medium text-foreground italic border-l-4 border-accent pl-6">
                "Notre mission est de faire de chaque achat un moment de plaisir, de la découverte sur notre site jusqu'au 
                déballage de votre colis à domicile."
              </p>
            </div>
            <div className="mt-12 flex flex-wrap gap-4">
              <WhatsAppButton message={generalMessage} size="lg" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-secondary/30">
        <div className="container-elegance">
          <div className="text-center mb-16 reveal">
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-4 font-bold">Nos Engagements</p>
            <h2 className="font-serif text-4xl md:text-5xl">Pourquoi nous choisir ?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div 
                key={v.title} 
                className="reveal bg-card p-10 rounded-[2.5rem] shadow-soft border border-transparent hover:border-accent/20 transition-all hover:-translate-y-2"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
                  <v.icon className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl mb-3">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="container-elegance grid md:grid-cols-3 gap-12 text-center relative z-10">
          {[
            { n: "1000+", l: "Articles en Stock", d: "Une variété infinie pour tous les styles." },
            { n: "24h",  l: "Livraison Garantie", d: "À Abidjan et partout en Côte d'Ivoire." },
            { n: "5000+", l: "Clients Heureux", d: "Rejoignez la communauté Maison Élégance." },
          ].map((s, i) => (
            <div key={s.l} className="reveal" style={{ transitionDelay: `${i * 150}ms` }}>
              <p className="font-serif text-6xl text-accent mb-4">{s.n}</p>
              <p className="text-lg font-bold uppercase tracking-widest mb-2">{s.l}</p>
              <p className="text-sm text-primary-foreground/60">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default About;

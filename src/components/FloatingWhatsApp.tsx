import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink, generalMessage } from "@/lib/whatsapp";

export const FloatingWhatsApp = () => (
  <a
    href={buildWhatsAppLink(generalMessage)}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Commander sur WhatsApp"
    className="fixed bottom-5 right-5 z-50 group"
  >
    <span className="absolute inset-0 rounded-full bg-whatsapp/40 animate-ping" aria-hidden />
    <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-whatsapp text-whatsapp-foreground shadow-elegant group-hover:scale-110 transition-transform animate-float">
      <MessageCircle className="w-7 h-7" />
    </span>
    <span className="hidden md:flex absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-primary text-primary-foreground text-xs px-3 py-2 rounded-full shadow-soft opacity-0 group-hover:opacity-100 transition-opacity">
      Discutons sur WhatsApp
    </span>
  </a>
);

export const WHATSAPP_NUMBER = "2250556126199";

export const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const productMessage = (name: string, _price: number) =>
  `Bonjour, je suis intéressée par le ${name}. Est-il disponible ?`;

export const generalMessage =
  "Bonjour, je souhaite commander un article. Pouvez-vous me donner plus de détail sur vos différents articles?";
export const codMessage =
  "Bonjour, je veux passer une commande. Est-ce possible de payer à la livraison ?";

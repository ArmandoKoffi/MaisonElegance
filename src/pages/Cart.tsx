import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, MessageSquare } from 'lucide-react';
import { formatPrice } from '@/data/products';
import { Link } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { buildWhatsAppLink } from '@/lib/whatsapp';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  const handleWhatsAppCheckout = () => {
    const message = `Bonjour, je souhaite commander les articles suivants :\n\n${cart.map(item => `- ${item.name} (x${item.quantity}) : ${formatPrice(item.price * item.quantity)}`).join('\n')}\n\n*Total : ${formatPrice(totalPrice)}*`;
    window.open(buildWhatsAppLink(message), '_blank');
  };

  if (cart.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-20 text-center"
      >
        <h2 className="text-3xl font-bold mb-4">Votre panier est vide</h2>
        <p className="text-muted-foreground mb-8">Découvrez nos articles et commencez votre shopping !</p>
        <Button asChild className="btn-slide px-10 py-6">
          <Link to="/produits" className="relative z-10">Voir les produits</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-10">Mon Panier ({totalItems})</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-sm border mb-6 last:mb-0"
              >
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-primary font-bold">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id!, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-medium w-8 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id!, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFromCart(item.id!)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="bg-secondary/30 p-6 rounded-2xl h-fit space-y-6">
          <h2 className="text-2xl font-bold">Résumé</h2>
          <div className="space-y-2 border-b pb-4">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Livraison</span>
              <span>Calculée à l'étape suivante</span>
            </div>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <Button className="w-full py-7 text-lg gap-2 btn-slide bg-primary" onClick={handleWhatsAppCheckout}>
            <MessageSquare className="h-5 w-5 relative z-10" />
            <span className="relative z-10">Commander via WhatsApp</span>
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Vous serez redirigé vers WhatsApp pour finaliser la commande.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;

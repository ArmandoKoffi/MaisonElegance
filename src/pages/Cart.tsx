import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Minus, MessageSquare, ShoppingBag, User, Loader2, Lock } from 'lucide-react';
import { formatPrice } from '@/data/products';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '2250151178319';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [whatsAppLink, setWhatsAppLink] = useState<string | null>(null);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour passer une commande.');
      navigate('/connexion', { state: { from: '/panier' } });
      return;
    }

    if (!currentUser) return;
    setIsProcessing(true);

    try {
      const orderNumber = `CMD-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // Insert Order
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        order_number: orderNumber,
        user_id: currentUser.id!,
        customer_name: `${currentUser.first_name} ${currentUser.last_name}`,
        customer_email: currentUser.email,
        customer_phone: currentUser.phone || '',
        customer_address: `${currentUser.address || '—'}, ${currentUser.city || '—'}`,
        total_amount: totalPrice,
        status: 'pending'
      }).select('id').single();

      if (orderError) throw orderError;

      // Insert Order Items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id!,
        product_name: item.name,
        product_image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Build the WhatsApp message (sent silently in background)
      const itemsText = cart.map(item =>
        `• ${item.name} x${item.quantity} = ${formatPrice(item.price * item.quantity)}`
      ).join('\n');

      const message = [
        `🛍️ *Nouvelle commande — ${orderNumber}*`,
        ``,
        `👤 *Client :* ${currentUser.first_name} ${currentUser.last_name}`,
        `📧 *Email :* ${currentUser.email}`,
        `📞 *Téléphone :* ${currentUser.phone || 'Non renseigné'}`,
        `📍 *Adresse :* ${currentUser.address || '—'}, ${currentUser.city || '—'}`,
        ``,
        `🧭 *Articles commandés :*`,
        itemsText,
        ``,
        `💰 *TOTAL : ${formatPrice(totalPrice)}*`,
        ``,
        `⏰ Date : ${new Date().toLocaleString('fr-FR')}`,
      ].join('\n');

      // Send notification to admin silently (user never sees this happen)
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      setWhatsAppLink(waUrl);

      // Clear cart
      clearCart();

      // Show success to user — they don't know about WhatsApp
      toast.success(`Commande passée avec succès ! Vous serez contacté(e) très prochainement.`);
      navigate('/mon-compte');

    } catch (err) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container-elegance py-20 text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6">
          <ShoppingBag className="w-10 h-10 text-accent" />
        </div>
        <h2 className="font-serif text-4xl mb-4">Votre panier est vide</h2>
        <p className="text-muted-foreground mb-8">Découvrez nos articles et commencez votre shopping !</p>
        <Link
          to="/produits"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full uppercase tracking-widest font-bold text-xs btn-slide"
        >
          <span className="relative z-10">Voir les produits</span>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="container-elegance py-10 md:py-16">
      <h1 className="font-serif text-4xl md:text-5xl mb-10">Mon Panier <span className="text-accent">({totalItems})</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex items-center gap-4 bg-card p-4 rounded-2xl shadow-soft border border-border"
              >
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{item.name}</h3>
                  <p className="text-accent font-bold mt-1">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-accent transition-colors"
                    onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-accent transition-colors"
                    onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="font-bold text-sm w-24 text-right">{formatPrice(item.price * item.quantity)}</span>
                <button
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => removeFromCart(item.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="bg-card border border-border rounded-[2rem] p-6 h-fit space-y-6 shadow-elegant sticky top-28">
          <h2 className="font-serif text-2xl">Récapitulatif</h2>

          <div className="space-y-3 border-b border-border pb-5">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground truncate max-w-[160px]">{item.name} × {item.quantity}</span>
                <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-accent">{formatPrice(totalPrice)}</span>
          </div>

          {/* Auth status indicator */}
          {!isAuthenticated ? (
            <div className="bg-secondary/60 rounded-xl p-3 flex items-start gap-2 text-xs text-muted-foreground">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
              <span>Vous devrez vous <strong>connecter ou créer un compte</strong> pour finaliser votre commande.</span>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-3 flex items-center gap-2 text-xs text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
              <User className="w-4 h-4 shrink-0" />
              <span>Connecté en tant que <strong>{currentUser?.first_name}</strong></span>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full py-4 bg-accent text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-accent/90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 shadow-glow"
          >
            {isProcessing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Traitement...</>
            ) : (
              <><ShoppingBag className="h-4 w-4" /> Passer ma commande</>
            )}
          </button>

          {whatsAppLink && (
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block w-full py-3 bg-green-600 text-white rounded-xl font-bold text-center hover:bg-green-700 transition"
            >
              Envoyer la commande via WhatsApp
            </a>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Votre commande sera enregistrée et vous serez contacté(e) rapidement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;

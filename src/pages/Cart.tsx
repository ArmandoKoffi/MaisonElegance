import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Minus, MessageSquare, ShoppingBag, User, Loader2, Lock, ChevronDown, X } from 'lucide-react';
import { formatPrice } from '@/data/products';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cities as villes, neighborhoodsAbidjan as adressesAbidjan, getShippingCost, getShippingCostWithBreakdown, capitalizeWords } from '@/lib/shipping';
import { cn } from '@/lib/utils';

import { toast } from 'sonner';

const WHATSAPP_NUMBER = '2250556126199';

interface CustomDropdownOption {
  name: string;
  price?: number | null;
}

interface CustomDropdownProps {
  options: CustomDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  required?: boolean;
  name: string;
}

const CustomDropdown = ({ options, value, onChange, placeholder, label, required, name }: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-5 py-3 bg-background border border-border rounded-xl text-sm font-bold shadow-soft hover:border-accent hover:shadow-md transition-all active:scale-95"
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, type: "spring" }}
              className="absolute left-0 right-0 top-full mt-2 z-[100] bg-card border border-border rounded-2xl shadow-elegant overflow-hidden"
            >
              {options.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => {
                    onChange(option.name);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-6 py-4 text-sm transition-all duration-300 hover:pl-8 hover:pr-4 hover:bg-secondary relative overflow-hidden group/item flex justify-between",
                    value === option.name ? "text-accent font-bold bg-accent/5" : "text-foreground/70"
                  )}
                >
                  <span className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 bg-accent transition-all duration-300",
                    value === option.name ? "opacity-100" : "opacity-0 -translate-x-full group-hover/item:opacity-100 group-hover/item:translate-x-0"
                  )} />
                  <span>{option.name}</span>
                  {option.price !== undefined && option.price > 0 && (
                    <span className="text-accent font-bold ml-2">{option.price.toLocaleString()} FCFA</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
        />
      </div>
    </div>
  );
};

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { currentUser, isAuthenticated, isLoading, checkPhoneUniqueness } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'confirm-existing' | 'change-address'>('confirm-existing');
  
  // Temporary address state for the modal
  const [tempCity, setTempCity] = useState<string>("");
  const [tempAddress, setTempAddress] = useState<string>("");
  const [tempOtherCityAddress, setTempOtherCityAddress] = useState<string>("");
  const [tempPhone, setTempPhone] = useState<string>("");
  const [useTempAddress, setUseTempAddress] = useState(false);

  // Calculate shipping cost
  let activeCity = useTempAddress ? tempCity : currentUser?.city;
  let activeAddress = useTempAddress ? tempAddress : currentUser?.address;
  
  // Handle the case where tempCity is "Autre ville"
  if (useTempAddress && tempCity === "Autre ville" && tempOtherCityAddress) {
    activeCity = tempOtherCityAddress;
    activeAddress = tempOtherCityAddress;
  }
  
  const activePhone = useTempAddress ? tempPhone : currentUser?.phone;
  const shippingCost = getShippingCost(activeCity, activeAddress, totalPrice);
  const shippingBreakdown = getShippingCostWithBreakdown(activeCity, activeAddress, totalPrice);
  const finalTotal = totalPrice + shippingCost;

  // Reset temp state when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      setModalStep('confirm-existing');
      setTempCity("");
      setTempAddress("");
      setTempOtherCityAddress("");
      setUseTempAddress(false);
    }
  }, [isModalOpen]);

  const openModal = () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour passer une commande.');
      navigate('/connexion', { state: { from: '/panier' } });
      return;
    }
    setIsModalOpen(true);
  };

  const confirmExistingAddress = async () => {
    setUseTempAddress(false);
    await processCheckout();
  };

  const goToChangeAddress = () => {
    setModalStep('change-address');
    // Initialize temp state with current user data
    const userCity = currentUser?.city || "";
    if (userCity && userCity.toLowerCase() === "abidjan") {
      setTempCity("Abidjan");
      setTempAddress(currentUser?.address || "");
      setTempOtherCityAddress("");
    } else if (userCity) {
      setTempCity("Autre ville");
      setTempAddress("");
      setTempOtherCityAddress(userCity);
    } else {
      setTempCity("");
      setTempAddress("");
      setTempOtherCityAddress("");
    }
    setTempPhone(currentUser?.phone || "");
    setUseTempAddress(true);
  };

  const confirmNewAddress = async () => {
    if (tempCity === "Abidjan" && !tempAddress) {
      toast.error('Veuillez sélectionner un quartier pour la livraison à Abidjan.');
      return;
    }
    if (tempCity === "Autre ville" && !tempOtherCityAddress) {
      toast.error('Veuillez saisir le nom de votre ville.');
      return;
    }
    if (!tempPhone) {
      toast.error('Veuillez renseigner un numéro de téléphone.');
      return;
    }

    // Vérifier l'unicité du numéro de téléphone si modifié
    if (tempPhone !== currentUser?.phone) {
      const { isAvailable, error } = await checkPhoneUniqueness(tempPhone, currentUser?.id);
      if (error) {
        toast.error(error);
        return;
      }
      if (!isAvailable) {
        toast.error('Ce numéro de téléphone est déjà utilisé par un autre compte. Veuillez l\'utiliser pour vous connecter.');
        return;
      }
    }

    await processCheckout();
  };

  const cancelChangeAddress = () => {
    setModalStep('confirm-existing');
    setTempCity("");
    setTempAddress("");
    setTempOtherCityAddress("");
    setTempPhone("");
    setUseTempAddress(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const processCheckout = async () => {
    if (!currentUser) return;

    let cityToUse = useTempAddress ? tempCity : currentUser.city;
    let addressToUse = useTempAddress ? tempAddress : currentUser.address;
    
    // Handle "Autre ville" case
    if (useTempAddress && tempCity === "Autre ville" && tempOtherCityAddress) {
      const capitalized = capitalizeWords(tempOtherCityAddress);
      cityToUse = capitalized;
      addressToUse = capitalized;
    }
    
    const phoneToUse = useTempAddress ? tempPhone : currentUser.phone;

    setIsProcessing(true);

    try {
      const orderNumber = `CMD-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const isPickup = !cityToUse;
      
      // Formater l'adresse correctement
      let formattedAddress = "";
      if (isPickup) {
        formattedAddress = "Retrait en magasin";
      } else if (addressToUse === cityToUse) {
        formattedAddress = addressToUse || '—';
      } else {
        formattedAddress = `${addressToUse || '—'}, ${cityToUse || '—'}`;
      }

      // Insert Order
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        order_number: orderNumber,
        user_id: currentUser.id!,
        customer_name: `${currentUser.first_name} ${currentUser.last_name}`,
        customer_email: currentUser.email,
        customer_phone: phoneToUse || '',
        customer_address: formattedAddress,
        total_amount: finalTotal,
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
        `*Nouvelle commande — ${orderNumber}*`,
        ``,
        `*Client :* ${currentUser.first_name} ${currentUser.last_name}`,
        `*Téléphone :* ${phoneToUse || 'Non renseigné'}`,
        isPickup ? `*Mode :* RETRAIT EN MAGASIN` : `*Adresse :* ${formattedAddress}`,
        ``,
        `*Articles commandés :*`,
        itemsText,
        ``,
        `*Sous-total :* ${formatPrice(totalPrice)}`,
        isPickup ? `*Frais de livraison :* GRATUIT` : `*${cityToUse === "Abidjan" ? "Frais de livraison" : "Frais d'expédition"} :* ${formatPrice(shippingCost)}`,
        ``,
        `*TOTAL : ${formatPrice(finalTotal)}*`,
        ``,
        `Date : ${new Date().toLocaleString('fr-FR')}`,
      ].join('\n');

      // Send notification to admin silently (user never sees this happen)
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      // Open WhatsApp link in a new tab for the user
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank');
      }

      // Clear cart
      clearCart();
      setIsModalOpen(false);

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

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-3 border-b border-border pb-5">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate max-w-[160px]">{item.name} × {item.quantity}</span>
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  <motion.div 
                    key="subtotal"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-semibold">{formatPrice(totalPrice)}</span>
                  </motion.div>

                  {isAuthenticated && (
                    <>
                      {activeCity ? (
                        <motion.div
                          key="shipping"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2 overflow-hidden"
                        >
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {activeCity === "Abidjan" ? "Frais de livraison" : "Frais d'expédition"}
                            </span>
                            <span className="font-semibold text-accent">{formatPrice(shippingCost)}</span>
                          </div>
                          {activeCity !== "Abidjan" && (
                            <div className="pl-4 text-xs text-muted-foreground space-y-1 border-l-2 border-accent/30">
                              <p><strong>Livreur :</strong> {formatPrice(shippingBreakdown.livreur)}</p>
                              <p><strong>Compagnie d'expédition :</strong> {formatPrice(shippingBreakdown.compagnie)}</p>
                              <p className="pt-1">
                                {totalPrice <= 10000 
                                  ? "Calcul : 1500 FCFA + 1000 FCFA = 2500 FCFA"
                                  : `Calcul : 1500 FCFA + 10% du sous-total = ${formatPrice(1500 + 0.1 * totalPrice)} FCFA`}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="pickup"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex justify-between text-sm overflow-hidden"
                        >
                          <span className="text-muted-foreground">Mode de récupération</span>
                          <span className="font-semibold text-green-600">Retrait en magasin</span>
                        </motion.div>
                      )}
                    </>
                  )}

                  <motion.div 
                    key="total"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="flex justify-between text-xl font-bold pt-2 border-t border-border"
                  >
                    <span>Total</span>
                    <span className="text-accent">{formatPrice(finalTotal)}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}

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
            onClick={openModal}
            disabled={isProcessing || isLoading}
            className="w-full py-4 bg-accent text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-accent/90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 shadow-glow"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Chargement...</>
            ) : isProcessing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Traitement...</>
            ) : (
              <><ShoppingBag className="h-4 w-4" /> Passer ma commande</>
            )}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Votre commande sera enregistrée et vous serez contacté(e) rapidement.
          </p>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-card border border-border rounded-[2rem] p-8 shadow-elegant w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <AnimatePresence mode="wait">
                {modalStep === 'confirm-existing' ? (
                  <motion.div
                    key="confirm-existing"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="font-serif text-3xl mb-6">Confirmer votre commande</h2>

                    <div className="bg-secondary/30 rounded-xl p-5 mb-6">
                      <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">
                        Vos coordonnées de livraison
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Téléphone : </strong> {currentUser?.phone || 'Non renseigné'}
                        </p>
                        {currentUser?.city ? (
                          <>
                            <p className="text-sm">
                              <strong>Ville : </strong> {currentUser.city}
                            </p>
                            {currentUser.city === "Abidjan" && currentUser.address && (
                              <p className="text-sm">
                                <strong>Quartier : </strong> {currentUser.address}
                              </p>
                            )}
                            <p className="text-sm font-bold text-accent">
                              Frais : {formatPrice(shippingCost)}
                            </p>
                            {currentUser.city !== "Abidjan" && (
                              <div className="pl-4 text-xs text-muted-foreground space-y-1 border-l-2 border-accent/30">
                                <p><strong>Livreur :</strong> {formatPrice(shippingBreakdown.livreur)}</p>
                                <p><strong>Compagnie d'expédition :</strong> {formatPrice(shippingBreakdown.compagnie)}</p>
                                <p className="pt-1">
                                  {totalPrice <= 10000 
                                    ? "Calcul : 1500 FCFA + 1000 FCFA = 2500 FCFA"
                                    : `Calcul : 1500 FCFA + 10% du sous-total = ${formatPrice(1500 + 0.1 * totalPrice)} FCFA`}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-green-700 dark:text-green-400 font-bold">
                            🏪 Retrait en magasin (gratuit)
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-8">
                      Voulez-vous continuer avec cette adresse ?
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={goToChangeAddress}
                        className="py-3 border border-border rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all"
                      >
                        Non, changer
                      </button>
                      <button
                        onClick={confirmExistingAddress}
                        disabled={isProcessing}
                        className="py-3 bg-accent text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-accent/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Traitement...</>
                        ) : 'Oui, confirmer'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="change-address"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="font-serif text-3xl mb-6">Choisissez votre adresse de livraison</h2>

                    <div className="space-y-5 mb-8">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                          Numéro de téléphone
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="tel"
                            value={tempPhone}
                            onChange={(e) => setTempPhone(e.target.value.replace(/[^\d+]/g, ''))}
                            onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^\d+]/g, '')}
                            placeholder="Ex: 0707070707"
                            maxLength={15}
                            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-sm font-bold shadow-soft focus:border-accent transition-all outline-none"
                          />
                        </div>
                      </div>

                      <CustomDropdown
                        name="city"
                        label="Ville"
                        options={villes}
                        value={tempCity}
                        onChange={(val) => {
                          setTempCity(val);
                          if (val !== "Abidjan") {
                            setTempAddress("");
                          }
                        }}
                        placeholder="Sélectionnez une ville (ou laissez vide pour retrait en magasin)"
                        required={false}
                      />

                      <AnimatePresence>
                        {tempCity === "Abidjan" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-visible"
                          >
                            <div className="pt-1">
                              <CustomDropdown
                                name="address"
                                label="Quartier"
                                options={adressesAbidjan}
                                value={tempAddress}
                                onChange={setTempAddress}
                                placeholder="Sélectionnez un quartier"
                                required={false}
                              />
                            </div>
                          </motion.div>
                        )}
                        {tempCity === "Autre ville" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-visible"
                          >
                            <div className="pt-4 space-y-2">
                              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Votre ville
                              </label>
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                  type="text"
                                  value={tempOtherCityAddress}
                                  onChange={(e) => setTempOtherCityAddress(e.target.value)}
                                  onBlur={(e) => setTempOtherCityAddress(capitalizeWords(e.target.value))}
                                  placeholder="Ex: San Pédro"
                                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-sm font-bold shadow-soft focus:border-accent transition-all outline-none"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Recap of new shipping cost */}
                      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                        <h4 className="font-bold text-sm mb-2">Prévisualisation des frais</h4>
                        {tempCity ? (
                          <div className="space-y-2">
                            {tempCity === "Abidjan" && tempAddress ? (
                              <>
                                <p className="text-sm">
                                  Livraison à {tempAddress} : <strong className="text-accent">{formatPrice(getShippingCost(tempCity, tempAddress, totalPrice))}</strong>
                                </p>
                              </>
                            ) : tempCity === "Autre ville" && tempOtherCityAddress ? (
                              <>
                                <p className="text-sm">
                                  Expédition à {tempOtherCityAddress} : <strong className="text-accent">{formatPrice(getShippingCost(tempOtherCityAddress, tempOtherCityAddress, totalPrice))}</strong>
                                </p>
                                <div className="pl-4 text-xs text-muted-foreground space-y-1 border-l-2 border-accent/30">
                                  <p><strong>Livreur :</strong> {formatPrice(getShippingCostWithBreakdown(tempOtherCityAddress, tempOtherCityAddress, totalPrice).livreur)}</p>
                                  <p><strong>Compagnie d'expédition :</strong> {formatPrice(getShippingCostWithBreakdown(tempOtherCityAddress, tempOtherCityAddress, totalPrice).compagnie)}</p>
                                  <p className="pt-1">
                                    {totalPrice <= 10000 
                                      ? "Calcul : 1500 FCFA + 1000 FCFA = 2500 FCFA"
                                      : `Calcul : 1500 FCFA + 10% du sous-total = ${formatPrice(1500 + 0.1 * totalPrice)} FCFA`}
                                  </p>
                                </div>
                              </>
                            ) : tempCity !== "Abidjan" && tempCity !== "Autre ville" ? (
                              <>
                                <p className="text-sm">
                                  Expédition à {tempCity} : <strong className="text-accent">{formatPrice(getShippingCost(tempCity, tempAddress, totalPrice))}</strong>
                                </p>
                                <div className="pl-4 text-xs text-muted-foreground space-y-1 border-l-2 border-accent/30">
                                  <p><strong>Livreur :</strong> {formatPrice(getShippingCostWithBreakdown(tempCity, tempAddress, totalPrice).livreur)}</p>
                                  <p><strong>Compagnie d'expédition :</strong> {formatPrice(getShippingCostWithBreakdown(tempCity, tempAddress, totalPrice).compagnie)}</p>
                                  <p className="pt-1">
                                    {totalPrice <= 10000 
                                      ? "Calcul : 1500 FCFA + 1000 FCFA = 2500 FCFA"
                                      : `Calcul : 1500 FCFA + 10% du sous-total = ${formatPrice(1500 + 0.1 * totalPrice)} FCFA`}
                                  </p>
                                </div>
                              </>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-sm text-green-700 dark:text-green-400 font-bold">
                            🏪 Retrait en magasin (gratuit)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={cancelChangeAddress}
                        className="py-3 border border-border rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all"
                      >
                        Retour
                      </button>
                      <button
                        onClick={confirmNewAddress}
                        disabled={isProcessing}
                        className="py-3 bg-accent text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-accent/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Traitement...</>
                        ) : 'Confirmer'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;

import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase, type Order, type OrderItem } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ShoppingBag, Clock, CheckCircle, Truck, XCircle, 
  Package, LogOut, ChevronDown, ChevronUp, MapPin, Phone, Mail, Edit3, Save
} from 'lucide-react';
import { toast } from 'sonner';
import { cities, neighborhoodsAbidjan, capitalizeWords } from '@/lib/shipping';
import { CustomDropdown } from '@/components/ui/custom-dropdown';

const statusConfig: Record<Order['status'], { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'En attente',  color: 'bg-yellow-100 text-yellow-800 border-yellow-200',  icon: Clock },
  confirmed: { label: 'Confirmée',   color: 'bg-blue-100 text-blue-800 border-blue-200',       icon: CheckCircle },
  paid:      { label: 'Payée',       color: 'bg-green-100 text-green-800 border-green-200',     icon: CheckCircle },
  shipped:   { label: 'Expédiée',    color: 'bg-purple-100 text-purple-800 border-purple-200',  icon: Truck },
  delivered: { label: 'Livrée',      color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Package },
  cancelled: { label: 'Annulée',     color: 'bg-red-100 text-red-800 border-red-200',           icon: XCircle },
};

type OrderWithItems = Order & { order_items: OrderItem[] };

const MyAccount = () => {
  const { currentUser, isAdmin, isAuthenticated, isLoading, logout, updateProfile } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCity, setEditCity] = useState<string>("");
  const [editAddress, setEditAddress] = useState<string>("");
  const [editOtherCityAddress, setEditOtherCityAddress] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [editPanelAnimating, setEditPanelAnimating] = useState(false);
  const queryClient = useQueryClient();

  // Extract login phone number from the email
  const loginPhoneNumber = currentUser?.email ? currentUser.email.split('@')[0] : '';

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OrderWithItems[];
    },
    enabled: !!currentUser?.id
  });

  // Real-time subscription for order status updates
  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${currentUser.id}`
        },
        async (payload) => {
          // Get the updated order with its items
          const { data: updatedOrder, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching updated order:', error);
            return;
          }

          // Update the query cache
          queryClient.setQueryData(['my-orders', currentUser.id], (oldOrders: OrderWithItems[]) => {
            return oldOrders.map(order => 
              order.id === updatedOrder.id ? updatedOrder : order
            );
          });

          // Show toast notification
          const statusLabel = statusConfig[updatedOrder.status as keyof typeof statusConfig].label;
          toast.success(`Statut de commande mis à jour : ${updatedOrder.order_number} est ${statusLabel}`);
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, queryClient]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold">Chargement...</div>;
  }

  if (!isAuthenticated) return <Navigate to="/connexion" state={{ from: '/mon-compte' }} replace />;

  const handleEdit = () => {
    const userCity = currentUser?.city || "";
    if (userCity && userCity.toLowerCase() === "abidjan") {
      setEditCity("Abidjan");
      setEditAddress(currentUser?.address || "");
      setEditOtherCityAddress("");
    } else if (userCity) {
      setEditCity("Autre ville");
      setEditAddress("");
      setEditOtherCityAddress(userCity);
    } else {
      setEditCity("");
      setEditAddress("");
      setEditOtherCityAddress("");
    }
    setEditPhone(currentUser?.phone || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    let finalCity = "";
    let finalAddress = "";

    if (editCity === "Abidjan") {
      if (!editAddress) {
        toast.error('Veuillez sélectionner la commune pour Abidjan.');
        return;
      }
      finalCity = "Abidjan";
      finalAddress = editAddress;
    } else if (editCity === "Autre ville") {
      if (!editOtherCityAddress) {
        toast.error('Veuillez saisir le nom de votre ville.');
        return;
      }
      const capitalizedCity = capitalizeWords(editOtherCityAddress);
      finalCity = capitalizedCity;
      finalAddress = capitalizedCity;
    }

    if (!editPhone) {
      toast.error('Veuillez renseigner un numéro de téléphone.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile({ 
        city: finalCity, 
        address: finalAddress,
        phone: editPhone
      });

      if (result.success) {
        setIsEditing(false);
        toast.success(
          <div className="space-y-1">
            <p className="font-bold">Profil mis à jour avec succès !</p>
            <p className="text-xs">
              Rappel : Pour vous connecter, utilisez toujours votre numéro initial : <span className="font-bold">{loginPhoneNumber}</span>
            </p>
          </div>
        );
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Erreur lors de la mise à jour.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Vous êtes déconnecté(e).');
  };

  const totalSpent = orders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="min-h-screen bg-mesh py-12 md:py-20">
      <div className="container-elegance max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center shadow-glow">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl">
                {currentUser?.first_name} <span className="text-accent">{currentUser?.last_name}</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Mon espace personnel</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:text-destructive hover:border-destructive transition-all"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12 relative overflow-visible">
          {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 bg-card border border-border rounded-[2rem] p-6 shadow-soft space-y-4 relative overflow-visible">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl">Mes informations</h2>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm font-semibold hover:bg-accent/20 transition-colors">
                <Edit3 className="w-4 h-4" />
                Modifier
              </button>
            )}
          </div>
          
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.25 }}
                onAnimationStart={() => setEditPanelAnimating(true)}
                onAnimationComplete={() => setEditPanelAnimating(false)}
                className={`space-y-4 ${editPanelAnimating ? "overflow-hidden" : "overflow-visible"}`}>
                
                {/* Important message about login phone number */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">
                        Information importante
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <span className="font-bold block mb-1">
                          Numéro de connexion (IMMUTABLE) : {loginPhoneNumber}
                        </span>
                        C'est le numéro que vous devrez <span className="font-bold">toujours utiliser pour vous connecter</span> à votre compte. Il ne peut pas être modifié.
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <span className="font-bold">Numéro de contact :</span> Le numéro que vous allez saisir ci-dessous sera utilisé par notre service client pour vous contacter au sujet de vos commandes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Numéro de téléphone (contact)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/[^\d+]/g, ''))}
                      onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^\d+]/g, '')}
                      placeholder="Ex: 0707070707"
                      maxLength={15}
                      className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-sm font-bold shadow-soft focus:border-accent transition-all outline-none"
                    />
                  </div>
                </div>

                <CustomDropdown
                  name="city"
                  label="Ville"
                  options={[{ name: "Retrait en magasin", price: null }, ...cities]}
                  value={editCity}
                  onChange={(val) => {
                    setEditCity(val === "Retrait en magasin" ? "" : val);
                    if (val !== "Abidjan") {
                      setEditAddress("");
                    }
                  }}
                  placeholder="Sélectionnez une ville (ou retrait en magasin)"
                  required={false}
                />
                
                <AnimatePresence>
                  {editCity === "Abidjan" && (
                    <motion.div
                      key="address"
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-visible">
                      <CustomDropdown
                        name="address"
                        label="Quartier"
                        options={neighborhoodsAbidjan}
                        value={editAddress}
                        onChange={setEditAddress}
                        placeholder="Sélectionnez la commune"
                        required={false}
                      />
                    </motion.div>
                  )}
                  {editCity === "Autre ville" && (
                    <motion.div
                      key="other-city"
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-visible pt-4 space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Votre ville</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={editOtherCityAddress}
                          onChange={(e) => setEditOtherCityAddress(e.target.value)}
                          onBlur={(e) => setEditOtherCityAddress(capitalizeWords(e.target.value))}
                          placeholder="Ex: San Pédro"
                          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-sm font-bold shadow-soft focus:border-accent transition-all outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-secondary/50 transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                    {isSaving ? (
                      <>Enregistrement...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="viewing"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.25 }}
                className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-muted-foreground font-bold">{currentUser?.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-muted-foreground">
                    {!currentUser?.city ? "Retrait en magasin" : 
                     currentUser?.city === "Abidjan" && currentUser?.address ? `${currentUser.address}, ${currentUser.city}` :
                     currentUser?.city}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-accent to-accent/80 text-white rounded-[2rem] p-6 shadow-glow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-6 h-6 opacity-80" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-70">Total dépensé</span>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold">{formatPrice(totalSpent)}</p>
              <p className="text-sm opacity-70 mt-1">{orders.length} commande{orders.length > 1 ? 's' : ''} au total</p>
            </div>
          </motion.div>
        </div>

        {/* Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-serif text-2xl mb-6">Mes commandes</h2>

          {orders.length === 0 ? (
            <div className="text-center py-20 bg-card/50 rounded-[2rem] border border-dashed border-border">
              <ShoppingBag className="w-12 h-12 text-accent/40 mx-auto mb-4" />
              <p className="font-serif text-2xl mb-3">Aucune commande</p>
              <p className="text-muted-foreground text-sm mb-6">Vous n'avez pas encore passé de commande.</p>
              <Link to="/produits" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-accent/90 transition-all shadow-glow">
                <ShoppingBag className="w-4 h-4" />
                Découvrir la boutique
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const { label, color, icon: Icon } = statusConfig[order.status];
                const isExpanded = expandedOrder === order.id;
                return (
                  <div key={order.id} className="bg-card border border-border rounded-[1.5rem] shadow-soft overflow-hidden">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id!)}
                      className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{order.order_number}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${color}`}>
                          <Icon className="w-3 h-3" />
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-accent">{formatPrice(order.total_amount)}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden border-t border-border"
                        >
                          <div className="p-5 space-y-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Articles commandés</p>
                            {order.order_items?.map((item, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-cover rounded-xl" />
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">{item.product_name}</p>
                                  <p className="text-xs text-muted-foreground">Qté : {item.quantity}</p>
                                </div>
                                <span className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                            {order.notes && (
                              <div className="mt-3 p-3 bg-secondary/50 rounded-xl text-xs text-muted-foreground">
                                <strong>Note :</strong> {order.notes}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyAccount;
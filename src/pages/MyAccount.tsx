import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase, type Order, type OrderItem } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ShoppingBag, Clock, CheckCircle, Truck, XCircle, 
  Package, LogOut, ChevronDown, ChevronUp, MapPin, Phone, Mail
} from 'lucide-react';
import { toast } from 'sonner';

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
  const { currentUser, isAdmin, isAuthenticated, isLoading, logout, login, register } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold">Chargement...</div>;
  }

  if (!isAuthenticated) return <Navigate to="/connexion" state={{ from: '/mon-compte' }} replace />;

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

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-card border border-border rounded-[2rem] p-6 shadow-soft"
          >
            <h2 className="font-serif text-xl mb-5">Mes informations</h2>
            <div className="space-y-3">
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
            </div>
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

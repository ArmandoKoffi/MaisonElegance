import { useState } from 'react';
import { supabase, type Order, type OrderItem } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatPrice } from '@/data/products';
import { Search, ChevronDown, ChevronUp, Phone, Mail, MapPin, MessageSquare, Check } from 'lucide-react';
import { toast } from 'sonner';

type OrderWithItems = Order & { order_items: OrderItem[] };

const STATUS_OPTIONS: { value: Order['status']; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'paid', label: 'Payée' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];

const STATUS_COLORS: Record<Order['status'], string> = {
  pending:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  paid:      'bg-green-100 text-green-800 border-green-200',
  shipped:   'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const ManageOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['admin_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as OrderWithItems[];
    }
  });

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const filtered = orders.filter(o => {
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: Order['status'] }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
      toast.success(`Commande mise à jour : ${STATUS_OPTIONS.find(s => s.value === variables.status)?.label}`);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du statut.');
    }
  });

  const updateStatus = (id: number, status: Order['status']) => {
    updateStatusMutation.mutate({ id, status });
  };

  const contactOnWhatsApp = (order: OrderWithItems) => {
    const num = order.customer_phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Bonjour ${order.customer_name}, concernant votre commande ${order.order_number}...`);
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
        <p className="text-muted-foreground mt-1">{orders.length} commande{orders.length > 1 ? 's' : ''} au total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-3 flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, numéro..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filterStatus === 'all' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600'}`}
          >Toutes ({orders.length})</button>
          {STATUS_OPTIONS.map(s => {
            const count = orders.filter(o => o.status === s.value).length;
            return (
              <button
                key={s.value}
                onClick={() => setFilterStatus(s.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filterStatus === s.value ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600'}`}
              >{s.label} ({count})</button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center text-muted-foreground">
          Aucune commande trouvée.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const isExpanded = expandedOrder === order.id;
            return (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{order.order_number}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.order_items?.length} article{order.order_items?.length > 1 ? 's' : ''}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status]}`}>
                      {STATUS_OPTIONS.find(s => s.value === order.status)?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{formatPrice(order.total_amount)}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div className="space-y-3">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Client</h3>
                        <div className="flex items-center gap-2 text-sm font-semibold">{order.customer_name}</div>
                        <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-accent" />{order.customer_phone}</div>
                        <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-accent" />{order.customer_address}</div>
                        <button
                          onClick={() => contactOnWhatsApp(order)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Contacter sur WhatsApp
                        </button>
                      </div>

                      {/* Articles */}
                      <div className="space-y-3">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Articles</h3>
                        {order.order_items?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <img src={item.product_image} alt={item.product_name} className="w-10 h-10 object-cover rounded-lg" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{item.product_name}</p>
                              <p className="text-xs text-muted-foreground">Qté : {item.quantity}</p>
                            </div>
                            <span className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Update */}
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">Mettre à jour le statut</h3>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s.value}
                            onClick={() => updateStatus(order.id, s.value)}
                            disabled={updateStatusMutation.isPending}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                              order.status === s.value
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                            }`}
                          >
                            {order.status === s.value && <Check className="w-3 h-3" />}
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;

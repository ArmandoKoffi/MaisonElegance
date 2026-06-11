import { supabase, type DbUser, type Order } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/data/products';
import { Search, User, Phone, Mail, MapPin, MessageSquare, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

const ManageClients = () => {
  const { data: clients = [] } = useQuery({
    queryKey: ['admin_clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DbUser[];
    }
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin_orders_clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (error) throw error;
      return data as Order[];
    }
  });

  const [search, setSearch] = useState('');

  const filtered = clients.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const getClientOrders = (userId: string) => orders.filter(o => o.user_id === userId);
  const getClientSpent = (userId: string) => 
    orders.filter(o => o.user_id === userId && (o.status === 'paid' || o.status === 'delivered'))
           .reduce((s, o) => s + o.total_amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Clients</h1>
        <p className="text-muted-foreground mt-1">{clients.length} client{clients.length > 1 ? 's' : ''} inscrit{clients.length > 1 ? 's' : ''}</p>
      </div>

      <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un client..."
          className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center text-muted-foreground">
          {clients.length === 0 ? 'Aucun client inscrit pour le moment.' : 'Aucun résultat trouvé.'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(client => {
            const clientOrders = getClientOrders(client.id);
            const spent = getClientSpent(client.id);
            const phone = client.phone ? client.phone.replace(/\D/g, '') : '';
            return (
              <div key={client.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{client.first_name} {client.last_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Inscrit le {new Date(client.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />{client.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />{client.phone || '—'}
                  </div>
                  {(client.address || client.city) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />{client.address || '—'}, {client.city || '—'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <ShoppingCart className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <p className="font-bold text-sm">{clientOrders.length}</p>
                    <p className="text-xs text-muted-foreground">commande{clientOrders.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2.5 text-center">
                    <p className="font-bold text-sm text-green-700">{formatPrice(spent)}</p>
                    <p className="text-xs text-green-600">dépensé</p>
                  </div>
                </div>

                <button
                  onClick={() => window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Bonjour ${client.first_name},`)}`, '_blank')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Contacter sur WhatsApp
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageClients;

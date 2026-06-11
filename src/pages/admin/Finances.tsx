import { supabase, type Order, type DbUser } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/data/products';
import { TrendingUp, TrendingDown, DollarSign, Clock, Package2, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Finances = () => {
  const { data: orders = [] } = useQuery({
    queryKey: ['admin_finances_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (error) throw error;
      return data as Order[];
    }
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['admin_finances_clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*').eq('role', 'client');
      if (error) throw error;
      return data as DbUser[];
    }
  });

  const paid = orders.filter(o => o.status === 'paid' || o.status === 'delivered');
  const pending = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
  const cancelled = orders.filter(o => o.status === 'cancelled');

  const totalRevenue = paid.reduce((s, o) => s + o.total_amount, 0);
  const pendingRevenue = pending.reduce((s, o) => s + o.total_amount, 0);
  const cancelledRevenue = cancelled.reduce((s, o) => s + o.total_amount, 0);

  // Monthly breakdown
  const now = new Date();
  const months: { month: string; revenue: number; orders: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const monthStart = d.getTime();
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).getTime() + 86400000;
    const monthOrders = paid.filter(o => {
      const time = new Date(o.created_at).getTime();
      return time >= monthStart && time < monthEnd;
    });
    months.push({
      month: label.charAt(0).toUpperCase() + label.slice(1),
      revenue: monthOrders.reduce((s, o) => s + o.total_amount, 0),
      orders: monthOrders.length,
    });
  }

  const pieData = [
    { name: 'Encaissé', value: totalRevenue, color: '#10b981' },
    { name: 'En attente', value: pendingRevenue, color: '#f59e0b' },
    { name: 'Perdu (Annulé)', value: cancelledRevenue, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const avgOrderValue = paid.length > 0 ? totalRevenue / paid.length : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Finances & Bilan</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble financière de votre boutique</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Encaissé</span>
          </div>
          <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{paid.length} commande{paid.length > 1 ? 's' : ''} payée{paid.length > 1 ? 's' : ''}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">En attente</span>
          </div>
          <p className="text-2xl font-bold">{formatPrice(pendingRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{pending.length} commande{pending.length > 1 ? 's' : ''} à traiter</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Panier moyen</span>
          </div>
          <p className="text-2xl font-bold">{formatPrice(avgOrderValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">Par commande payée</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Perdu</span>
          </div>
          <p className="text-2xl font-bold">{formatPrice(cancelledRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{cancelled.length} commande{cancelled.length > 1 ? 's' : ''} annulée{cancelled.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-lg mb-6">Répartition du chiffre d'affaires</h2>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Aucune donnée financière disponible.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatPrice(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-lg mb-6">Bilan mensuel (6 derniers mois)</h2>
          <div className="space-y-3">
            {months.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-semibold text-sm capitalize">{m.month}</p>
                  <p className="text-xs text-muted-foreground">{m.orders} commande{m.orders > 1 ? 's' : ''}</p>
                </div>
                <p className={`font-bold text-sm ${m.revenue > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {formatPrice(m.revenue)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
            <span className="font-bold">Total 6 mois</span>
            <span className="font-bold text-green-600">{formatPrice(months.reduce((s, m) => s + m.revenue, 0))}</span>
          </div>
        </div>
      </div>

      {/* Clients Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-lg">Clients actifs</h2>
        </div>
        {clients.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">Aucun client inscrit pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Client</th>
                  <th className="text-left pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                  <th className="text-right pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Commandes</th>
                  <th className="text-right pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Dépenses</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => {
                  const clientOrders = orders.filter(o => o.user_id === client.id);
                  const spent = clientOrders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((s, o) => s + o.total_amount, 0);
                  return (
                    <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-semibold">{client.first_name} {client.last_name}</td>
                      <td className="py-3 text-muted-foreground">{client.email}</td>
                      <td className="py-3 text-right">{clientOrders.length}</td>
                      <td className="py-3 text-right font-bold text-green-600">{formatPrice(spent)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finances;

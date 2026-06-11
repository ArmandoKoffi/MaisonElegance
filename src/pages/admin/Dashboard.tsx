import { supabase, type Order } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/data/products';
import { 
  Package, Users, ShoppingCart, TrendingUp, Clock, CheckCircle, 
  Eye, BarChart3, ArrowUpRight, Truck, XCircle, AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const statusConfig: Record<Order['status'], { label: string; color: string; dot: string }> = {
  pending:   { label: 'En attente',  color: 'text-yellow-600', dot: 'bg-yellow-400' },
  confirmed: { label: 'Confirmée',   color: 'text-blue-600',   dot: 'bg-blue-400' },
  paid:      { label: 'Payée',       color: 'text-green-600',  dot: 'bg-green-500' },
  shipped:   { label: 'Expédiée',    color: 'text-purple-600', dot: 'bg-purple-400' },
  delivered: { label: 'Livrée',      color: 'text-emerald-600', dot: 'bg-emerald-500' },
  cancelled: { label: 'Annulée',     color: 'text-red-600',    dot: 'bg-red-400' },
};

// Group visits by day for chart
function groupVisitsByDay(visits: Array<{created_at: string}>, days = 14) {
  const now = new Date();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
    const dayEnd = dayStart + 86400000;
    const count = visits.filter(v => {
      const time = new Date(v.created_at).getTime();
      return time >= dayStart && time < dayEnd;
    }).length;
    result.push({ date: label, visites: count });
  }
  return result;
}

// Group orders revenue by day
function groupRevenueByDay(orders: Order[], days = 14) {
  const now = new Date();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
    const dayEnd = dayStart + 86400000;
    const revenue = orders
      .filter(o => {
        const time = new Date(o.created_at).getTime();
        return time >= dayStart && time < dayEnd && (o.status === 'paid' || o.status === 'delivered');
      })
      .reduce((sum, o) => sum + o.total_amount, 0);
    result.push({ date: label, revenus: revenue });
  }
  return result;
}

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin_dashboard_stats'],
    queryFn: async () => {
      const [
        { data: products },
        { data: categories },
        { data: clients },
        { data: orders },
        { data: visits }
      ] = await Promise.all([
        supabase.from('products').select('id'),
        supabase.from('categories').select('id'),
        supabase.from('users').select('id').eq('role', 'client'),
        supabase.from('orders').select('*'),
        supabase.from('visits').select('*')
      ]);

      return {
        products: products || [],
        categories: categories || [],
        clients: clients || [],
        orders: orders as Order[] || [],
        visits: visits || []
      };
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement des statistiques...</div>;
  }

  const { products = [], categories = [], clients = [], orders = [], visits = [] } = data || {};

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'delivered');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingRevenue = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').reduce((sum, o) => sum + o.total_amount, 0);

  // Unique visitors (by session_id)
  const uniqueVisitors = new Set(visits.map(v => v.session_id)).size;

  const visitData = groupVisitsByDay(visits);
  const revenueData = groupRevenueByDay(orders);

  // Recent orders (last 5)
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  // Top pages
  const pageCounts: Record<string, number> = {};
  visits.forEach(v => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1; });
  const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const stats = [
    {
      title: 'Produits', value: products.length, sub: `${categories.length} catégorie${categories.length > 1 ? 's' : ''}`,
      icon: Package, gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Clients inscrits', value: clients.length, sub: 'Comptes vérifiés',
      icon: Users, gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Commandes', value: orders.length, sub: `${pendingOrders.length} en attente`,
      icon: ShoppingCart, gradient: 'from-orange-500 to-orange-600', light: 'bg-orange-50 text-orange-600'
    },
    {
      title: 'Chiffre d\'affaires', value: formatPrice(totalRevenue), sub: `${formatPrice(pendingRevenue)} en attente`,
      icon: TrendingUp, gradient: 'from-green-500 to-emerald-600', light: 'bg-green-50 text-green-600',
      isRevenue: true
    },
    {
      title: 'Visiteurs uniques', value: uniqueVisitors, sub: `${visits.length} pages vues`,
      icon: Eye, gradient: 'from-accent to-accent/70', light: 'bg-accent/10 text-accent'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Alerts */}
      {pendingOrders.length > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">
            {pendingOrders.length} commande{pendingOrders.length > 1 ? 's' : ''} en attente de confirmation.
          </span>
          <a href="/admin/commandes" className="ml-auto text-xs font-bold underline whitespace-nowrap">Voir maintenant →</a>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.light}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className={`text-2xl font-bold ${stat.isRevenue ? 'text-lg' : ''}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.title}</div>
              <div className="text-xs text-muted-foreground/60 mt-0.5">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-accent" />
            <h2 className="font-bold text-lg">Trafic — 14 derniers jours</h2>
          </div>
          {visits.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Aucune visite enregistrée pour le moment.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={visitData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorVisites" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(28, 85%, 55%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(28, 85%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v} visite${Number(v) > 1 ? 's' : ''}`, 'Trafic']} />
                <Area type="monotone" dataKey="visites" stroke="hsl(28, 85%, 55%)" fill="url(#colorVisites)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-lg">Revenus — 14 derniers jours</h2>
          </div>
          {paidOrders.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Aucun revenu enregistré pour le moment.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${formatPrice(Number(v))}`, 'Revenus']} />
                <Bar dataKey="revenus" radius={[4, 4, 0, 0]}>
                  {revenueData.map((_, i) => (
                    <Cell key={i} fill={`hsl(142, 60%, ${35 + (i % 3) * 5}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Orders + Top Pages */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              <h2 className="font-bold text-lg">Dernières commandes</h2>
            </div>
            <a href="/admin/commandes" className="text-xs font-bold text-accent hover:underline">Voir tout →</a>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">Aucune commande reçue.</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const { label, dot } = statusConfig[order.status];
                return (
                  <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.order_number}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">{formatPrice(order.total_amount)}</p>
                      <p className={`text-xs ${statusConfig[order.status].color}`}>{label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Eye className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-lg">Pages les plus visitées</h2>
          </div>
          <div className="space-y-4">
            {topPages.length === 0 ? (
              <div className="py-5 text-center text-muted-foreground text-sm">Aucune donnée.</div>
            ) : (
              topPages.map(([page, count], i) => (
                <div key={page} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                    <span className="text-sm font-medium text-gray-700">{page}</span>
                  </div>
                  <span className="text-sm font-bold">{count} vue{count > 1 ? 's' : ''}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

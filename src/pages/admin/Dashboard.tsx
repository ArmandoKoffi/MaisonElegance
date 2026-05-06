import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const productsCount = useLiveQuery(() => db.products.count());
  const categoriesCount = useLiveQuery(() => db.categories.count());

  const stats = [
    { title: 'Total Produits', value: productsCount || 0, icon: Package, color: 'text-blue-500' },
    { title: 'Catégories', value: categoriesCount || 0, icon: TrendingUp, color: 'text-green-500' },
    { title: 'Ventes (Simulées)', value: 12, icon: ShoppingCart, color: 'text-purple-500' },
    { title: 'Clients (Simulés)', value: 45, icon: Users, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue dans votre espace d'administration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Activités Récentes</h3>
        <p className="text-muted-foreground italic">Aucune activité récente à afficher.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;

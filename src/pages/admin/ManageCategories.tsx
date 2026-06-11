import { useState } from 'react';
import { supabase, type Category } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Tag, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ManageCategories = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data as Category[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(categoryData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      toast.success(editingCategory ? 'Catégorie modifiée' : 'Catégorie ajoutée');
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde de la catégorie');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
      toast.success('Catégorie supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const imageFile = (e.currentTarget.querySelector('#image') as HTMLInputElement).files?.[0];
    let image = editingCategory?.image || '';

    if (imageFile) {
      image = await fileToDataURL(imageFile);
    }

    if (!image && !editingCategory) {
      toast.error("L'image est requise pour une nouvelle catégorie.");
      return;
    }

    saveMutation.mutate({ name, slug, image });
  };

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
          <p className="text-muted-foreground">Gérez les univers affichés sur la page d'accueil.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingCategory(null); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Nouvelle Catégorie
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la catégorie</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={editingCategory?.name} 
                  required 
                  placeholder="Ex: Sacs à main, Chaussures..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image (Recommandée: Paysage de haute qualité)</Label>
                <Input 
                  id="image" 
                  name="image" 
                  type="file" 
                  accept="image/*" 
                  required={!editingCategory} 
                />
                {editingCategory?.image && (
                  <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden border">
                    <img src={editingCategory.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingCategory ? 'Enregistrer les modifications' : 'Créer la catégorie'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-muted-foreground">
          Aucune catégorie trouvée. Commencez par en créer une !
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="h-48 overflow-hidden relative">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setIsDialogOpen(true);
                    }}
                    className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg shadow-sm transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="font-bold">{category.name}</div>
                <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                  /{category.slug}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCategories;

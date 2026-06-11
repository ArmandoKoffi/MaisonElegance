import React, { useState } from 'react';
import { supabase, type Product, type Category } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice } from '@/data/products';
import { toast } from 'sonner';

const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ManageProducts = () => {
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['admin_products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data as Category[];
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImagesPreview, setAdditionalImagesPreview] = useState<string[]>([]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      if (editingProduct?.id) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_products'] });
      toast.success(editingProduct ? 'Produit mis à jour' : 'Produit ajouté');
      setIsDialogOpen(false);
      setEditingProduct(null);
      setMainImagePreview(null);
      setAdditionalImagesPreview([]);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Une erreur est survenue');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_products'] });
      toast.success('Produit supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const stockCount = Number(formData.get('stockCount'));
    
    // Handle Images
    const mainImageFile = (e.currentTarget.querySelector('#image') as HTMLInputElement).files?.[0];
    const additionalImageFiles = (e.currentTarget.querySelector('#additionalImages') as HTMLInputElement).files;

    let mainImage = editingProduct?.image || '';
    if (mainImageFile) {
      mainImage = await fileToDataURL(mainImageFile);
    }

    let gallery = editingProduct?.images || [mainImage];
    if (additionalImageFiles && additionalImageFiles.length > 0) {
      const newGallery = await Promise.all(Array.from(additionalImageFiles).map(fileToDataURL));
      gallery = [mainImage, ...newGallery];
    } else if (mainImageFile) {
      // If only main image changed, update first element of gallery
      gallery = [mainImage, ...(editingProduct?.images?.slice(1) || [])];
    }

    const productData = {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      gender: formData.get('gender') as 'Homme' | 'Femme' | 'Enfant',
      description: formData.get('description') as string,
      long_description: formData.get('longDescription') as string,
      image: mainImage,
      images: gallery,
      stock_count: stockCount,
      stock: (stockCount === 0 ? 'out' : stockCount < 10 ? 'low' : 'available') as 'available' | 'low' | 'out',
    };

    saveProductMutation.mutate(productData);
  };

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Produits</h1>
          <p className="text-muted-foreground">Ajoutez, modifiez ou supprimez vos articles.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingProduct(null); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" name="name" defaultValue={editingProduct?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input id="price" name="price" type="number" defaultValue={editingProduct?.price} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockCount">Quantité en Stock</Label>
                <Input id="stockCount" name="stockCount" type="number" defaultValue={editingProduct?.stock_count || 50} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select name="category" defaultValue={editingProduct?.category || 'Sacs à main'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Pour Qui ?</Label>
                <Select name="gender" defaultValue={editingProduct?.gender || 'Femme'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Femme">Femme</SelectItem>
                    <SelectItem value="Homme">Homme</SelectItem>
                    <SelectItem value="Enfant">Enfant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description Courte</Label>
                <Textarea id="description" name="description" defaultValue={editingProduct?.description} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="longDescription">Description Détaillée</Label>
                <Textarea id="longDescription" name="longDescription" defaultValue={editingProduct?.long_description} required className="min-h-[100px]" />
              </div>
              
              <div className="space-y-2 col-span-2 border p-4 rounded-xl">
                <Label>Images du Produit</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-xs text-muted-foreground">Image Principale {!editingProduct && '*'}</Label>
                    <Input id="image" type="file" accept="image/*" required={!editingProduct} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(file) {
                        const url = URL.createObjectURL(file);
                        setMainImagePreview(url);
                      }
                    }} />
                    {(mainImagePreview || editingProduct?.image) && (
                      <img src={mainImagePreview || editingProduct?.image} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalImages" className="text-xs text-muted-foreground">Images de Galerie (Optionnel, Max 4)</Label>
                    <Input id="additionalImages" type="file" accept="image/*" multiple onChange={(e) => {
                      const files = e.target.files;
                      if(files) {
                        const urls = Array.from(files).slice(0, 4).map(f => URL.createObjectURL(f));
                        setAdditionalImagesPreview(urls);
                      }
                    }} />
                    <div className="flex gap-2 flex-wrap">
                      {(additionalImagesPreview.length > 0 ? additionalImagesPreview : (editingProduct?.images?.slice(1) || [])).map((img, i) => (
                        <img key={i} src={img} alt={`Gallery ${i}`} className="w-12 h-12 object-cover rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="col-span-2" disabled={saveProductMutation.isPending}>
                {saveProductMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un produit..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="flex items-center gap-3">
                  <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                  <div className="font-medium">{product.name}</div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock === 'available' ? 'bg-green-100 text-green-700' :
                    product.stock === 'low' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {product.stock_count} en stock
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditingProduct(product);
                    setIsDialogOpen(true);
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucun produit trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManageProducts;

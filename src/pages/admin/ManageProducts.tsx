import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product } from '@/lib/db';
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
  const products = useLiveQuery(() => db.products.toArray());
  const categories = useLiveQuery(() => db.categories.toArray());
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImagesPreview, setAdditionalImagesPreview] = useState<string[]>([]);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      longDescription: formData.get('longDescription') as string,
      image: mainImage,
      images: gallery,
      stockCount,
      stock: (stockCount === 0 ? 'out' : stockCount < 10 ? 'low' : 'available') as 'available' | 'low' | 'out',
      createdAt: editingProduct?.createdAt || Date.now(),
    };

    try {
      if (editingProduct?.id) {
        await db.products.update(editingProduct.id, productData);
        toast.success('Produit mis à jour');
      } else {
        await db.products.add(productData);
        toast.success('Produit ajouté');
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      setMainImagePreview(null);
      setAdditionalImagesPreview([]);
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      await db.products.delete(id);
      toast.success('Produit supprimé');
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
                <Input id="stockCount" name="stockCount" type="number" defaultValue={editingProduct?.stockCount || 50} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select name="category" defaultValue={editingProduct?.category || 'sacs'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(c => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Genre</Label>
                <Select name="gender" defaultValue={editingProduct?.gender || 'Enfant'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Homme">Homme</SelectItem>
                    <SelectItem value="Femme">Femme</SelectItem>
                    <SelectItem value="Enfant">Enfant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image Principale</Label>
                <Input 
                  id="image" 
                  name="image" 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) setMainImagePreview(await fileToDataURL(file));
                  }}
                />
                {(mainImagePreview || editingProduct?.image) && (
                  <img 
                    src={mainImagePreview || editingProduct?.image} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded-md border mt-2" 
                  />
                )}
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="additionalImages">Galerie Photos (Sélectionnez plusieurs images)</Label>
                <Input 
                  id="additionalImages" 
                  name="additionalImages" 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files) {
                      const previews = await Promise.all(Array.from(files).map(fileToDataURL));
                      setAdditionalImagesPreview(previews);
                    }
                  }}
                />
                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                  {additionalImagesPreview.length > 0 ? (
                    additionalImagesPreview.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-md border" />
                    ))
                  ) : editingProduct?.images && editingProduct.images.length > 1 ? (
                    editingProduct.images.slice(1).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-md border" />
                    ))
                  ) : null}
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Petite Description</Label>
                <Input id="description" name="description" defaultValue={editingProduct?.description} required />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="longDescription">Description Détaillée</Label>
                <Textarea id="longDescription" name="longDescription" className="min-h-[100px]" defaultValue={editingProduct?.longDescription} required />
              </div>
              <Button type="submit" className="col-span-2 mt-4">
                {editingProduct ? 'Enregistrer les modifications' : 'Ajouter le produit'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Rechercher un produit ou une catégorie..." 
          className="border-none shadow-none focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="capitalize">{product.category}</TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>{product.gender}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleDelete(product.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
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

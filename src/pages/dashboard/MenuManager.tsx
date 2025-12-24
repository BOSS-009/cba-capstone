import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMenuItems, useMenuCategories } from '@/hooks/useMenuItems';
import { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Image,
  Tag,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function MenuManager() {
  const { menuItems, isLoading, addMenuItem, updateMenuItem, deleteMenuItem } = useMenuItems();
  const { categories } = useMenuCategories();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAvailability = (id: string, currentStatus: boolean) => {
    updateMenuItem(id, { isAvailable: !currentStatus });
  };

  const deleteItem = (id: string) => {
    deleteMenuItem(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     // Simple form handling (in production use React Hook Form)
     const form = e.target as HTMLFormElement;
     const formData = new FormData(form);
     
     const itemData = {
        name: formData.get('name') as string,
        price: Number(formData.get('price')),
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        image_url: formData.get('image') as string,
        variants: editingItem?.variants || [],
        addons: editingItem?.addons || [],
        isAvailable: editingItem ? editingItem.isAvailable : true,
        category_id: null // Basic implementation without category IDs mapping for now
     };

     if (editingItem) {
        updateMenuItem(editingItem.id, itemData);
     } else {
        addMenuItem(itemData);
     }
     
     setIsDialogOpen(false);
     setEditingItem(null);
  };

  if (isLoading) return <div>Loading menu...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Menu Manager</h2>
          <p className="text-muted-foreground">Manage your restaurant's menu items</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground btn-ripple">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-primary/20 max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    name="name"
                    id="name"
                    placeholder="Wagyu Steak"
                    className="bg-muted border-muted"
                    defaultValue={editingItem?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground font-semibold">₹</span>
                    <Input
                      name="price"
                      id="price"
                      type="number"
                      placeholder="850"
                      className="pl-8 bg-muted border-muted"
                      defaultValue={editingItem?.price}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  name="category"
                  id="category"
                  className="w-full h-10 px-3 rounded-md bg-muted border border-muted text-foreground"
                  defaultValue={editingItem?.category || 'Mains'}
                >
                  {categories.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  name="description"
                  id="description"
                  placeholder="Premium A5 Wagyu beef..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md bg-muted border border-muted text-foreground resize-none"
                  defaultValue={editingItem?.description}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="image"
                    id="image"
                    placeholder="https://..."
                    className="pl-10 bg-muted border-muted"
                    defaultValue={editingItem?.image_url}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  {editingItem ? 'Update' : 'Add Item'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-muted"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/10">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Item</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-primary/5 hover:bg-muted/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                    {item.category}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-semibold text-primary">₹{item.price}</span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleAvailability(item.id, item.isAvailable)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                      item.isAvailable
                        ? 'bg-neon-green/20 text-neon-green'
                        : 'bg-neon-red/20 text-neon-red'
                    )}
                  >
                    {item.isAvailable ? (
                      <>
                        <Eye className="w-3 h-3" /> Available
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" /> Hidden
                      </>
                    )}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsDialogOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

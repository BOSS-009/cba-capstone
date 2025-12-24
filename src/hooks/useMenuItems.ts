import { db } from '@/integrations/firebase/client';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface MenuVariant {
  name: string;
  price: number;
}

export interface MenuAddon {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  category_id: string | null;
  price: number;
  description: string;
  image_url: string;
  variants: MenuVariant[];
  addons: MenuAddon[];
  isAvailable: boolean;
}


// Helper to safely parse JSON arrays
const parseJsonArray = <T>(json: any[] | null): T[] => {
  if (!json || !Array.isArray(json)) return [];
  return json as T[];
};

export function useMenuItems() {
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      // Fetch items
      const itemsSnapshot = await getDocs(query(collection(db, 'menu_items'), orderBy('name')));

      // Fetch categories for mapping (manual join)
      const categoriesSnapshot = await getDocs(query(collection(db, 'menu_categories'), orderBy('sort_order')));
      const categoryMap: Record<string, string> = {};
      categoriesSnapshot.forEach(doc => {
        const data = doc.data();
        categoryMap[doc.id] = data.name;
      });

      return itemsSnapshot.docs.map((doc): MenuItem => {
        const item = doc.data();
        // Assuming category_id is stored in Firestore, or category name directly
        // Fallback to mapped ID or raw string
        const categoryName = item.category || (item.category_id ? categoryMap[item.category_id] : 'Uncategorized');

        return {
          id: doc.id,
          name: item.name,
          category: categoryName,
          category_id: item.category_id,
          price: Number(item.price),
          description: item.description || '',
          image_url: item.image_url || 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400',
          variants: item.variants || [],
          addons: item.addons || [],
          isAvailable: item.is_available ?? true,
        };
      });
    },
  });

  const queryClient = useQueryClient();

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      await addDoc(collection(db, 'menu_items'), {
        ...item,
        is_available: item.isAvailable, // map back to db field
        price: Number(item.price)
      });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item added');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add item');
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const dbUpdates: any = { ...updates };
      if (updates.isAvailable !== undefined) {
        dbUpdates.is_available = updates.isAvailable;
        delete dbUpdates.isAvailable;
      }
      if (updates.price !== undefined) {
        dbUpdates.price = Number(updates.price);
      }

      const ref = doc(db, 'menu_items', id);
      await updateDoc(ref, dbUpdates);
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update item');
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'menu_items', id));
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete item');
    }
  };

  return {
    menuItems,
    isLoading,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
  };
}

export function useMenuCategories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const snapshot = await getDocs(query(collection(db, 'menu_categories'), orderBy('sort_order')));
      const names = snapshot.docs.map(doc => doc.data().name);
      return ['All', ...names];
    },
  });

  return {
    categories,
    isLoading,
  };
}

import { useState, useEffect } from 'react';
import { db, auth } from '@/integrations/firebase/client';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  variants?: string[];
  addons?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  table_id: string | null;
  tableNumber: number;
  waiter_id: string | null;
  waiterName: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
  total_amount: number;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_id: string | null;
  notes: string | null;
  created_at: any; // Firestore Timestamp or Date
  updated_at: any;
}

export function useOrders() {
  const queryClient = useQueryClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time subscription with optimized data fetching
  useEffect(() => {
    let unsubscribe: () => void = () => { };
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        // 1. Fetch metadata (Tables & Profiles) ONCE to avoid N+1 problem
        // In a real app with thousands of users, you'd use a server-side join or denormalization.
        const [tablesSnap, profilesSnap] = await Promise.all([
          getDocs(collection(db, 'restaurant_tables')),
          getDocs(collection(db, 'profiles'))
        ]);

        if (!isMounted) return;

        const tablesMap: Record<string, number> = {};
        tablesSnap.forEach(doc => {
          tablesMap[doc.id] = doc.data().number;
        });

        const profilesMap: Record<string, string> = {};
        profilesSnap.forEach(doc => {
          profilesMap[doc.id] = doc.data().name;
        });

        // 2. Set up detailed Order subscription
        // REMOVED orderBy to prevent strict Index requirements (Sorting done on client)
        const q = query(
          collection(db, 'orders'),
          where('status', 'in', ['pending', 'preparing', 'ready', 'served'])
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          if (!isMounted) return;

          const fetchedOrders = snapshot.docs.map((doc) => {
            const data = doc.data();

            // Synchronous lookup using pre-fetched maps
            const tableNumber = data.tableNumber || (data.table_id ? tablesMap[data.table_id] : 0);
            const waiterName = data.waiterName || (data.waiter_id ? profilesMap[data.waiter_id] : 'Unknown');

            return {
              id: doc.id,
              table_id: data.table_id,
              tableNumber: tableNumber,
              waiter_id: data.waiter_id,
              waiterName: waiterName,
              items: data.items || [],
              status: data.status,
              total_amount: data.total_amount,
              payment_status: data.payment_status,
              payment_id: data.payment_id,
              notes: data.notes,
              created_at: data.created_at ? data.created_at.toDate() : new Date(),
              updated_at: data.updated_at ? data.updated_at.toDate() : new Date(),
            } as Order;
          });

          // Client-side Sort
          fetchedOrders.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

          setOrders(fetchedOrders);
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching orders:", error);
          if (isMounted) setIsLoading(false);
        });

      } catch (error) {
        console.error("Error initializing orders hook:", error);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updated_at: serverTimestamp()
      });
    },
    onSuccess: () => {
      // No need to invalidate queries as onSnapshot handles updates
      toast.success('Order status updated');
    },
    onError: (error) => {
      toast.error(`Failed to update order: ${error.message}`);
    },
  });

  const createOrder = useMutation({
    mutationFn: async ({
      tableId,
      items,
      totalAmount,
      notes,
    }: {
      tableId: string;
      items: OrderItem[];
      totalAmount: number;
      notes?: string;
    }) => {
      const user = auth.currentUser;
      const batch = writeBatch(db);

      // 1. Create Order
      const sanitizedItems = items.map(item => ({
        ...item,
        variants: item.variants || [],
        addons: item.addons || [],
        notes: item.notes || null
      }));

      const newOrderRef = doc(collection(db, 'orders'));
      batch.set(newOrderRef, {
        table_id: tableId,
        waiter_id: user?.uid || null,
        items: sanitizedItems,
        total_amount: totalAmount,
        notes: notes || null,
        status: 'pending',
        payment_status: 'unpaid',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // 2. Update Table Status
      const tableRef = doc(db, 'restaurant_tables', tableId);
      batch.update(tableRef, {
        status: 'occupied',
        current_order_id: newOrderRef.id
      });

      await batch.commit();
      return newOrderRef.id;
    },
    onSuccess: () => {
      // onSnapshot handles updates
      toast.success('Order sent to kitchen!');
    },
    onError: (error) => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });

  return {
    orders,
    isLoading,
    updateOrderStatus: updateOrderStatus.mutate,
    createOrder: createOrder.mutateAsync,
    isCreating: createOrder.isPending,
  };
}

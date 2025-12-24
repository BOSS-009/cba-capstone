import { db } from '@/integrations/firebase/client';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  current_order_id: string | null;
}

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'restaurant_tables'), orderBy('number'));

    // Real-time subscription
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTables: Table[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedTables.push({
          id: doc.id,
          number: data.number,
          capacity: data.capacity,
          status: data.status,
          current_order_id: data.current_order_id,
        });
      });
      setTables(fetchedTables);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching tables:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    tables,
    isLoading,
    availableTables: tables.filter((t) => t.status === 'available'),
  };
}

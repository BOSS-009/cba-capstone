import { db } from '@/integrations/firebase/client';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface Reservation {
  id: string;
  table_id: string;
  customer_name: string;
  customer_phone: string | null;
  party_size: number;
  reservation_time: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes: string | null;
  created_at: string;
}

export function useReservations() {
  const queryClient = useQueryClient();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time subscription
  useEffect(() => {
    const q = query(
      collection(db, 'reservations'),
      orderBy('reservation_time', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReservations: Reservation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedReservations.push({
          id: doc.id,
          table_id: data.table_id,
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          party_size: data.party_size,
          reservation_time: data.reservation_time,
          status: data.status,
          notes: data.notes,
          created_at: data.created_at ? new Date(data.created_at.seconds * 1000).toISOString() : new Date().toISOString(),
        });
      });
      setReservations(fetchedReservations);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching reservations:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createReservation = useMutation({
    mutationFn: async (data: {
      table_id: string;
      customer_name: string;
      customer_phone?: string;
      party_size: number;
      reservation_time: string;
      notes?: string;
    }) => {
      await addDoc(collection(db, 'reservations'), {
        table_id: data.table_id,
        customer_name: data.customer_name,
        party_size: data.party_size,
        reservation_time: data.reservation_time,
        customer_phone: data.customer_phone || null,
        notes: data.notes || null,
        status: 'confirmed',
        created_at: serverTimestamp()
      });
    },
    onSuccess: () => {
      // onSnapshot handles updates
      toast.success('Reservation created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create reservation: ${error.message}`);
    },
  });

  const updateReservation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Reservation> & { id: string }) => {
      const ref = doc(db, 'reservations', id);
      await updateDoc(ref, data);
    },
    onSuccess: () => {
      toast.success('Reservation updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update reservation: ${error.message}`);
    },
  });

  const cancelReservation = useMutation({
    mutationFn: async (id: string) => {
      const ref = doc(db, 'reservations', id);
      await updateDoc(ref, { status: 'cancelled' });
    },
    onSuccess: () => {
      toast.success('Reservation cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel reservation: ${error.message}`);
    },
  });

  const getTableReservations = (tableId: string) => {
    return reservations.filter(
      (r) => r.table_id === tableId && r.status === 'confirmed'
    );
  };

  const getUpcomingReservations = () => {
    const now = new Date();
    return reservations.filter(
      (r) => new Date(r.reservation_time) >= now && r.status === 'confirmed'
    );
  };

  return {
    reservations,
    isLoading,
    createReservation,
    updateReservation,
    cancelReservation,
    getTableReservations,
    getUpcomingReservations,
  };
}

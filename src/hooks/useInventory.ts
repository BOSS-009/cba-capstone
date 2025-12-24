import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    orderBy
} from 'firebase/firestore';
import { toast } from 'sonner';

export interface InventoryItem {
    id: string;
    itemName: string;
    quantity: number;
    unit: string;
    thresholdLevel: number;
    category: string;
}

export function useInventory() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'inventory'), orderBy('itemName'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: InventoryItem[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                items.push({
                    id: doc.id,
                    itemName: data.itemName,
                    quantity: data.quantity,
                    unit: data.unit,
                    thresholdLevel: data.thresholdLevel,
                    category: data.category
                });
            });
            setInventory(items);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching inventory:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
        try {
            await addDoc(collection(db, 'inventory'), item);
            toast.success('Inventory item added');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add item');
        }
    };

    const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
        try {
            const ref = doc(db, 'inventory', id);
            await updateDoc(ref, updates);
            toast.success('Inventory item updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update item');
        }
    };

    const deleteInventoryItem = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'inventory', id));
            toast.success('Inventory item deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete item');
        }
    };

    return {
        inventory,
        isLoading,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem
    };
}

import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import {
    collection,
    query,
    where,
    onSnapshot,
    Timestamp,
    orderBy,
    limit
} from 'firebase/firestore';

export interface DashboardStats {
    activeOrders: number;
    todaysRevenue: number;
    totalOrdersToday: number;
    recentOrders: any[];
    isLoading: boolean;
}

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats>({
        activeOrders: 0,
        todaysRevenue: 0,
        totalOrdersToday: 0,
        recentOrders: [],
        isLoading: true
    });

    useEffect(() => {
        // Define "Today" (Start of day)
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Query 1: Today's Orders (for Revenue and Count)
        // We need 'paid' orders for revenue, but maybe 'pending' for active count?
        // Actually, asking for ALL orders from today is best for revenue stats.

        const todayQuery = query(
            collection(db, 'orders'),
            where('created_at', '>=', Timestamp.fromDate(startOfDay))
        );

        const unsubscribeToday = onSnapshot(todayQuery, (snapshot) => {
            let revenue = 0;
            let active = 0;
            let total = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                total++;

                // Revenue: sum total_amount if payment_status is 'paid' OR if status is 'paid'/'served'?
                // Usually 'paid' status implies received money.
                if (data.status === 'paid' || data.payment_status === 'paid') {
                    revenue += (data.total_amount || 0);
                }

                // Active: anything not paid/served? Or specifically pending/preparing/ready?
                if (['pending', 'preparing', 'ready'].includes(data.status)) {
                    active++;
                }
            });

            setStats(prev => ({
                ...prev,
                todaysRevenue: revenue,
                activeOrders: active,
                totalOrdersToday: total,
                isLoading: false
            }));
        }, (error) => {
            console.error("Error fetching dashboard stats:", error);
        });

        // Query 2: Recent Orders (Global list, maybe last 5)
        // This might be redundant if we just use the today list, but "Recent" might span yesterday if today is empty.
        const recentQuery = query(
            collection(db, 'orders'),
            orderBy('created_at', 'desc'),
            limit(5)
        );

        const unsubscribeRecent = onSnapshot(recentQuery, (snapshot) => {
            const recent = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setStats(prev => ({
                ...prev,
                recentOrders: recent
            }));
        });

        return () => {
            unsubscribeToday();
            unsubscribeRecent();
        };
    }, []);

    return stats;
}

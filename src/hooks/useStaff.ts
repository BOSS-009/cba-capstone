import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { UserRole } from '@/types';

export interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    joinedAt?: any;
}

export function useStaff() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // We need to fetch both profiles and roles
        // Real-time listener on profiles is a good start
        const unsubscribeProfiles = onSnapshot(collection(db, 'profiles'), (snapshot) => {
            const profiles = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as any[];

            // For each profile, we need to fetch their role. 
            // Ideally we would listen to user_roles too.
            // For simplicity/performance in this demo, we'll listen to user_roles collection as well
            // and join them client-side.
        });

        const unsubscribeRoles = onSnapshot(collection(db, 'user_roles'), (roleSnapshot) => {
            const rolesMap: Record<string, UserRole> = {};
            roleSnapshot.docs.forEach(doc => {
                rolesMap[doc.id] = doc.data().role as UserRole;
            });

            // We need profiles to join. 
            // Let's refactor to listen to both in parallel or nested? 
            // Independent listeners are fine, but we need to combine them.
        });

        // Better approach: Listen to profiles, and inside that, fetch roles one-off or listen to roles collection.
        // Given the small number of staff, listening to both collections is efficient enough.

        // Let's implement a combined listener approach
        const unsub1 = onSnapshot(collection(db, 'profiles'), (profileSnap) => {
            const rawProfiles = profileSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

            // Fetch roles immediately to merge
            // Note: nesting simple onSnapshot inside might cause race conditions if not careful, 
            // but for a "Staff List" page, eventual consistency is fine.
            // Let's just listen to roles separately and merge in state? 
            // No, let's use a single effect that sets up both listeners and merges them.
        });

        return () => {
            unsub1();
        }
    }, []);

    // Let's retry the implementation with a cleaner React pattern
    useEffect(() => {
        let profilesData: any[] = [];
        let rolesData: Record<string, UserRole> = {};

        const mergeAndSet = () => {
            if (profilesData.length === 0) {
                // Wait? Or set empty?
            }

            const merged = profilesData.map(p => ({
                id: p.id,
                name: p.name || 'Unknown',
                email: p.email || 'No Email',
                role: rolesData[p.id] || 'waiter', // Default or unknown
            }));
            setStaff(merged);
            setIsLoading(false);
        };

        const unsubProfiles = onSnapshot(collection(db, 'profiles'), (snap) => {
            profilesData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            mergeAndSet();
        }, (error) => {
            console.error("Error fetching profiles:", error);
            toast.error("Could not fetch staff profiles");
            setIsLoading(false);
        });

        const unsubRoles = onSnapshot(collection(db, 'user_roles'), (snap) => {
            rolesData = {};
            snap.docs.forEach(d => {
                rolesData[d.id] = d.data().role as UserRole;
            });
            mergeAndSet();
        }, (error) => {
            console.error("Error fetching roles:", error);
        });

        return () => {
            unsubProfiles();
            unsubRoles();
        };
    }, []);

    const updateStaffRole = async (userId: string, newRole: UserRole) => {
        try {
            await updateDoc(doc(db, 'user_roles', userId), { role: newRole });
            toast.success(`Role updated to ${newRole}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update role");
        }
    };

    const removeStaff = async (userId: string) => {
        // Deleting a user from client-side Auth is hard.
        // We will delete their profile and role doc, effectively "removing" them from the system.
        if (!confirm("Are you sure? This will remove their access (but not delete their Auth account).")) return;

        try {
            await deleteDoc(doc(db, 'profiles', userId));
            await deleteDoc(doc(db, 'user_roles', userId));
            toast.success("Staff member removed");
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove staff");
        }
    };

    return { staff, isLoading, updateStaffRole, removeStaff };
}

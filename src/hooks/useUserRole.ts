import { useEffect, useState } from 'react';
import { auth, db } from '@/integrations/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '@/store/useStore';
import { UserRole } from '@/types';

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, login } = useAuthStore();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (!currentUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch role from user_roles collection (doc ID = user ID)
        const roleDocRef = doc(db, 'user_roles', currentUser.uid);
        const roleDoc = await getDoc(roleDocRef);

        if (roleDoc.exists()) {
          const roleData = roleDoc.data();
          const fetchedRole = roleData.role as UserRole;
          setRole(fetchedRole);

          // Update the auth store
          if (user && user.role !== fetchedRole) {
            login({
              ...user,
              role: fetchedRole,
            });
          } else if (!user) {
            // Fetch profile to get user name (optional, if stored in profiles)
            // For now, we'll rely on what's available or fetch from 'profiles'
            const profileDocRef = doc(db, 'profiles', currentUser.uid);
            const profileDoc = await getDoc(profileDocRef);
            const profileData = profileDoc.data();

            login({
              id: currentUser.uid,
              name: profileData?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email || '',
              role: fetchedRole,
            });
          }
        } else {
          console.warn('No role found for user:', currentUser.uid);
          setRole(null);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [login, user]);

  return { role, loading };
}

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/store/useStore';
import { useUserRole } from '@/hooks/useUserRole';
import { auth } from '@/integrations/firebase/client';
import {
  ChefHat,
  LayoutDashboard,
  ShoppingCart,
  LayoutGrid,
  UtensilsCrossed,
  Menu as MenuIcon,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Mic,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';


const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'manager', 'waiter', 'kitchen', 'cashier'] },
  { icon: ShoppingCart, label: 'POS Terminal', path: '/dashboard/pos', roles: ['admin', 'manager', 'waiter', 'cashier'] },
  { icon: LayoutGrid, label: 'Table Map', path: '/dashboard/tables', roles: ['admin', 'manager', 'waiter'] },
  { icon: UtensilsCrossed, label: 'Kitchen Display', path: '/dashboard/kitchen', roles: ['admin', 'manager', 'kitchen'] },
  { icon: MenuIcon, label: 'Menu Manager', path: '/dashboard/menu', roles: ['admin', 'manager'] },
  { icon: Package, label: 'Inventory', path: '/dashboard/inventory', roles: ['admin', 'manager'] },
  { icon: Users, label: 'Staff', path: '/dashboard/staff', roles: ['admin', 'manager'] },
  { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics', roles: ['admin', 'manager'] },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings', roles: ['admin'] },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, isVoiceListening, setVoiceListening } = useAppStore();
  
  const { role: serverRole, loading: roleLoading } = useUserRole();

  const filteredMenuItems = menuItems.filter((item) =>
    serverRole ? item.roles.includes(serverRole) : false
  );

  const handleLogout = async () => {
    try {
        await auth.signOut();
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    } catch (error) {
        toast.error('Error logging out');
        console.error(error);
    }
  };



  const handleVoiceToggle = () => {
    setVoiceListening(!isVoiceListening);
    if (!isVoiceListening) {
      toast.info('Voice recognition activated');
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        className="fixed left-0 top-0 h-screen bg-card border-r border-border z-40 flex flex-col shadow-sm"
      >
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <ChefHat className="w-5 h-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-display font-bold text-foreground whitespace-nowrap overflow-hidden tracking-wide"
              >
                NEXUS
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-border">
          <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {!sidebarCollapsed && (
            <>


              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full mt-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 transition-all duration-300',
          sidebarCollapsed ? 'ml-20' : 'ml-[260px]'
        )}
      >
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              {filteredMenuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-available/10 border border-status-available/20">
              <div className="w-2 h-2 rounded-full bg-status-available" />
              <span className="text-xs text-status-available font-medium">Online</span>
            </div>

            {/* Voice Button */}
            <Button
              variant={isVoiceListening ? 'default' : 'outline'}
              size="icon"
              onClick={handleVoiceToggle}
              className={cn(
                'rounded-full transition-all',
                isVoiceListening && 'bg-primary shadow-md'
              )}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
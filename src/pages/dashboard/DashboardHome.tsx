import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useStore';
import { useTables } from '@/hooks/useTables';
import { useInventory } from '@/hooks/useInventory';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import {
  ShoppingCart,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  ChefHat,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardHome() {
  const user = useAuthStore((state) => state.user);
  const { activeOrders, todaysRevenue, recentOrders, isLoading: statsLoading } = useDashboardStats();
  const { tables } = useTables();
  const { inventory } = useInventory();

  // Stats calculation handled by hook now
  const occupiedTables = tables.filter((t) => t.status === 'occupied').length;
  
  // Low stock logic
  const lowStockItems = inventory.filter((i) => i.quantity <= i.thresholdLevel);

  const stats = [
    {
      label: 'Active Orders',
      value: activeOrders,
      icon: ShoppingCart,
      color: 'text-status-preparing',
      bgColor: 'bg-status-preparing/10',
    },
    {
      label: "Today's Revenue",
      value: `₹${todaysRevenue.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'text-status-available',
      bgColor: 'bg-status-available/10',
    },
    {
      label: 'Tables Occupied',
      value: `${occupiedTables}/${tables.length}`,
      icon: Users,
      color: 'text-status-served',
      bgColor: 'bg-status-served/10',
    },
    {
      label: 'Avg Wait Time',
      value: '12 min', // Placeholder
      icon: Clock,
      color: 'text-status-reserved',
      bgColor: 'bg-status-reserved/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Welcome back, <span className="text-primary">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening in your restaurant today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="elegant-card p-5 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp className="w-4 h-4 text-status-available" />
              <span className="text-sm text-status-available font-medium">+12%</span>
              <span className="text-sm text-muted-foreground">vs yesterday</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 elegant-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-foreground">Recent Orders</h3>
            <span className="text-sm text-muted-foreground">{recentOrders.length} orders</span>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground">No orders yet</div>
            ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        {/* Note: tableNumber/waiterName might be missing if we don't perform joins in useDashboardStats 
                            For dashboard recent orders, simplicity is key, or we can fetch them. 
                            If plain order list lacks details, we display fallback. */}
                        <p className="text-sm font-medium text-foreground">
                          Order #{order.id.slice(-4)}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.items?.length || 0} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">₹{order.total_amount}</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                          order.status === 'pending'
                            ? 'status-pending'
                            : order.status === 'preparing'
                            ? 'status-preparing'
                            : order.status === 'ready'
                            ? 'status-ready'
                            : 'status-served'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </motion.div>

        {/* Alerts & Low Stock */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="elegant-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-status-reserved" />
            <h3 className="text-lg font-display font-semibold text-foreground">Low Stock Alert</h3>
          </div>
          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-status-occupied/10 border border-status-occupied/20"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit} remaining
                    </p>
                  </div>
                  <span className="text-xs text-status-occupied font-semibold">LOW</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="w-12 h-12 text-status-available mb-3" />
              <p className="text-sm text-muted-foreground">All stock levels healthy</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
import { motion, AnimatePresence } from 'framer-motion';
import { useOrders, Order } from '@/hooks/useOrders';
import { cn } from '@/lib/utils';
import { Clock, ChefHat, CheckCircle, Bell, Timer, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type KDSStatus = 'pending' | 'preparing' | 'ready';

const statusColumns: { status: KDSStatus; label: string; icon: typeof Clock }[] = [
  { status: 'pending', label: 'New Orders', icon: Bell },
  { status: 'preparing', label: 'In Progress', icon: ChefHat },
  { status: 'ready', label: 'Ready to Serve', icon: CheckCircle },
];

export default function KitchenDisplay() {
  const { orders, isLoading, updateOrderStatus } = useOrders();

  const getOrdersByStatus = (status: KDSStatus) => {
    return orders.filter((o) => o.status === status);
  };

  const getTimeSinceOrder = (dateStr: string) => {
    const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return `${minutes} min`;
  };

  const bumpOrder = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus({ orderId, status: newStatus });
    toast.success(`Order moved to ${newStatus}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Kitchen Display</h2>
          <p className="text-muted-foreground">Real-time order management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card">
            <Timer className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Live Updates</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card">
            <Bell className="w-4 h-4 text-neon-orange animate-pulse" />
            <span className="text-sm text-foreground font-semibold">
              {getOrdersByStatus('pending').length} new
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 h-full">
        {statusColumns.map((column) => {
          const columnOrders = getOrdersByStatus(column.status);
          return (
            <div key={column.status} className="flex flex-col">
              {/* Column Header */}
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-t-xl',
                  column.status === 'pending'
                    ? 'bg-neon-orange/20 border-b-2 border-neon-orange'
                    : column.status === 'preparing'
                    ? 'bg-neon-cyan/20 border-b-2 border-neon-cyan'
                    : 'bg-neon-green/20 border-b-2 border-neon-green'
                )}
              >
                <column.icon
                  className={cn(
                    'w-5 h-5',
                    column.status === 'pending'
                      ? 'text-neon-orange'
                      : column.status === 'preparing'
                      ? 'text-neon-cyan'
                      : 'text-neon-green'
                  )}
                />
                <span className="font-display font-semibold text-foreground">{column.label}</span>
                <span
                  className={cn(
                    'ml-auto w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold',
                    column.status === 'pending'
                      ? 'bg-neon-orange text-background'
                      : column.status === 'preparing'
                      ? 'bg-neon-cyan text-background'
                      : 'bg-neon-green text-background'
                  )}
                >
                  {columnOrders.length}
                </span>
              </div>

              {/* Orders List */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-muted/20 rounded-b-xl">
                <AnimatePresence mode="popLayout">
                  {columnOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, x: 100 }}
                      className="glass-card p-4"
                    >
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">
                              {order.tableNumber}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Table {order.tableNumber}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              {order.waiterName}
                            </div>
                          </div>
                        </div>
                        <div
                          className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                            Number(getTimeSinceOrder(order.created_at).split(' ')[0]) > 15
                              ? 'bg-neon-red/20 text-neon-red'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          {getTimeSinceOrder(order.created_at)}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                          >
                            <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                              {item.quantity}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{item.name}</p>
                              {item.variants && item.variants.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {item.variants.join(', ')}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-neon-orange mt-1">Note: {item.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bump Button */}
                      {column.status === 'pending' && (
                        <Button
                          onClick={() => bumpOrder(order.id, 'preparing')}
                          className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold btn-ripple shadow-md"
                        >
                          <ChefHat className="w-4 h-4 mr-2" />
                          Start Preparing
                        </Button>
                      )}
                      {column.status === 'preparing' && (
                        <Button
                          onClick={() => bumpOrder(order.id, 'ready')}
                          className="w-full bg-green-600 text-white hover:bg-green-700 font-semibold btn-ripple shadow-md"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Ready
                        </Button>
                      )}
                      {column.status === 'ready' && (
                        <Button
                          onClick={() => bumpOrder(order.id, 'served')}
                          variant="outline"
                          className="w-full border-neon-green text-neon-green hover:bg-neon-green/10"
                        >
                          Served
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {columnOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <column.icon className="w-12 h-12 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No orders</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '@/hooks/useInventory';
import { InventoryItem } from '@/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Inventory() {
  const { inventory: items, updateInventoryItem, isLoading } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = items.filter((i) => i.quantity <= i.thresholdLevel);
  const healthyItems = items.filter((i) => i.quantity > i.thresholdLevel);

  const getStockLevel = (item: InventoryItem) => {
    const percentage = (item.quantity / (item.thresholdLevel * 3)) * 100;
    return Math.min(percentage, 100);
  };

  const restockItem = (item: InventoryItem) => {
    updateInventoryItem(item.id, { quantity: item.thresholdLevel * 3 });
  };

  if (isLoading) return <div>Loading inventory...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Inventory</h2>
          <p className="text-muted-foreground">Track and manage your stock levels</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground btn-ripple">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold text-foreground">{items.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-neon-red/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-neon-red" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-neon-red">{lowStockItems.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Healthy Stock</p>
              <p className="text-2xl font-bold text-neon-green">{healthyItems.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted border-muted"
        />
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => {
          const isLowStock = item.quantity <= item.thresholdLevel;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'glass-card p-5',
                isLowStock && 'border border-neon-red/50'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{item.itemName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit}
                  </p>
                </div>
                {isLowStock && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-neon-red/20 text-neon-red text-xs font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    Low
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Stock Level</span>
                  <span>{Math.round(getStockLevel(item))}%</span>
                </div>
                <Progress
                  value={getStockLevel(item)}
                  className={cn(
                    'h-2',
                    isLowStock ? '[&>div]:bg-neon-red' : '[&>div]:bg-neon-green'
                  )}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Threshold: {item.thresholdLevel} {item.unit}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restockItem(item)}
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Restock
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

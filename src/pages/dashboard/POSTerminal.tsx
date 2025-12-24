import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, useAppStore } from '@/store/useStore';
import { useMenuItems, useMenuCategories, MenuItem } from '@/hooks/useMenuItems';
import { useTables } from '@/hooks/useTables';
import { useOrders } from '@/hooks/useOrders';
import { useVoiceOrder } from '@/hooks/useVoiceOrder';
import { useRazorpay } from '@/hooks/useRazorpay';
import { CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Mic,
  Send,
  X,
  ChefHat,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function POSTerminal() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { items, addItem, removeItem, updateQuantity, clearCart, selectedTable, setSelectedTable, getTotal } =
    useCartStore();
  
  const { menuItems, isLoading: menuLoading } = useMenuItems();
  const { categories } = useMenuCategories();
  const { availableTables, isLoading: tablesLoading } = useTables();
  const { createOrder, isCreating } = useOrders();
  const { initiatePayment, isLoading: paymentLoading } = useRazorpay();

  const handleAddFromVoice = useCallback((voiceItems: CartItem[]) => {
    voiceItems.forEach((item) => addItem(item));
  }, [addItem]);

  const { isListening, isProcessing, toggleListening } = useVoiceOrder(menuItems, handleAddFromVoice);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && item.isAvailable;
    });
  }, [selectedCategory, searchQuery, menuItems]);

  const handleAddItem = (menuItem: MenuItem) => {
    const cartItem: CartItem = {
      id: `${menuItem.id}-${Date.now()}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: 1,
      price: menuItem.price,
    };
    addItem(cartItem);
    toast.success(`Added ${menuItem.name} to order`);
  };

  const handleSendToKitchen = async () => {
    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      await createOrder({
        tableId: selectedTable.id,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          variants: item.variants,
          addons: item.addons,
          notes: item.notes,
        })),
        totalAmount: getTotal(),
      });
      clearCart();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handlePayment = async () => {
    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const order = await createOrder({
        tableId: selectedTable.id,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          variants: item.variants,
          addons: item.addons,
          notes: item.notes,
        })),
        totalAmount: getTotal(),
      });

      const result = await initiatePayment(order.id, Math.round(getTotal() * 100));
      
      if (result.success) {
        clearCart();
      }
    } catch (error) {
      // Error handled in hooks
    }
  };

  if (menuLoading || tablesLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-10rem)]">
      {/* Menu Section */}
      <div className="flex-1 flex flex-col">
        {/* Search & Categories */}
        <div className="mb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAddItem(item)}
                className="elegant-card cursor-pointer group overflow-hidden"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <Plus className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-foreground truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  <p className="text-lg font-display font-bold text-primary mt-1">₹{item.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-96 elegant-card flex flex-col"
      >
        {/* Cart Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display font-semibold text-foreground">Order</h2>
            </div>
            {items.length > 0 && (
              <button onClick={clearCart} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Table Selection */}
          <div className="flex gap-2 flex-wrap">
            {availableTables.slice(0, 6).map((table) => (
              <button
                key={table.id}
                onClick={() => setSelectedTable({ 
                  id: table.id, 
                  number: table.number, 
                  capacity: table.capacity, 
                  status: table.status 
                })}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  selectedTable?.id === table.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                )}
              >
                T{table.number}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ChefHat className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No items yet</p>
                <p className="text-sm text-muted-foreground/60">Click on menu items to add</p>
              </div>
            ) : (
              items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-primary font-semibold">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Cart Footer */}
        <div className="p-4 border-t border-border space-y-4">
          {/* Voice Button */}
          <Button
            variant="outline"
            onClick={toggleListening}
            disabled={isProcessing}
            className={cn(
              'w-full',
              isListening && 'bg-primary/10 border-primary text-primary'
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                {isListening ? 'Stop Recording' : 'Voice Order'}
              </>
            )}
          </Button>

          {/* Total */}
          <div className="flex items-center justify-between text-lg">
            <span className="text-muted-foreground">Total</span>
            <span className="font-display font-bold text-foreground">₹{getTotal().toFixed(2)}</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleSendToKitchen}
              disabled={items.length === 0 || !selectedTable || isCreating}
              variant="outline"
              className="h-12 font-semibold"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kitchen
                </>
              )}
            </Button>
            <Button
              onClick={handlePayment}
              disabled={items.length === 0 || !selectedTable || paymentLoading || isCreating}
              className="h-12 font-semibold"
            >
              {paymentLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
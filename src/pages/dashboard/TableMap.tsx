import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTables, Table as TableType } from '@/hooks/useTables';
import { useOrders } from '@/hooks/useOrders';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useReservations } from '@/hooks/useReservations';
import { cn } from '@/lib/utils';
import { Users, Clock, DollarSign, X, Loader2, Check, CalendarPlus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '@/integrations/firebase/client';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function TableMap() {
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationData, setReservationData] = useState({
    customer_name: '',
    customer_phone: '',
    party_size: 2,
    reservation_time: '',
    notes: '',
  });
  
  const queryClient = useQueryClient();
  const { tables, isLoading } = useTables();
  const { orders } = useOrders();
  const { initiatePayment, isLoading: paymentLoading } = useRazorpay();
  const { reservations, createReservation, cancelReservation, getTableReservations, getUpcomingReservations } = useReservations();

  useEffect(() => {
    if (selectedTable) {
      const updatedTable = tables.find(t => t.id === selectedTable.id);
      if (updatedTable && (updatedTable.status !== selectedTable.status || updatedTable.current_order_id !== selectedTable.current_order_id)) {
        setSelectedTable(updatedTable);
      }
    }
  }, [tables, selectedTable]);

  const getTableOrder = (tableId: string) => {
    return orders.find((o) => o.table_id === tableId && o.status !== 'paid');
  };

  const getStatusColor = (status: TableType['status']) => {
    switch (status) {
      case 'available':
        return 'table-available';
      case 'occupied':
        return 'table-occupied';
      case 'reserved':
        return 'table-reserved';
    }
  };

  const getStatusBadgeClass = (status: TableType['status']) => {
    switch (status) {
      case 'available':
        return 'bg-status-available/15 text-status-available';
      case 'occupied':
        return 'bg-status-occupied/15 text-status-occupied';
      case 'reserved':
        return 'bg-status-reserved/15 text-status-reserved';
    }
  };

  const updateTableStatus = async (tableId: string, newStatus: TableType['status']) => {
    setIsUpdating(true);
    try {
      const tableRef = doc(db, 'restaurant_tables', tableId);
      await updateDoc(tableRef, { 
          status: newStatus, 
          current_order_id: newStatus === 'available' ? null : deleteField() 
      });

      // No need to invalidate queries as onSnapshot handles it
      toast.success(`Table status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(`Failed to update table: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePayment = async (orderId: string, amount: number) => {
    const result = await initiatePayment(orderId, Math.round(amount * 100));
    if (result.success && selectedTable) {
      // 1. Update Order Status to Paid
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'paid',
        payment_status: 'paid',
        payment_id: result.paymentId,
        updated_at: new Date() // or serverTimestamp(), but Date is fine here
      });

      // 2. Free the table
      await updateTableStatus(selectedTable.id, 'available');
      
      toast.success("Payment successful! Revenue updated.");
    }
  };

  const handleCreateReservation = async () => {
    if (!selectedTable || !reservationData.customer_name || !reservationData.reservation_time) {
      toast.error('Please fill in required fields');
      return;
    }

    await createReservation.mutateAsync({
      table_id: selectedTable.id,
      customer_name: reservationData.customer_name,
      customer_phone: reservationData.customer_phone || undefined,
      party_size: reservationData.party_size,
      reservation_time: new Date(reservationData.reservation_time).toISOString(),
      notes: reservationData.notes || undefined,
    });

    await updateTableStatus(selectedTable.id, 'reserved');

    setShowReservationForm(false);
    setReservationData({
      customer_name: '',
      customer_phone: '',
      party_size: 2,
      reservation_time: '',
      notes: '',
    });
  };

  const handleCancelReservation = async (reservationId: string) => {
    await cancelReservation.mutateAsync(reservationId);
    if (selectedTable) {
      const remainingReservations = getTableReservations(selectedTable.id).filter(r => r.id !== reservationId);
      if (remainingReservations.length === 0) {
        await updateTableStatus(selectedTable.id, 'available');
      }
    }
  };

  const upcomingReservations = getUpcomingReservations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Table Grid */}
      <div className="flex-1">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-bold text-foreground">Floor Plan</h2>
            {upcomingReservations.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-status-reserved/10 border border-status-reserved/20">
                <Calendar className="w-4 h-4 text-status-reserved" />
                <span className="text-sm text-status-reserved font-medium">
                  {upcomingReservations.length} upcoming reservation{upcomingReservations.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-status-available/20 border-2 border-status-available" />
              <span className="text-sm text-muted-foreground">Available ({tables.filter(t => t.status === 'available').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-status-occupied/20 border-2 border-status-occupied" />
              <span className="text-sm text-muted-foreground">Occupied ({tables.filter(t => t.status === 'occupied').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-status-reserved/20 border-2 border-status-reserved" />
              <span className="text-sm text-muted-foreground">Reserved ({tables.filter(t => t.status === 'reserved').length})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table, index) => {
            const tableReservations = getTableReservations(table.id);
            return (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedTable(table)}
                className={cn(
                  'elegant-card p-4 cursor-pointer transition-all relative',
                  getStatusColor(table.status),
                  selectedTable?.id === table.id && 'ring-2 ring-primary shadow-md'
                )}
              >
                {tableReservations.length > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-status-reserved flex items-center justify-center shadow-sm">
                    <Calendar className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-foreground mb-2">
                    {table.number}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{table.capacity}</span>
                  </div>
                  <div className={cn('text-xs font-medium px-2 py-1 rounded-full capitalize', getStatusBadgeClass(table.status))}>
                    {table.status}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Table Details Panel */}
      {selectedTable && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 elegant-card p-5 max-h-[calc(100vh-8rem)] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-foreground">
              Table {selectedTable.number}
            </h3>
            <button
              onClick={() => setSelectedTable(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Capacity</span>
              </div>
              <span className="font-semibold text-foreground">{selectedTable.capacity}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full',
                    selectedTable.status === 'available'
                      ? 'bg-status-available'
                      : selectedTable.status === 'occupied'
                      ? 'bg-status-occupied'
                      : 'bg-status-reserved'
                  )}
                />
                <span className="text-sm text-muted-foreground">Status</span>
              </div>
              <span className="font-semibold text-foreground capitalize">{selectedTable.status}</span>
            </div>

            {/* Quick Status Change */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Change Status</p>
              <div className="flex gap-2">
                {(['available', 'occupied', 'reserved'] as const).map((status) => (
                  <button
                    key={status}
                    disabled={isUpdating || selectedTable.status === status}
                    onClick={() => updateTableStatus(selectedTable.id, status)}
                    className={cn(
                      'flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all',
                      selectedTable.status === status
                        ? status === 'available'
                          ? 'bg-status-available text-white'
                          : status === 'occupied'
                          ? 'bg-status-occupied text-white'
                          : 'bg-status-reserved text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent'
                    )}
                  >
                    {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : (
                      selectedTable.status === status ? <Check className="w-3 h-3 mx-auto" /> : status.charAt(0).toUpperCase() + status.slice(1)
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Reservations Section */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">Reservations</h4>
                <Dialog open={showReservationForm} onOpenChange={setShowReservationForm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <CalendarPlus className="w-3 h-3" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display">New Reservation - Table {selectedTable.number}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer_name">Customer Name *</Label>
                        <Input
                          id="customer_name"
                          value={reservationData.customer_name}
                          onChange={(e) => setReservationData({ ...reservationData, customer_name: e.target.value })}
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer_phone">Phone Number</Label>
                        <Input
                          id="customer_phone"
                          value={reservationData.customer_phone}
                          onChange={(e) => setReservationData({ ...reservationData, customer_phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="party_size">Party Size *</Label>
                        <Input
                          id="party_size"
                          type="number"
                          min={1}
                          max={selectedTable.capacity}
                          value={reservationData.party_size}
                          onChange={(e) => setReservationData({ ...reservationData, party_size: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reservation_time">Date & Time *</Label>
                        <Input
                          id="reservation_time"
                          type="datetime-local"
                          value={reservationData.reservation_time}
                          onChange={(e) => setReservationData({ ...reservationData, reservation_time: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          value={reservationData.notes}
                          onChange={(e) => setReservationData({ ...reservationData, notes: e.target.value })}
                          placeholder="Special requests..."
                        />
                      </div>
                      <Button 
                        className="w-full"
                        onClick={handleCreateReservation}
                        disabled={createReservation.isPending}
                      >
                        {createReservation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Create Reservation'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {(() => {
                const tableReservations = getTableReservations(selectedTable.id);
                if (tableReservations.length === 0) {
                  return <p className="text-sm text-muted-foreground">No reservations</p>;
                }
                return (
                  <div className="space-y-2">
                    {tableReservations.map((res) => (
                      <div key={res.id} className="p-3 rounded-lg bg-status-reserved/10 border border-status-reserved/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground text-sm">{res.customer_name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleCancelReservation(res.id)}
                            disabled={cancelReservation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(res.reservation_time), 'MMM d, h:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Users className="w-3 h-3" />
                          <span>{res.party_size} guests</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Current Order Section */}
            {selectedTable.status === 'occupied' && (
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">Current Order</h4>
                {(() => {
                  const order = getTableOrder(selectedTable.id);
                  if (!order) {
                    return <p className="text-sm text-muted-foreground">No active order</p>;
                  }
                  return (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Order ID</span>
                          <span className="text-xs font-mono text-foreground">{order.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Items</span>
                          <span className="text-sm font-medium text-foreground">
                            {(order.items as any[])?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total</span>
                          <span className="text-lg font-display font-bold text-foreground">
                            ₹{order.total_amount}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          disabled={paymentLoading}
                          onClick={() => handlePayment(order.id, order.total_amount)}
                        >
                          {paymentLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4 mr-1" />
                              Pay
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
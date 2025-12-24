import { useState, useCallback } from 'react';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentResult {
  success: boolean;
  orderId: string;
  paymentId?: string;
  receipt?: any;
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);

  // Mock implementation for Free Tier / Demo
  const initiatePayment = useCallback(async (
    orderId: string,
    amount: number,
    currency: string = 'INR'
  ): Promise<PaymentResult> => {
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // MOCK SUCCESS
    try {
      toast.success('Payment successful! (Demo Mode)');
      return {
        success: true,
        orderId: orderId,
        paymentId: `pay_mock_${Date.now()}`,
        receipt: {
          payment_id: `pay_mock_${Date.now()}`,
          order_id: `order_mock_${Date.now()}`,
          status: 'captured',
          amount: amount,
          currency: currency,
          paid_at: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
      return { success: false, orderId };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    initiatePayment,
    isLoading,
  };
}

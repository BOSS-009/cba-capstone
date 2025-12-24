import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { MenuItem } from './useMenuItems';
import { CartItem } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Add types for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export function useVoiceOrder(menuItems: MenuItem[], onItemsRecognized: (items: CartItem[]) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // Can be dynamic

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        // Don't show toast for 'no-speech' or 'aborted' as it's annoying
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast.error('Voice recognition error. Please try again.');
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);
        processVoiceOrderWithGemini(transcript);
      };

      recognitionRef.current = recognition;
    }
  }, [menuItems]);

  const processVoiceOrderWithGemini = async (transcript: string) => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      toast.error("Gemini API Key missing. Please check .env file.");
      return;
    }
    console.log("Gemini API Key loaded:", import.meta.env.VITE_GEMINI_API_KEY.slice(0, 5) + "...");

    setIsProcessing(true);
    const toastId = toast.loading("Processing with AI...");

    try {
      // Using standard 1.5 Flash for speed
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

      // Optimized context: Minimal fields to save tokens and improve latency
      const simpleMenu = menuItems.map(item => ({
        id: item.id,
        name: item.name,
      }));

      const prompt = `
        You are an intelligent waiter POS system. 
        Context: The restaurant menu items are: ${JSON.stringify(simpleMenu)}.
        
        Task: Extract the customer's order from this speech transcript: "${transcript}".
        
        Rules:
        1. Fuzzy match the transcript to the closest menu item names. 
        2. Extract quantities (default to 1 if not specified).
        3. Extract any special notes or modifications (e.g., "no ice", "extra spicy").
        4. Return ONLY a valid JSON array of objects with keys: "menuItemId", "quantity" (number), "notes" (string or null).
        5. If the user is just chatting or no items match, return an empty JSON array [].
        6. Do not include markdown formatting (like \`\`\`json). Just the raw JSON.
        `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

      console.log("Gemini Response:", responseText);

      const extractedOrder = JSON.parse(responseText);

      if (Array.isArray(extractedOrder) && extractedOrder.length > 0) {
        const foundItems: CartItem[] = [];

        extractedOrder.forEach((orderItem: any) => {
          const menuItem = menuItems.find(i => i.id === orderItem.menuItemId);
          if (menuItem) {
            foundItems.push({
              id: `voice-${Date.now()}-${Math.random()}`,
              menuItemId: menuItem.id,
              name: menuItem.name,
              quantity: orderItem.quantity || 1,
              price: menuItem.price,
              notes: orderItem.notes || undefined
            });
          }
        });

        if (foundItems.length > 0) {
          onItemsRecognized(foundItems);
          toast.success(`Added ${foundItems.length} items to cart!`, { id: toastId });
        } else {
          toast.info("Could not match items to the menu.", { id: toastId });
        }

      } else {
        toast.info("I didn't catch any order items.", { id: toastId });
      }

    } catch (error: any) {
      console.error("Gemini processing error:", error);

      let errorMessage = "AI processing failed.";
      if (error.message) {
        if (error.message.includes("403")) errorMessage = "Invalid API Key or Permissions.";
        else if (error.message.includes("404")) errorMessage = "Model not found.";
        else if (error.message.includes("429")) errorMessage = "Quota exceeded.";
        else errorMessage = `Error: ${error.message.slice(0, 50)}...`;
      }

      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error("Voice recognition not supported in this browser (try Chrome).");
      return;
    }
    try {
      recognitionRef.current.start();
      toast.info("Listening... Speak now.");
    } catch (e) {
      console.error(e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isProcessing,
    toggleListening,
    startListening,
    stopListening,
  };
}

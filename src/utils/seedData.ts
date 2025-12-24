import { db } from '@/integrations/firebase/client';
import { collection, doc, writeBatch } from 'firebase/firestore';

export const seedDatabase = async () => {
    const batch = writeBatch(db);

    // 1. Create Categories (Commented out to prevent duplicates)
    // const categories = [
    //     { name: 'Starters', sort_order: 1 },
    //     { name: 'Main Course', sort_order: 2 },
    //     { name: 'Breads & Rice', sort_order: 3 },
    //     { name: 'Desserts', sort_order: 4 },
    //     { name: 'Beverages', sort_order: 5 },
    // ];

    // const categoryIds: Record<string, string> = {};

    // categories.forEach((cat) => {
    //     const ref = doc(collection(db, 'menu_categories'));
    //     categoryIds[cat.name] = ref.id;
    //     batch.set(ref, cat);
    // });

    // 2. Create Menu Items (Commented out to prevent duplicates)
    // const menuItems = [
    //     // STARTERS
    //     {
    //         name: 'Galouti Kebab',
    //         category_id: categoryIds['Starters'],
    //         price: 850,
    //         description: 'Melt-in-mouth minced lamb kebabs served on saffron parathas',
    //         image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', // Kebab platter style
    //         is_available: true,
    //         variants: [],
    //         addons: [{ name: 'Extra Paratha', price: 50 }],
    //         category: 'Starters'
    //     },
    //     {
    //         name: 'Tandoori Jhinga',
    //         category_id: categoryIds['Starters'],
    //         price: 1200,
    //         description: 'Jumbo prawns marinated in saffron and yogurt, chargrilled to perfection',
    //         image_url: 'https://images.unsplash.com/photo-1625938146369-adc83368bda7?w=400', // Grilled Shrimp
    //         is_available: true,
    //         variants: [{ name: 'Half (6 pcs)', price: 0 }, { name: 'Full (12 pcs)', price: 1000 }],
    //         addons: [],
    //         category: 'Starters'
    //     },
    //     {
    //         name: 'Paneer Tikka Sufiyana',
    //         category_id: categoryIds['Starters'],
    //         price: 650,
    //         description: 'Cottage cheese cubes stuffed with nuts and spices, grilled in tandoor',
    //         image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', // Paneer dishes
    //         is_available: true,
    //         variants: [],
    //         addons: [],
    //         category: 'Starters'
    //     },

    //     // MAINS
    //     {
    //         name: 'Murgh Makhani (Butter Chicken)',
    //         category_id: categoryIds['Main Course'],
    //         price: 950,
    //         description: 'Tandoori chicken simmered in a rich, creamy tomato and fenugreek gravy',
    //         image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', // Curry bowl
    //         is_available: true,
    //         variants: [{ name: 'Bone-in', price: 0 }, { name: 'Boneless', price: 100 }],
    //         addons: [{ name: 'Extra Butter', price: 50 }],
    //         category: 'Main Course'
    //     },
    //     {
    //         name: 'Nalli Nihari',
    //         category_id: categoryIds['Main Course'],
    //         price: 1100,
    //         description: 'Slow-cooked lamb shank stew with traditional aromatic spices',
    //         image_url: 'https://images.unsplash.com/photo-1544025162-d76690b6d014?w=400', // Meat curry
    //         is_available: true,
    //         variants: [],
    //         addons: [],
    //         category: 'Main Course'
    //     },
    //     {
    //         name: 'Dal Bukhara',
    //         category_id: categoryIds['Main Course'],
    //         price: 750,
    //         description: 'Black lentils simmered overnight with cream, butter, and tomato puree',
    //         image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?w=400', // Dark curry
    //         is_available: true,
    //         variants: [],
    //         addons: [{ name: 'Extra Cream', price: 30 }],
    //         category: 'Main Course'
    //     },

    //     // BREADS & RICE
    //     {
    //         name: 'Hyderabadi Dum Biryani',
    //         category_id: categoryIds['Breads & Rice'],
    //         price: 850,
    //         description: 'Aromatic basmati rice and tender lamb cooked on dum with saffron',
    //         image_url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400', // Proper Biryani
    //         is_available: true,
    //         variants: [{ name: 'Chicken', price: -100 }, { name: 'Lamb', price: 0 }],
    //         addons: [{ name: 'Raita', price: 50 }, { name: 'Mirchi Ka Salan', price: 50 }],
    //         category: 'Breads & Rice'
    //     },
    //     {
    //         name: 'Assorted Bread Basket',
    //         category_id: categoryIds['Breads & Rice'],
    //         price: 450,
    //         description: 'Selection of Naan, Roti, and Paratha',
    //         image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', // Flatbreads/Naan
    //         is_available: true,
    //         variants: [],
    //         addons: [{ name: 'Truffle Oil', price: 100 }],
    //         category: 'Breads & Rice'
    //     },

    //     // DESSERTS
    //     {
    //         name: 'Saffron Rasmalai',
    //         category_id: categoryIds['Desserts'],
    //         price: 350,
    //         description: 'Soft cottage cheese dumplings soaked in sweetened, thickened saffron milk',
    //         image_url: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=400', // Indian Dessert
    //         is_available: true,
    //         variants: [],
    //         addons: [],
    //         category: 'Desserts'
    //     },
    //     {
    //         name: 'Gulab Jamun Cheesecake',
    //         category_id: categoryIds['Desserts'],
    //         price: 450,
    //         description: 'Fusion dessert combining classic gulab jamun with rich cheesecake',
    //         image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400', // Cheesecake
    //         is_available: true,
    //         variants: [],
    //         addons: [{ name: 'Scoop of Vanilla', price: 80 }],
    //         category: 'Desserts'
    //     },

    //     // BEVERAGES
    //     {
    //         name: 'Masala Chai Martini',
    //         category_id: categoryIds['Beverages'],
    //         price: 650,
    //         description: 'Vodka infused with Indian tea spices, coffee liqueur, and cream',
    //         image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400', // Cocktail
    //         is_available: true,
    //         variants: [],
    //         addons: [],
    //         category: 'Beverages'
    //     },
    //     {
    //         name: 'Royal Thandai',
    //         category_id: categoryIds['Beverages'],
    //         price: 400,
    //         description: 'Traditional almond milk drink spiced with saffron, cardamom, and rose petals',
    //         image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', // Cold Drink
    //         is_available: true,
    //         variants: [],
    //         addons: [],
    //         category: 'Beverages'
    //     }
    // ];

    // menuItems.forEach((item) => {
    //     const ref = doc(collection(db, 'menu_items'));
    //     batch.set(ref, item);
    // });

    // Table creation commented out
    // for (let i = 1; i <= 6; i++) {
    //     const tableRef = doc(collection(db, 'restaurant_tables'));
    //     batch.set(tableRef, {
    //         number: i,
    //         capacity: i <= 2 ? 2 : 4,
    //         status: 'available',
    //         current_order_id: null
    //     })
    // }

    // 3. Create Inventory Items (Updated for Indian Cuisine)
    const inventoryItems = [
        { itemName: 'Basmati Rice (Premium)', quantity: 25, unit: 'kg', thresholdLevel: 5, category: 'Dry Goods' },
        { itemName: 'Fresh Lamb (Leg)', quantity: 10, unit: 'kg', thresholdLevel: 3, category: 'Meat' },
        { itemName: 'Boneless Chicken', quantity: 15, unit: 'kg', thresholdLevel: 5, category: 'Meat' },
        { itemName: 'Jumbo Prawns', quantity: 5, unit: 'kg', thresholdLevel: 2, category: 'Seafood' },
        { itemName: 'Paneer (Cottage Cheese)', quantity: 8, unit: 'kg', thresholdLevel: 2, category: 'Dairy' },
        { itemName: 'Heavy Cream', quantity: 12, unit: 'L', thresholdLevel: 4, category: 'Dairy' },
        { itemName: 'Butter (Unsalted)', quantity: 10, unit: 'kg', thresholdLevel: 2, category: 'Dairy' },
        { itemName: 'Kashmiri Saffron', quantity: 0.1, unit: 'kg', thresholdLevel: 0.02, category: 'Spices' },
        { itemName: 'Black Lentils (Urad)', quantity: 10, unit: 'kg', thresholdLevel: 3, category: 'Dry Goods' },
        { itemName: 'Cashew Nuts', quantity: 5, unit: 'kg', thresholdLevel: 1, category: 'Produce' },
        { itemName: 'Refined Flour (Maida)', quantity: 20, unit: 'kg', thresholdLevel: 5, category: 'Dry Goods' },
        { itemName: 'Tomato Puree', quantity: 15, unit: 'L', thresholdLevel: 5, category: 'Produce' }
    ];

    inventoryItems.forEach((item) => {
        const ref = doc(collection(db, 'inventory'));
        batch.set(ref, item);
    });

    await batch.commit();
};

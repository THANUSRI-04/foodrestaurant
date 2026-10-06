/**
 * Food in Forest - Embedded Default Seed Data
 * Guarantees zero-network-failure database seeding across file:// protocols, Live Server, and production.
 */

const DEFAULT_SEED_DATA = {
  "hotels": {
    "hotel-001": {
      "id": "hotel-001",
      "name": "Food in Forest Eco-Resort & Bistro",
      "tagline": "Fresh food. Wild surroundings. Unforgettable taste.",
      "logo": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
      "heroImage": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
      "aboutImage": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
      "description": "Nestled in the heart of dense pine woods and rolling hills, Food in Forest offers an authentic culinary escape. We source organic wild herbs, mountain grains, and seasonal forest produce to deliver honest, soulful dining under the canopy of nature.",
      "aboutTitle": "Where Wild Nature Meets Gourmet Dining",
      "aboutText": "At Food in Forest, dining is not merely a meal; it is a serene ritual. Every dish tells the story of the ancient woodlands — prepared over slow-burning woodfire, infused with wild native herbs, and presented with earthy elegance. Whether you are retreating to our woodland cottages or driving up for an unforgettable weekend lunch, our chefs curate flavours that stay with you forever.",
      "address": "Woodland Trail, Block 4, Silent Valley Ridge, Nilgiris - 643001",
      "phone": "+91 98450 12345",
      "email": "contact@foodinforest.com",
      "mapUrl": "https://maps.google.com/?q=Nilgiris+Forest+Resort",
      "openingTime": "07:30 AM",
      "closingTime": "10:30 PM",
      "currency": "₹",
      "deliveryCharge": 40,
      "minOrderForFreeDelivery": 500,
      "socialLinks": {
        "instagram": "https://instagram.com",
        "facebook": "https://facebook.com",
        "tripadvisor": "https://tripadvisor.com"
      },
      "features": [
        {
          "title": "Woodfire & Clay Pot Cookery",
          "desc": "Slow-cooked over mountain oak and seasoned earthen pots for deep, smoky aroma."
        },
        {
          "title": "100% Wild & Organic Sourcing",
          "desc": "Herbs, wild mushrooms, honey, and vegetables harvested ethically from nearby local farms."
        },
        {
          "title": "Serene Dining Pavilions",
          "desc": "Open-air bamboo decks surrounded by canopy trees, bird songs, and fresh forest breeze."
        },
        {
          "title": "Zero Artificial Additives",
          "desc": "No artificial colors or preservatives. Pure cold-pressed oils and wholesome goodness."
        }
      ]
    }
  },
  "categories": {
    "cat-starters": {
      "id": "cat-starters",
      "name": "Starters & Appetizers",
      "slug": "starters",
      "description": "Crisp woodland finger foods, skewered grills, and forest broth bowls.",
      "image": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80",
      "active": true,
      "order": 1
    },
    "cat-main-course": {
      "id": "cat-main-course",
      "name": "Main Course",
      "slug": "main-course",
      "description": "Hearty curries, clay-pot stews, rustic breads, and heritage rice bowls.",
      "image": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
      "active": true,
      "order": 2
    },
    "cat-breakfast": {
      "id": "cat-breakfast",
      "name": "Forest Breakfast",
      "slug": "breakfast",
      "description": "Wholesome morning platters, wild honey pancakes, and herbal elixirs.",
      "image": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80",
      "active": true,
      "order": 3
    },
    "cat-chef-special": {
      "id": "cat-chef-special",
      "name": "Chef's Signature Specials",
      "slug": "chef-special",
      "description": "Signature slow-smoked preparations curated by our Master Woodfire Chef.",
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
      "active": true,
      "order": 4
    },
    "cat-traditional": {
      "id": "cat-traditional",
      "name": "Traditional & Tribal",
      "slug": "traditional",
      "description": "Heritage tribal recipes passed down through generations in the hills.",
      "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
      "active": true,
      "order": 5
    },
    "cat-desserts": {
      "id": "cat-desserts",
      "name": "Woodland Desserts",
      "slug": "desserts",
      "description": "Handcrafted desserts infused with wild berry compote, jaggery, and coconut cream.",
      "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
      "active": true,
      "order": 6
    },
    "cat-beverages": {
      "id": "cat-beverages",
      "name": "Wild Beverages & Brews",
      "slug": "beverages",
      "description": "Cold-pressed forest coolers, spiced infusions, and mountain estate teas.",
      "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
      "active": true,
      "order": 7
    }
  },
  "foods": {
    "food-001": {
      "id": "food-001",
      "name": "Forest Special Dum Biryani",
      "categoryId": "cat-main-course",
      "categoryName": "Main Course",
      "description": "Long-grain fragrant rice layered with tender country chicken, forest mint, caramelized onions, and stone-ground hill spices, dum-cooked in a sealed clay handi.",
      "price": 349,
      "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Aged Basmati Rice", "Country Chicken", "Forest Mint", "Wild Saffron", "Stone Ground Garam Masala", "Ghee"],
      "veg": false,
      "spicy": true,
      "spiceLevel": "Medium Hot",
      "preparationTime": 30,
      "available": true,
      "featured": true,
      "rating": 4.9,
      "createdAt": "2026-03-01T10:00:00Z"
    },
    "food-002": {
      "id": "food-002",
      "name": "Smoked Bamboo Chicken",
      "categoryId": "cat-chef-special",
      "categoryName": "Chef's Signature Specials",
      "description": "Marinated free-range chicken stuffed inside green bamboo stalks with jungle herbs and slow-roasted over burning wood embers with zero oil.",
      "price": 399,
      "image": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Free-Range Chicken", "Wild Garlic", "Crushed Black Peppercorn", "Curry Leaves", "Bamboo Stem Infusion"],
      "veg": false,
      "spicy": true,
      "spiceLevel": "Hot",
      "preparationTime": 35,
      "available": true,
      "featured": true,
      "rating": 4.95,
      "createdAt": "2026-03-01T10:15:00Z"
    },
    "food-003": {
      "id": "food-003",
      "name": "Wild Mushroom Pepper Fry",
      "categoryId": "cat-starters",
      "categoryName": "Starters & Appetizers",
      "description": "Freshly handpicked forest button and oyster mushrooms tossed with crushed Tellicherry black pepper, shallots, and fragrant curry leaves.",
      "price": 249,
      "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Forest Button Mushrooms", "Oyster Mushrooms", "Tellicherry Pepper", "Shallots", "Coconut Oil"],
      "veg": true,
      "spicy": true,
      "spiceLevel": "Medium Hot",
      "preparationTime": 15,
      "available": true,
      "featured": true,
      "rating": 4.8,
      "createdAt": "2026-03-01T10:30:00Z"
    },
    "food-004": {
      "id": "food-004",
      "name": "Wild Herb & Spring Broth",
      "categoryId": "cat-starters",
      "categoryName": "Starters & Appetizers",
      "description": "Light, restorative clear soup brewed with fresh lemongrass, holy basil, mountain spring water, and tender young bamboo shoots.",
      "price": 189,
      "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Lemongrass", "Holy Basil", "Young Bamboo Shoots", "Mountain Spring Water", "Wild Ginger"],
      "veg": true,
      "spicy": false,
      "spiceLevel": "Mild",
      "preparationTime": 12,
      "available": true,
      "featured": false,
      "rating": 4.7,
      "createdAt": "2026-03-01T10:45:00Z"
    },
    "food-005": {
      "id": "food-005",
      "name": "Clay Pot Forest Vegetable Curry",
      "categoryId": "cat-main-course",
      "categoryName": "Main Course",
      "description": "Seasonal garden vegetables, baby potatoes, and country beans simmered in a roasted coconut, coriander, and wild fennel gravy.",
      "price": 269,
      "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Country Beans", "Baby Potatoes", "Fresh Coconut Paste", "Wild Fennel", "Turmeric"],
      "veg": true,
      "spicy": false,
      "spiceLevel": "Mild",
      "preparationTime": 20,
      "available": true,
      "featured": false,
      "rating": 4.75,
      "createdAt": "2026-03-01T11:00:00Z"
    },
    "food-006": {
      "id": "food-006",
      "name": "Bamboo Shoot & Lentil Stew",
      "categoryId": "cat-traditional",
      "categoryName": "Traditional & Tribal",
      "description": "Traditional tribal delicacy made with tender fermented bamboo shoot slivers slow-boiled with yellow mountain dal and tempered with wild mustard.",
      "price": 229,
      "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Bamboo Shoots", "Yellow Lentils", "Mustard Seeds", "Garlic", "Cumin"],
      "veg": true,
      "spicy": false,
      "spiceLevel": "Mild",
      "preparationTime": 20,
      "available": true,
      "featured": false,
      "rating": 4.6,
      "createdAt": "2026-03-01T11:15:00Z"
    },
    "food-007": {
      "id": "food-007",
      "name": "Traditional Finger Millet Mudde Bowl",
      "categoryId": "cat-traditional",
      "categoryName": "Traditional & Tribal",
      "description": "Nutritious organic Ragi (finger millet) ball served with piping hot spiced greens saag and raw shallots, accompanied by country churned butter.",
      "price": 219,
      "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Organic Ragi Flour", "Wild Spinach Saag", "Desi Butter", "Shallots", "Green Chilies"],
      "veg": true,
      "spicy": true,
      "spiceLevel": "Medium Hot",
      "preparationTime": 15,
      "available": true,
      "featured": true,
      "rating": 4.85,
      "createdAt": "2026-03-01T11:30:00Z"
    },
    "food-008": {
      "id": "food-008",
      "name": "Wild Honey & Oat Pancakes",
      "categoryId": "cat-breakfast",
      "categoryName": "Forest Breakfast",
      "description": "Fluffy rolled-oat pancakes drizzled generously with raw rock-bee forest honey, toasted pine nuts, and sun-dried mountain berries.",
      "price": 219,
      "image": "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Rolled Oats", "Raw Forest Honey", "Pine Nuts", "Wild Berries", "Almond Milk"],
      "veg": true,
      "spicy": false,
      "spiceLevel": "Sweet",
      "preparationTime": 15,
      "available": true,
      "featured": true,
      "rating": 4.9,
      "createdAt": "2026-03-01T11:45:00Z"
    },
    "food-009": {
      "id": "food-009",
      "name": "Tribal Sunrise Breakfast Platter",
      "categoryId": "cat-breakfast",
      "categoryName": "Forest Breakfast",
      "description": "Steamed red rice appams, fresh coconut milk stew, roasted spiced tubers, and a cup of freshly boiled herbal mountain tea.",
      "price": 289,
      "image": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Red Rice Appams", "Coconut Stew", "Roasted Yams", "Herbal Mountain Tea"],
      "veg": true,
      "spicy": false,
      "spiceLevel": "Mild",
      "preparationTime": 20,
      "available": true,
      "featured": false,
      "rating": 4.75,
      "createdAt": "2026-03-01T12:00:00Z"
    },
    "food-010": {
      "id": "food-010",
      "name": "Forest Orchard Fruit Bowl",
      "categoryId": "cat-desserts",
      "categoryName": "Woodland Desserts",
      "description": "Chilled medley of wild blackberries, orchard figs, star fruit, and sweet passion fruit crowned with basil seeds and fresh mint.",
      "price": 199,
      "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Wild Blackberries", "Fresh Figs", "Star Fruit", "Passion Fruit", "Basil Seeds"],
      "veg": true,
      "spicy": false,
      "spiceLevel": "Sweet",
      "preparationTime": 10,
      "available": true,
      "featured": false,
      "rating": 4.8,
      "createdAt": "2026-03-01T12:15:00Z"
    },
    "food-011": {
      "id": "food-011",
      "name": "Smoked Jaggery Coconut Souffle",
      "categoryId": "cat-desserts",
      "categoryName": "Woodland Desserts",
      "description": "Warm artisanal palm jaggery pudding layered with coconut cream, roasted cardamom, and crushed walnut brittle.",
      "price": 239,
      "image": "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Artisanal Palm Jaggery", "Thick Coconut Cream", "Green Cardamom", "Walnut Brittle"],
      "veg": true,
      "spicy": false,
      "spiceLevel": "Sweet",
      "preparationTime": 15,
      "available": false,
      "featured": false,
      "rating": 4.85,
      "createdAt": "2026-03-01T12:30:00Z"
    },
    "food-012": {
      "id": "food-012",
      "name": "Nilgiri Wild Herbal Tea",
      "categoryId": "cat-beverages",
      "categoryName": "Wild Beverages & Brews",
      "description": "Hand-plucked high-altitude Nilgiri tea leaves steeped with dried cinnamon bark, clove, holy basil, and ginger.",
      "price": 129,
      "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Nilgiri Black Tea", "Cinnamon Bark", "Cloves", "Tulsi Leaves", "Ginger"],
      "veg": true,
      "spicy": false,
      "spiceLevel": "Mild",
      "preparationTime": 8,
      "available": true,
      "featured": false,
      "rating": 4.9,
      "createdAt": "2026-03-01T12:45:00Z"
    },
    "food-013": {
      "id": "food-013",
      "name": "Fresh Forest Mango & Mint Cooler",
      "categoryId": "cat-beverages",
      "categoryName": "Wild Beverages & Brews",
      "description": "Pureed raw and ripe forest mangoes blended with crushed garden mint, Himalayan rock salt, roasted cumin, and sparkling spring water.",
      "price": 169,
      "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Wild Forest Mangoes", "Garden Mint", "Himalayan Pink Salt", "Roasted Cumin", "Spring Water"],
      "veg": true,
      "spicy": false,
      "spiceLevel": "Tangy",
      "preparationTime": 10,
      "available": true,
      "featured": true,
      "rating": 4.92,
      "createdAt": "2026-03-01T13:00:00Z"
    },
    "food-014": {
      "id": "food-014",
      "name": "Woodfire Country Lamb Chops",
      "categoryId": "cat-chef-special",
      "categoryName": "Chef's Signature Specials",
      "description": "Prime cut grass-fed mountain lamb chops basted with wild rosemary, smoked garlic glaze, and grilled over charcoal.",
      "price": 499,
      "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      "ingredients": ["Pasture Lamb Chops", "Wild Rosemary", "Smoked Garlic", "Sea Salt", "Cold Pressed Mustard Oil"],
      "veg": false,
      "spicy": true,
      "spiceLevel": "Medium Hot",
      "preparationTime": 30,
      "available": true,
      "featured": true,
      "rating": 4.98,
      "createdAt": "2026-03-01T13:15:00Z"
    }
  },
  "offers": {
    "offer-001": {
      "id": "offer-001",
      "promoCode": "FOREST10",
      "title": "Welcome Forest Delight",
      "description": "Get flat 10% discount on any order with no minimum limit.",
      "discountPercentage": 10,
      "minOrderAmount": 0,
      "startDate": "2026-01-01",
      "endDate": "2026-12-31",
      "active": true,
      "createdAt": "2026-03-01T10:00:00Z"
    },
    "offer-002": {
      "id": "offer-002",
      "promoCode": "WILD20",
      "title": "Wildwood Feast Discount",
      "description": "Enjoy 20% discount on orders above ₹600. Perfect for family and cottage dining.",
      "discountPercentage": 20,
      "minOrderAmount": 600,
      "startDate": "2026-01-01",
      "endDate": "2026-12-31",
      "active": true,
      "createdAt": "2026-03-01T10:00:00Z"
    },
    "offer-003": {
      "id": "offer-003",
      "promoCode": "CHEF15",
      "title": "Chef's Weekend Special",
      "description": "Special 15% discount on all chef signature preparations.",
      "discountPercentage": 15,
      "minOrderAmount": 400,
      "startDate": "2026-01-01",
      "endDate": "2026-12-31",
      "active": true,
      "createdAt": "2026-03-01T10:00:00Z"
    }
  },
  "users": {
    "admin-user-001": {
      "uid": "admin-user-001",
      "id": "admin-user-001",
      "name": "Food in Forest Admin",
      "email": "admin@foodinforest.com",
      "password": "admin",
      "phone": "9845012345",
      "role": "admin",
      "address": "Eco-Resort Headquarters, Nilgiris",
      "createdAt": "2026-03-01T00:00:00Z"
    },
    "sample-user-001": {
      "uid": "sample-user-001",
      "id": "sample-user-001",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@example.com",
      "password": "user123",
      "phone": "9876543210",
      "role": "user",
      "address": "Cottage #12, Whispering Pines, Nilgiris",
      "createdAt": "2026-03-01T10:00:00Z"
    },
    "sample-user-002": {
      "uid": "sample-user-002",
      "id": "sample-user-002",
      "name": "Priya Nair",
      "email": "priya.nair@example.com",
      "password": "user123",
      "phone": "9845012345",
      "role": "user",
      "address": "Villa Blossom, Valley Road, Ooty",
      "createdAt": "2026-03-02T11:00:00Z"
    }
  },
  "orders": {
    "ORD-1001": {
      "orderId": "ORD-1001",
      "userId": "sample-user-001",
      "customerName": "Aarav Sharma",
      "customerEmail": "aarav.sharma@example.com",
      "phone": "9876543210",
      "items": [
        {
          "id": "food-001",
          "name": "Forest Special Dum Biryani",
          "price": 349,
          "quantity": 2,
          "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
          "veg": false
        },
        {
          "id": "food-013",
          "name": "Fresh Forest Mango & Mint Cooler",
          "price": 169,
          "quantity": 2,
          "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
          "veg": true
        }
      ],
      "subtotal": 1036,
      "discount": 103.6,
      "promoCode": "FOREST10",
      "deliveryCharge": 0,
      "total": 932.4,
      "address": "Cottage #12, Whispering Pines, Nilgiris",
      "city": "Nilgiris",
      "specialInstructions": "Please keep spices medium. Deliver directly to the cottage porch.",
      "orderStatus": "Delivered",
      "paymentStatus": "Paid (Cash on Delivery)",
      "paymentMethod": "Cash on Delivery",
      "createdAt": "2026-03-03T18:30:00Z"
    },
    "ORD-1002": {
      "orderId": "ORD-1002",
      "userId": "sample-user-002",
      "customerName": "Priya Nair",
      "customerEmail": "priya.nair@example.com",
      "phone": "9845012345",
      "items": [
        {
          "id": "food-002",
          "name": "Smoked Bamboo Chicken",
          "price": 399,
          "quantity": 1,
          "image": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
          "veg": false
        },
        {
          "id": "food-003",
          "name": "Wild Mushroom Pepper Fry",
          "price": 249,
          "quantity": 1,
          "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
          "veg": true
        }
      ],
      "subtotal": 648,
      "discount": 129.6,
      "promoCode": "WILD20",
      "deliveryCharge": 0,
      "total": 518.4,
      "address": "Villa Blossom, Valley Road, Ooty",
      "city": "Ooty",
      "specialInstructions": "Extra mint chutney please.",
      "orderStatus": "Preparing",
      "paymentStatus": "Pending",
      "paymentMethod": "Pay at Restaurant",
      "createdAt": "2026-03-04T12:10:00Z"
    }
  },
  "settings": {
    "siteName": "Food in Forest",
    "currencySymbol": "₹",
    "deliveryCharge": 40,
    "freeDeliveryThreshold": 500,
    "taxRatePercentage": 5,
    "enableOnlineOrders": true
  }
};

if (typeof window !== 'undefined') {
  window.DEFAULT_SEED_DATA = DEFAULT_SEED_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DEFAULT_SEED_DATA;
}


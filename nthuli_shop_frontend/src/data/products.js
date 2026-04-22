export const products = [
  {
    id: 1,
    name: "Classic Cotton T-Shirt",
    price: 29.99,
    category: "clothing",
    type: "t-shirt",
    image: "https://picsum.photos/300/400?random=1",
    description: "Premium quality classic cotton t-shirt perfect for everyday wear. Comfortable and durable.",
    attributes: {
      gender: "unisex",
      material: "100% Cotton",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Black", "White", "Navy", "Gray"]
    }
  },
  {
    id: 2,
    name: "Denim Skinny Jeans",
    price: 59.99,
    category: "clothing",
    type: "jeans",
    image: "https://picsum.photos/300/400?random=2",
    description: "Stylish denim skinny jeans with a perfect fit. Made from high-quality denim fabric.",
    attributes: {
      gender: "unisex",
      material: "98% Cotton, 2% Elastane",
      sizes: ["28", "30", "32", "34", "36", "38"],
      colors: ["Dark Blue", "Light Blue", "Black", "Gray"]
    }
  },
  {
    id: 3,
    name: "Leather Crossbody Bag",
    price: 89.99,
    category: "accessories",
    type: "bag",
    image: "https://picsum.photos/300/400?random=3",
    description: "Elegant leather crossbody bag with adjustable strap. Perfect for daily use or travel.",
    attributes: {
      gender: "unisex",
      material: "Genuine Leather",
      capacity: "Large",
      colors: ["Brown", "Black", "Tan"]
    }
  },
  {
    id: 4,
    name: "Running Sneakers",
    price: 119.99,
    category: "footwear",
    type: "shoes",
    image: "https://picsum.photos/300/400?random=4",
    description: "Comfortable and breathable running sneakers with excellent cushioning and support.",
    attributes: {
      gender: "unisex",
      material: "Mesh & Rubber",
      sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
      colors: ["White", "Black", "Blue", "Red"]
    }
  },
  {
    id: 5,
    name: "Summer Dress",
    price: 44.99,
    category: "clothing",
    type: "dress",
    image: "https://picsum.photos/300/400?random=5",
    description: "Light and breezy summer dress perfect for warm weather. Elegant and comfortable design.",
    attributes: {
      gender: "women",
      material: "100% Polyester",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Floral", "Solid Red", "Solid Blue", "Solid White"]
    }
  },
  {
    id: 6,
    name: "Winter Wool Coat",
    price: 149.99,
    category: "clothing",
    type: "coat",
    image: "https://picsum.photos/300/400?random=6",
    description: "Warm and stylish winter wool coat. Perfect for cold weather with quality construction.",
    attributes: {
      gender: "unisex",
      material: "80% Wool, 20% Polyester",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Black", "Gray", "Navy", "Brown"]
    }
  },
  {
    id: 7,
    name: "Casual Canvas Shoes",
    price: 49.99,
    category: "footwear",
    type: "shoes",
    image: "https://picsum.photos/300/400?random=7",
    description: "Classic canvas casual shoes suitable for any occasion. Lightweight and durable.",
    attributes: {
      gender: "unisex",
      material: "Canvas & Rubber",
      sizes: ["5", "6", "7", "8", "9", "10", "11", "12"],
      colors: ["White", "Black", "Red", "Navy"]
    }
  },
  {
    id: 8,
    name: "Silk Scarf",
    price: 34.99,
    category: "accessories",
    type: "scarf",
    image: "https://picsum.photos/300/400?random=8",
    description: "Luxurious silk scarf with beautiful patterns. Versatile accessory for any outfit.",
    attributes: {
      gender: "unisex",
      material: "100% Silk",
      length: "Large",
      colors: ["Burgundy", "Navy", "Emerald", "Gold"]
    }
  },
  {
    id: 9,
    name: "Casual Button-Up Shirt",
    price: 54.99,
    category: "clothing",
    type: "shirt",
    image: "https://picsum.photos/300/400?random=9",
    description: "Versatile button-up shirt perfect for casual or semi-formal occasions.",
    attributes: {
      gender: "men",
      material: "100% Cotton",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["White", "Light Blue", "Navy", "Gray"]
    }
  },
  {
    id: 10,
    name: "Premium Leather Belt",
    price: 44.99,
    category: "accessories",
    type: "belt",
    image: "https://picsum.photos/300/400?random=10",
    description: "High-quality leather belt with elegant buckle. Perfect finishing touch for any outfit.",
    attributes: {
      gender: "unisex",
      material: "Genuine Leather",
      width: "1.5 inches",
      colors: ["Brown", "Black", "Tan"]
    }
  },
  {
    id: 11,
    name: "Athletic Leggings",
    price: 64.99,
    category: "clothing",
    type: "leggings",
    image: "https://picsum.photos/300/400?random=11",
    description: "High-waisted athletic leggings with excellent support and compression.",
    attributes: {
      gender: "women",
      material: "88% Nylon, 12% Spandex",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Black", "Gray", "Navy", "Purple"]
    }
  },
  {
    id: 12,
    name: "Stainless Steel Watch",
    price: 179.99,
    category: "accessories",
    type: "watch",
    image: "https://picsum.photos/300/400?random=12",
    description: "Elegant stainless steel watch with quartz movement and water-resistant design.",
    attributes: {
      gender: "unisex",
      material: "Stainless Steel",
      waterResistant: "30m",
      colors: ["Silver", "Gold", "Black"]
    }
  }
];

export const categories = [
  { id: 1, name: "Clothing", slug: "clothing" },
  { id: 2, name: "Footwear", slug: "footwear" },
  { id: 3, name: "Accessories", slug: "accessories" }
];

export const priceRanges = [
  { id: 1, label: "Under $30", min: 0, max: 30 },
  { id: 2, label: "$30 - $60", min: 30, max: 60 },
  { id: 3, label: "$60 - $100", min: 60, max: 100 },
  { id: 4, label: "$100 - $150", min: 100, max: 150 },
  { id: 5, label: "Over $150", min: 150, max: Infinity }
];

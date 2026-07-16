const orders = [
  {
    id: "SID-1092",
    userId: "user-2",
    items: [
      {
        productId: "prod-1",
        name: "Premium Kabasura Kudineer Coarse Powder",
        price: 145,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
      },
      {
        productId: "prod-4",
        name: "Golden Glow Nalangu Maavu Herbal Bath Powder",
        price: 185,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800",
      }
    ],
    subtotal: 475,
    couponDiscount: 50,
    total: 425,
    shippingAddress: {
      address: "45, Green Valley Colony, Peelamedu",
      state: "Tamil Nadu",
      district: "Coimbatore",
      pincode: "641004",
    },
    mobileNumber: "9123456780",
    email: "ram@example.com",
    fullName: "Ramanathan Sundaram",
    status: "Shipped",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    date: "2026-06-18T14:32:00.000Z"
  }
];

export default orders;

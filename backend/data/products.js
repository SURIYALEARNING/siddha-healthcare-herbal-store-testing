const products = [
  {
    id: "prod-1",
    name: "Premium Kabasura Kudineer Coarse Powder",
    price: 180,
    discountPrice: 145,
    stock: 25,
    category: "Immunity Boosters",
    description: "Kabasura Kudineer is a traditional Siddha formulation containing 15 powerful herbal ingredients. It is widely used to bolster respiratory health, manage fevers, and boost overall immune defenses naturally.",
    ingredients: [
      "Chukku (Dry Ginger)",
      "Thippili (Long Pepper)",
      "Ilavangam (Clove)",
      "Sirukanchori Ver (Tragia involucrata root)",
      "Kandankathiri (Yellow-fruit nightshade)",
      "Koraikizhangu (Cyperus rotundus)",
      "Nilavembu (Andrographis paniculata)"
    ],
    benefits: [
      "Strong traditional immune support",
      "Excellent defense for respiratory discomfort",
      "Helps clear nasal and chest congestion",
      "Reduces seasonal fatigue and low-grade body aches"
    ],
    usageInstructions: [
      "Take 5g of Kabasura Kudineer powder.",
      "Add 240ml of water and boil until reduced to 60ml (one-fourth).",
      "Filter the decoction and consume warm.",
      "Drink twice daily before meal times, or as advised by a Siddha physician."
    ],
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.8,
    reviews: [
      { id: "rev-1", user: "Ganesh K.", rating: 5, comment: "Authentic taste and highly effective during monsoon flu seasons.", date: "2026-05-15" },
      { id: "rev-2", user: "Meenakshi S.", rating: 4, comment: "Very good quality powder, very clean. Highly recommended.", date: "2026-06-01" }
    ]
  },
  {
    id: "prod-2",
    name: "Amukkara Chooranam Tablets (Siddha Ashwagandha)",
    price: 250,
    discountPrice: 195,
    stock: 40,
    category: "Immunity Boosters",
    description: "Amukkara (Winter Cherry/Ashwagandha) is one of the most celebrated rejuvenating rejuvenator (Karpam) herbs in Siddha medicine. Formulated to enhance vitality, combat daily stress, strengthen nervous response, and improve deep sleep quality.",
    ingredients: [
      "Amukkara Kizhanagu (Withania somnifera root)",
      "Karam (Piper longum)",
      "Chukku (Zingiber officinale)",
      "Elakkai (Elettaria cardamomum)",
      "Sugar (Saccharum officinarum)"
    ],
    benefits: [
      "Combats nervous debility and physical fatigue",
      "Aids stress management by regulating cortisol levels",
      "Promotes restful and synchronized sleep patterns",
      "Supports muscle strength and bone density"
    ],
    usageInstructions: [
      "Take 1 to 2 tablets twice daily.",
      "Preferably swallow with warm milk or honey after food consumption.",
      "Suitable for chronic fatigue conditions."
    ],
    images: [
      "https://images.unsplash.com/photo-1611070973770-b1a629af7d12?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.6,
    reviews: [
      { id: "rev-3", user: "Anand R.", rating: 5, comment: "Helped immensely with my work fatigue and severe insomnia.", date: "2026-04-10" }
    ]
  },
  {
    id: "prod-3",
    name: "Traditional Inji Chooranam Digestive Powder",
    price: 150,
    discountPrice: 120,
    stock: 15,
    category: "Digestive Care",
    description: "Pure Siddha formula leveraging dry ginger (Inji) balanced with medicinal herbs, traditionally indicated for indigestion, bloating, loss of appetite, and morning sickness.",
    ingredients: [
      "Inji (Zingiber officinale dry skin-removed)",
      "Milagu (Black Pepper)",
      "Thippili (Long pepper)",
      "Seeragam (Cumin seeds)",
      "Indhuppu (Rock salt)"
    ],
    benefits: [
      "Stimulates active gastric enzymes for ease of digestion",
      "Relieves abdominal gas, flatulence, and uncomfortable bloating",
      "Combats mild nausea and motion sickness",
      "Cleanses toxic metabolic waste (Amam)"
    ],
    usageInstructions: [
      "Mix 1-2 grams of powder in warm water or ghee.",
      "Consume immediately after meals for heavy digestion.",
      "Adults: Twice daily. Children: Half the dosage."
    ],
    images: [
      "https://images.unsplash.com/photo-1599639085605-a34414b6d32c?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.5,
    reviews: [
      { id: "rev-4", user: "Selvam P.", rating: 4, comment: "Instant relief from heavy meal bloating.", date: "2026-05-20" }
    ]
  },
  {
    id: "prod-4",
    name: "Golden Glow Nalangu Maavu Herbal Bath Powder",
    price: 220,
    discountPrice: 185,
    stock: 32,
    category: "Skin Care",
    description: "An absolute organic Siddha skincare bathing secret. Contains a custom formulation of wild turmeric, sandalwood, and pulse flours that naturally cleanse, exfoliate, and protect the skin from modern environmental impurities.",
    ingredients: [
      "Kasthuri Manjal (Wild Turmeric)",
      "Poosanthu (Sandalwood powder)",
      "Vetiver (Khus khus root)",
      "Koraikizhangu (Nutgrass)",
      "Rose petals",
      "Green Gram Flour"
    ],
    benefits: [
      "Cleanses skin pores without stripping natural nourishing oils",
      "Prevents skin rashes, localized body acne, and bad sweat odor",
      "Gives a beautiful Golden Glow and natural herbal fragrance",
      "Reduces blemishes and pigmentation patches"
    ],
    usageInstructions: [
      "Mix 2 tablespoons of Nalangu Maavu with water or milk to form a paste.",
      "Apply evenly across the face and body.",
      "Gently scrub in circular motions and wash off. Use daily instead of chemical soaps."
    ],
    images: [
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.9,
    reviews: [
      { id: "rev-5", user: "Janani R.", rating: 5, comment: "I stopped using chemical face washes after trying this! Beautiful scent.", date: "2026-06-11" }
    ]
  },
  {
    id: "prod-5",
    name: "Bhringraj & Vetiver Cooling Herbal Hair Oil",
    price: 320,
    discountPrice: 275,
    stock: 20,
    category: "Hair Care",
    description: "Infused with organically sourced Bhringraj (Karisalankanni) and whole Vetiver roots floating in pure cold-pressed coconut oil. It acts as an deep moisturizer, arresting hair fall, promoting scalp circulation, and keeping the head cool.",
    ingredients: [
      "Karisalankanni (Eclipta prostrata juice)",
      "Vetiver (Chrysopogon zizanioides whole root)",
      "Nellikkai (Amla)",
      "Ponnanganni (Sessile joyweed)",
      "Cold-pressed Coconut Oil",
      "Castor Oil"
    ],
    benefits: [
      "Nourishes hair roots deeply and promotes denser dark hair growth",
      "Prevents premature graying of hair strands due to heat and pollution",
      "Soothes tension, reducing head-heat and mental strain",
      "Addresses persistent dandruff and itchy scalp micro-issues"
    ],
    usageInstructions: [
      "Apply a generous quantity of oil directly onto the scalp and hair length.",
      "Massage gently using finger pads for 10 minutes in comforting circles.",
      "Leave on for at least an hour or overnight before rinsing with a mild herbal cleanser."
    ],
    images: [
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.7,
    reviews: [
      { id: "rev-6", user: "Karthik Raja", rating: 4, comment: "My dandruff is almost gone. Sleep has also improved secondary to the cooling effect.", date: "2026-06-15" }
    ]
  }
];

export default products;

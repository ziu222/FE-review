// Seed data for orders
// This file is only used on first load to populate LocalStorage

var SEED_ORDERS = [
    {
        id: 1,
        userId: 2,
        shopId: 5,
        items: [
            { productId: 1, qty: 1, price: 1199 },
            { productId: 9, qty: 1, price: 329 }
        ],
        total: 1528,
        status: "delivered",
        createdAt: "2025-12-01"
    },
    {
        id: 2,
        userId: 3,
        shopId: 5,
        items: [
            { productId: 7, qty: 1, price: 1399 }
        ],
        total: 1399,
        status: "shipped",
        createdAt: "2025-12-10"
    },
    {
        id: 3,
        userId: 4,
        shopId: 7,
        items: [
            { productId: 15, qty: 1, price: 499 },
            { productId: 11, qty: 2, price: 149 }
        ],
        total: 797,
        status: "confirmed",
        createdAt: "2025-12-18"
    },
    {
        id: 4,
        userId: 2,
        shopId: 5,
        items: [
            { productId: 4, qty: 1, price: 799 }
        ],
        total: 799,
        status: "pending",
        createdAt: "2025-12-22"
    },
    {
        id: 5,
        userId: 3,
        shopId: 7,
        items: [
            { productId: 13, qty: 1, price: 2299 },
            { productId: 14, qty: 1, price: 399 }
        ],
        total: 2698,
        status: "cancelled",
        createdAt: "2025-11-25"
    },
    {
        id: 6,
        userId: 4,
        shopId: 6,
        items: [
            { productId: 2, qty: 1, price: 1299 },
            { productId: 5, qty: 1, price: 399 }
        ],
        total: 1698,
        status: "delivered",
        createdAt: "2025-10-05"
    },
    {
        id: 7,
        userId: 2,
        shopId: 9,
        items: [
            { productId: 17, qty: 1, price: 329 }
        ],
        total: 329,
        status: "pending",
        createdAt: "2025-12-24"
    }
];

// ============================================================
// user-data.js - Seed data for all users
// ============================================================
// Roles: admin, shop, customer
// Shop users have extra fields: shopName, shopDescription, etc.
// This file is only used on first load to populate LocalStorage
// ============================================================

var SEED_USERS = [

    // -- ADMIN ----------------------------------------------

    {
        id: 1,
        name: "Admin",
        username: "admin1",
        email: "admin@ecshop.com",
        password: "123",
        role: "admin",
        adminLevel: 1,
        avatar: "",
        createdAt: "2025-01-01"
    },
    {
        id: 10,
        name: "Super Admin",
        username: "admin2",
        email: "superadmin@ecshop.com",
        password: "123",
        role: "admin",
        adminLevel: 2,
        avatar: "",
        createdAt: "2025-01-01"
    },

    // -- CUSTOMERS ------------------------------------------

    {
        id: 2,
        name: "Nguyen Van A",
        username: "nguyenvana",
        email: "nguyenvana@gmail.com",
        password: "user123",
        role: "customer",
        avatar: "",
        createdAt: "2025-03-15"
    },
    {
        id: 3,
        name: "Tran Thi B",
        username: "tranthib",
        email: "tranthib@gmail.com",
        password: "user123",
        role: "customer",
        avatar: "",
        createdAt: "2025-05-20"
    },
    {
        id: 4,
        name: "Le Van C",
        username: "levanc",
        email: "levanc@gmail.com",
        password: "user123",
        role: "customer",
        avatar: "",
        createdAt: "2025-07-10"
    },

    // -- SHOPS Data ----------------------------------------------
    // Each shop is a user with role "shop" + shop-specific fields
    // shop         Status: "pending" (cho duyet), "active" (da duyet), "suspended" (bi khoa)

    {
        id: 5,
        name: "Tim Cook",
        username: "apple",
        email: "apple@shop.com",
        password: "shop123",
        role: "shop",
        avatar: "",
        shopName: "Apple Store",
        shopDescription: "Official Apple Store - iPhone, MacBook, Apple Watch chinh hang",
        shopAddress: "1 Apple Park Way, Cupertino, CA",
        shopPhone: "0901000001",
        shopStatus: "active",
        shopAvatar: "",
        createdAt: "2025-01-15"
    },
    {
        id: 6,
        name: "Jong-Hee Han",
        username: "samsung",
        email: "samsung@shop.com",
        password: "shop123",
        role: "shop",
        avatar: "",
        shopName: "Samsung Store",
        shopDescription: "Official Samsung Store - Galaxy phones, watches va phu kien",
        shopAddress: "129 Samsung-ro, Suwon, Korea",
        shopPhone: "0901000002",
        shopStatus: "active",
        shopAvatar: "",
        createdAt: "2025-02-01"
    },
    {
        id: 7,
        name: "Kenichiro Yoshida",
        username: "sony",
        email: "sony@shop.com",
        password: "shop123",
        role: "shop",
        avatar: "",
        shopName: "Sony Store",
        shopDescription: "Official Sony Store - Headphones, cameras, PlayStation chinh hang",
        shopAddress: "1-7-1 Konan, Minato, Tokyo",
        shopPhone: "0901000003",
        shopStatus: "active",
        shopAvatar: "",
        createdAt: "2025-02-10"
    },
    {
        id: 8,
        name: "Pham Minh Tuan",
        username: "gearvn",
        email: "gearvn@shop.com",
        password: "shop123",
        role: "shop",
        avatar: "",
        shopName: "GearVN",
        shopDescription: "Chuyen laptop, PC gaming va phu kien cong nghe chinh hang",
        shopAddress: "78 Hoang Hoa Tham, Tan Binh, HCM",
        shopPhone: "0901000004",
        shopStatus: "active",
        shopAvatar: "",
        createdAt: "2025-03-01"
    },
    {
        id: 9,
        name: "Hoang Duc Minh",
        username: "audiverse",
        email: "audiverse@shop.com",
        password: "shop123",
        role: "shop",
        avatar: "",
        shopName: "Audiverse",
        shopDescription: "Thien duong am thanh - Loa, tai nghe, camera va gaming gear",
        shopAddress: "256 Le Thanh Ton, Q1, HCM",
        shopPhone: "0901000005",
        shopStatus: "active",
        shopAvatar: "",
        createdAt: "2025-03-15"
    },
    {
        id: 11,
        name: "Tran Van Flagship",
        username: "flagshipstore",
        email: "flagship@shop.com",
        password: "shop123",
        role: "shop",
        avatar: "",
        shopName: "Flagship Store",
        shopDescription: "Chuyen hang chinh hang cao cap - Dien tu, thoi trang, phu kien",
        shopAddress: "100 Le Loi, Q1, HCM",
        shopPhone: "0901000010",
        shopStatus: "pending",
        shopAvatar: "",
        createdAt: "2026-04-21"
    }
];

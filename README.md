
# EC Shop Admin

This deployment now uses the admin login page as the primary entry point.

## Setup

```bash
npm install
npm run build:tw
```

## Routes

- Root: `/` -> `admin/admin-login.html`
- Admin login: `/admin` -> `admin/admin-login.html`
- Admin dashboard: `/admin/dashboard`
- Admin products: `/admin/products`
- Admin orders: `/admin/orders`
- Admin shops: `/admin/shops`
- Admin users: `/admin/users`
- Admin finance: `/admin/finance`
- Admin notifications: `/admin/notifications`

## Admin Login

- Username: `admin1`
- Email: `admin@ecshop.com`
- Password: `123`

## Notes

- Data is stored in LocalStorage.
- Run `Store.resetAll()` in the browser console to reset seeded data.
- Currency: USD (`$`).
References:

https://github.com/topics/csv-export

https://www.youtube.com/live/An7BNKwPhhE?si=iX4jBOulmipVK1eR

Repos from: https://github.com/topics/ecommerce-website
# iPhoneHub storefront

Next.js 15 (App Router) + React 19 + TypeScript. Add to Cart opens an order form; submitting it emails the order to you and a confirmation to the customer through Nodemailer.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in your SMTP details and ORDER_RECEIVER_EMAIL
npm run dev
```

Open http://localhost:3000.

## Mail setup

- `SMTP_USER` / `SMTP_PASS` are the account the site sends from. For Gmail, create an App Password (needs 2-Step Verification) and use that, not your normal password.
- `ORDER_RECEIVER_EMAIL` is the inbox that receives every order.
- The customer's confirmation is sent to the email they enter. Replying to your copy goes to the customer.

## Where things live

- `lib/products.ts` product catalogue (add phones here, photos go in `public/images`)
- `components/OrderModal.tsx` the order form
- `app/api/order/route.ts` validation + emails (prices are recomputed on the server)
- `app/globals.css` all styling

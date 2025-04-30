# BeChill Web

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn
```

Then, copy the example environment variable file and add your own Privy App ID:

```bash
cp .env.example .env
```

Edit the newly created `.env` file and set your value:

```env
NEXT_PUBLIC_PRIVY_APP_ID=YOUR_PRIVY_APP_ID
```

Now, run the development server:

```bash
npm run dev
# or
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) – Learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) – An interactive Next.js tutorial.

You can also check out the [Next.js GitHub repository](https://github.com/vercel/next.js) – your feedback and contributions are welcome!

---

💡 Don’t forget to create your `.env` file based on the example:

```env
# .env.example
NEXT_PUBLIC_PRIVY_APP_ID=YOUR_PRIVY_APP_ID
```
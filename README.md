# ExpenseFlow

ExpenseFlow is a personal expense tracker built with Next.js. It helps users record income and expenses, review budgets, manage categories, and view spending reports.

## Features

- Dashboard with income, expenses, monthly balance, and category spending
- Create, edit, and delete transactions
- Attach receipt images to transactions
- Monthly and category budget tracking
- Custom income and expense categories
- Financial reports and JSON data export
- User profile with avatar, name, and email
- App-styled confirmation and budget dialogs

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

```bash
npm run dev    # Start the development server
npm run build  # Create a production build
npm run start  # Start the production server
```

## Data storage

ExpenseFlow currently stores data in the browser's Local Storage. Data is retained in the same browser on the same device, but it is not yet synced to a server or shared across devices.

## Tech stack

- Next.js 14
- React 18
- Lucide React icons

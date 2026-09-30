# Financify

Financify is a React personal-finance dashboard for recording income and expenses, reviewing financial summaries, visualising spending, and asking questions about transaction data. It uses Firebase Authentication for sign-in and Cloud Firestore for per-user transaction storage.

The interface is designed around Indian currency formatting (`₹`) and Indian date/number conventions. Users can enter transactions manually or upload an image of a receipt, salary slip, payment advice, or similar document to pre-fill a form with browser-side OCR.

## Contents

- [Features](#features)
- [Application execution flow](#application-execution-flow)
- [Pages and user workflows](#pages-and-user-workflows)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and local setup](#installation-and-local-setup)
- [Firebase setup](#firebase-setup)
- [Environment variables](#environment-variables)
- [Firestore data model](#firestore-data-model)
- [OCR workflow](#ocr-workflow)
- [Demo data](#demo-data)
- [Available commands](#available-commands)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Limitations and security notes](#limitations-and-security-notes)

## Features

- Email/password authentication through Firebase Authentication.
- Google sign-in through a Firebase popup.
- Anonymous guest sign-in, when enabled in the Login page and Firebase console.
- Password-reset email flow.
- Protected Dashboard, Income, and Expenses pages.
- Manual create, edit, delete, search, and date-sorted transaction management.
- Income categories: Salary, Freelance, Business, Investment, Gift, Refund, and Other.
- Expense categories: Food, Transport, Shopping, Bills, Health, Entertainment, Education, and Other.
- Dashboard statistics for total income, total expenses, category count, and saving rate.
- Income-versus-expense and expense-category charts using Chart.js.
- Pagination with five records per page.
- Browser-side OCR using Tesseract.js for image uploads.
- A local rule-based assistant that answers questions from the currently loaded transactions.
- One-click demo data seeding from the Dashboard.
- Responsive layout with desktop sidebar navigation and mobile navigation.

## Application execution flow

The application starts in the following order:

1. Vite serves `index.html` during development or the generated `dist` files in production.
2. `index.html` provides the `<div id="root">` mount point and loads `src/main.jsx`.
3. `src/main.jsx` creates the React root and wraps the application with:
	 - `StrictMode` for development checks.
	 - `BrowserRouter` for client-side routes.
	 - `AuthProvider` for the Firebase authentication session.
4. `AuthProvider` subscribes to `onAuthStateChanged`. Until Firebase reports the current user, the context starts with `user: null`.
5. `App.jsx` renders the login route at `/` and places the authenticated pages inside the `Navbar` layout.
6. `ProtectedRoute` checks `AuthContext.user`. If there is no authenticated user, it redirects to `/`; otherwise it renders the requested page.
7. Each data page queries Firestore using the authenticated user's UID. This keeps the UI filtered to the current user's records.

### First visit

1. Open `/`.
2. Choose Google sign-in, email/password sign-in, or guest sign-in if it is enabled.
3. Firebase completes authentication and updates `AuthContext`.
4. `Login.jsx` navigates to `/dashboard`.
5. The dashboard queries both `incomes` and `expenses` for the user's UID.
6. The page calculates totals in the browser and renders cards, charts, transactions, and the assistant.

### Adding a transaction

1. Open `/income` or `/expense` from the navigation.
2. Enter a description, positive amount, date, and category.
3. The submit button becomes available only when all required values are present.
4. The page converts the amount to a JavaScript number and writes a document to the relevant Firestore collection with `uid: user.uid`.
5. The collection is read again so the list and statistics immediately reflect the new record.

### Editing or deleting a transaction

1. Select a row in the Income or Expenses list.
2. `TransactionModal` opens for that record.
3. Edit moves the record into the page form and uses `updateDoc` on submit.
4. Delete uses `deleteDoc`, reloads the collection, and closes the modal.

## Pages and user workflows

### Login: `/`

The login page provides:

- Google popup authentication.
- Email/password authentication.
- Anonymous guest authentication, if enabled in the Firebase project.
- Password reset by email.
- A demo-account button that fills the configured demo credentials and signs in.

The demo email and password are defined in `src/pages/Login.jsx`. They are included in the client bundle, so they must only ever be throwaway credentials. Create the user in Firebase Authentication before using that button.

### Dashboard: `/dashboard`

The dashboard loads both Firestore collections in parallel and combines them into one transaction list. It displays:

- Total income.
- Total expense.
- Number of categories in use.
- Saving rate, calculated as `(income - expense) / income * 100`.
- A weekly income-versus-expense chart.
- An expense-category chart.
- A searchable, newest-first recent transaction list.
- Five transactions per page.
- The Financify Assistant.
- A `Demo Data` action that inserts the sample records from `src/seedOnce.jsx` for the signed-in user.

The assistant is not an external AI service. It performs local keyword matching and arithmetic over the transactions already passed to it. It can answer questions about income, expenses, savings, balance, counts, this month's summary, the largest expense, and the top expense category.

### Income: `/income`

The Income page stores records in the `incomes` collection. It supports the seven income categories listed above, displays total income/transaction/category statistics, and lets the user search and paginate income records.

Its scan action accepts an image and uses Tesseract.js to suggest:

- A payer or source description.
- A likely amount.
- The payment or credit date where available.
- A category based on document keywords.

OCR only fills the form. It does not save anything until the user reviews and submits it.

### Expenses: `/expense`

The Expenses page mirrors the Income page and stores records in the `expenses` collection. Its scanner is tuned for receipts and attempts to identify:

- Merchant or receipt description.
- Final payable amount.
- Receipt date.
- Category such as Food, Transport, Bills, Health, or Shopping.

OCR results are suggestions and should always be checked before saving.

## Technology

- React 19
- Vite 8
- React Router DOM 7
- Firebase 12
	- Firebase Authentication
	- Cloud Firestore
	- Firebase Analytics initialization
- Tesseract.js 7
- Chart.js 4 with `react-chartjs-2`
- Tailwind CSS 4 through `@tailwindcss/vite`
- ESLint 10

## Project structure

```text
.
├── index.html                 # HTML entry point and page title
├── package.json               # Dependencies and npm scripts
├── vite.config.js             # Vite, React, and Tailwind plugins
├── public/                    # Static public assets
├── src/
│   ├── main.jsx               # React bootstrap and providers
│   ├── App.jsx                # Route declarations
│   ├── seedOnce.jsx           # Demo income and expense records
│   ├── firebase/
│   │   └── firebase.js        # Firebase app, Auth, Firestore, Analytics
│   ├── context/
│   │   └── AuthContext.jsx    # Current Firebase user subscription
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Income.jsx
│   │   └── Expense.jsx
│   ├── components/             # Shared layout, forms, charts, lists, modal, assistant
│   ├── styles/                 # Theme variables and global styles
│   ├── utils/                  # Shared parsing utilities
│   └── assets/                 # Lottie and other application assets
└── final/                      # Additional project material, if used locally
```

## Prerequisites

- Node.js 18 or newer is recommended.
- npm 9 or newer is recommended.
- A Firebase project.
- A modern browser with JavaScript enabled.
- Internet access when using Firebase or when Tesseract.js first loads its OCR language data.

## Installation and local setup

Clone the repository and enter the project directory:

```bash
git clone <repository-url>
cd financify-react
```

Install dependencies:

```bash
npm install
```

Create a local environment file named `.env.local` in the project root and add the Firebase values described in [Environment variables](#environment-variables).

Start the development server:

```bash
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`. Open that URL in a browser, configure Firebase Authentication, and sign in.

## Firebase setup

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Add a Web app to the project.
3. Copy the web app configuration values into `.env.local`.
4. Open **Authentication > Sign-in method** and enable the providers used by the login page:
	 - Email/password.
	 - Google.
	 - Anonymous, if guest access is required.
5. Create a Cloud Firestore database.
6. Add the local development hostname to **Authentication > Settings > Authorized domains**. `localhost` is usually already present.
7. If the demo button is used, create a throwaway email/password user matching the constants in `src/pages/Login.jsx`.

Firebase Analytics is initialized in `src/firebase/firebase.js`. The application exports `db` and `auth`; the analytics instance is initialized for Firebase side effects but is not exported.

## Environment variables

Vite exposes only variables beginning with `VITE_` to browser code. Add the following keys to `.env.local`:

```dotenv
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

Do not commit `.env.local`. Firebase web configuration values are not treated as server secrets, but access is still controlled by Firebase Authentication and Firestore Security Rules. Never put service-account JSON, private keys, or administrative credentials in a Vite environment variable.

## Firestore data model

The application uses two top-level collections:

```text
incomes/{documentId}
expenses/{documentId}
```

Each document has this shape:

```js
{
	uid: "firebase-user-uid",
	description: "Monthly salary",
	amount: 55000,
	date: "2026-09-28",
	category: "Salary"
}
```

The `uid` field is written when a new record is added and is used in every list query:

```js
query(collection(db, "incomes"), where("uid", "==", user.uid));
```

The UI currently stores dates as `YYYY-MM-DD` strings and amounts as numbers. New records should preserve that shape. If existing documents contain missing or malformed values, the UI falls back to zero for amount calculations and may not sort dates as expected.

### Suggested Firestore rules

The client assumes that a signed-in user can read and write only their own documents. Deploy rules that enforce that assumption on the server:

```text
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /{collection}/{documentId} {
			allow read, create: if request.auth != null
				&& request.resource.data.uid == request.auth.uid;
			allow update: if request.auth != null
				&& resource.data.uid == request.auth.uid
				&& request.resource.data.uid == request.auth.uid;
			allow delete: if request.auth != null
				&& resource.data.uid == request.auth.uid;
		}
	}
}
```

Before production use, restrict `{collection}` to `incomes` and `expenses` and add validation for amount, date, category, and description. Security Rules are the real security boundary; filtering in React alone is not sufficient.

## OCR workflow

The Income and Expenses pages share the same high-level OCR process:

1. The user selects an image file.
2. The page creates a Tesseract English worker.
3. Tesseract recognizes the image with page-segmentation mode 6.
4. The raw OCR text is split into trimmed, non-empty lines.
5. A rule-based parser looks for likely amounts, dates, and descriptions.
6. Keyword scoring selects the most likely category.
7. The parsed values are placed into the form.
8. The user verifies the values and explicitly submits the form.
9. The worker is terminated in `finally`, even when recognition fails.

The parser is intentionally heuristic. Blurry images, unusual layouts, multiple totals, unsupported languages, and OCR character mistakes can produce incorrect values. The amount, date, description, and category must be treated as editable suggestions.

## Demo data

Click `Demo Data` on the Dashboard after signing in. `seedOnce.jsx` writes 15 income documents and 15 expense documents with dates spread across the previous 90 days.

The operation is a batch write, but it is not currently idempotent. Clicking the action more than once creates another set of records. Use it once per test user, or delete test records from Firestore before reseeding.

## Available commands

```bash
npm run dev       # Start the Vite development server
npm run lint      # Run ESLint across the project
npm run preview   # Preview an existing production build
```

### Production build note

The current `package.json` contains `"build": "vite bild"`, where `bild` is a typo. The equivalent Vite build command is:

```bash
npx vite build
```

To make `npm run build` work, change that script to `"build": "vite build"`, then run:

```bash
npm run build
```

The output is written to `dist/`.

## Deployment

For a static deployment provider:

1. Set the build command to `npx vite build` until the package script typo is corrected.
2. Set the output directory to `dist`.
3. Add all `VITE_FIREBASE_*` variables in the provider's environment settings.
4. Add the deployed domain to Firebase Authentication's authorized domains.
5. Configure SPA fallback so unknown routes serve `index.html`. The repository includes `src/vercel.json`; Vercel projects normally expect this configuration at the project root, so verify the provider's configuration before deploying.
6. Test `/`, `/dashboard`, `/income`, and `/expense` after deployment, including a hard refresh on each protected route.

## Troubleshooting

### The app stays on the login page

- Confirm every Firebase environment variable is present and spelled correctly.
- Restart Vite after changing `.env.local`.
- Confirm the selected Firebase sign-in provider is enabled.
- Check the browser console for Firebase configuration or popup errors.

### Firestore reads fail with a permission error

- Confirm the user is authenticated.
- Confirm each document contains the correct `uid`.
- Check Firestore Security Rules.
- Confirm the app is connected to the intended Firebase project.

### Google sign-in fails

- Add the current hostname to Firebase Authentication authorized domains.
- Confirm Google is enabled as a provider.
- Close duplicate sign-in popups before trying again.

### OCR produces incorrect values

- Use a clear, well-lit image with the document facing the camera.
- Make sure the important total and date are visible.
- Check and correct the form before submitting.
- Review the browser console for the raw OCR text printed by the page.

### `npm run build` fails immediately

The repository currently uses `vite bild` in the build script. Run `npx vite build` or correct the script to `vite build` as described above.

### Refreshing a deployed route returns 404

The app uses client-side routing. Configure the hosting provider to rewrite all application routes to `index.html`, and verify the rewrite file is in the location expected by that provider.

## Limitations and security notes

- This is a client-rendered application; calculations and OCR parsing happen in the browser.
- The assistant is deterministic keyword matching, not a generative AI model.
- OCR does not guarantee accurate extraction.
- The demo credentials in `Login.jsx` are public if the demo button is enabled. Use only a disposable account.
- Firestore rules must enforce per-user access; the React `where("uid", ...)` filter is not a security control by itself.
- There is no server-side validation or transactional business-logic layer in this repository.
- The current UI uses Indian rupee formatting and `en-IN` locale conventions.

## License

No license file is currently included in the repository. Add a license before distributing the project outside its intended use.

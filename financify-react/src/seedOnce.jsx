import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase/firebase";

const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
};

// [description, amount, category, daysAgo]
const INCOMES = [
    ["Monthly salary", 55000, "Salary", 2],
    ["Website project", 12000, "Freelance", 6],
    ["Dividend payout", 1800, "Investment", 9],
    ["Birthday gift", 2000, "Gift", 13],
    ["Logo design", 4500, "Freelance", 17],
    ["Monthly salary", 55000, "Salary", 32],
    ["Shop sales", 9000, "Business", 36],
    ["Mutual fund returns", 3200, "Investment", 41],
    ["Order refund", 850, "Refund", 45],
    ["App bug fixing", 7000, "Freelance", 52],
    ["Monthly salary", 55000, "Salary", 62],
    ["Festival bonus", 8000, "Salary", 68],
    ["Old phone sold", 6000, "Other", 75],
    ["Tuition income", 5000, "Business", 83],
    ["Interest credited", 1200, "Investment", 90],
];

const EXPENSES = [
    ["Groceries", 2400, "Food", 1],
    ["Petrol", 1500, "Transport", 3],
    ["Electricity bill", 2100, "Bills", 5],
    ["Movie tickets", 900, "Entertainment", 8],
    ["Doctor visit", 700, "Health", 11],
    ["New shoes", 3200, "Shopping", 15],
    ["Restaurant dinner", 1800, "Food", 19],
    ["Metro card recharge", 500, "Transport", 24],
    ["Internet bill", 999, "Bills", 30],
    ["Online course", 2999, "Education", 38],
    ["Medicines", 640, "Health", 44],
    ["Groceries", 2700, "Food", 50],
    ["Cab rides", 1100, "Transport", 58],
    ["Jacket", 2500, "Shopping", 67],
    ["Concert pass", 1500, "Entertainment", 80],
];

export async function seedOnce(uid) {
    const batch = writeBatch(db);
    const add = (col, rows) =>
        rows.forEach(([description, amount, category, ago]) =>
            batch.set(doc(collection(db, col)), {
                description, amount, category, date: daysAgo(ago), uid,
            })
        );
    add("incomes", INCOMES);
    add("expenses", EXPENSES);
    await batch.commit();
}
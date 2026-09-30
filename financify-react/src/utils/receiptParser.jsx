// Rule-based receipt parser. Input: raw OCR text. Output: { description, amount, date, category }.
// Empty values mean "not found": the caller falls back (date -> today, category -> "Other").

const KEEP_UPPER = new Set(["BSES", "IOCL", "HDFC", "SBI", "UPI", "PVR", "KFC"]);

const toLines = (text) =>
    text.split("\n").map((l) => l.trim()).filter(Boolean);

// ---------------- AMOUNT ----------------

const TIER1 =
    /grand\s*total|net\s*(amount|payable|amt)|amount\s*(paid|payable)|amt\s*paid|sale\s*amount|bill\s*amount|total\s*(payable|amt|amount)|payable/i;
const TIER2 = /\btotal\b/i;
const NOT_TOTAL = /sub\s*-?\s*total|total\s*mrp|total\s*(qty|items?|savings?|discount)|gst|tax/i;

function numbersIn(line) {
    const cleaned = line.replace(/\d+(?:\.\d+)?\s*%/g, " "); // drop 5%, 2.5%
    const found = cleaned.match(/\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?/g) || [];
    return found.map((n) => Number(n.replace(/,/g, ""))).filter((n) => n > 0);
}

function extractAmount(lines) {
    for (const tier of [TIER1, TIER2]) {
        // scan bottom-up: the final payable figure sits near the end
        for (let i = lines.length - 1; i >= 0; i--) {
            if (!tier.test(lines[i]) || NOT_TOTAL.test(lines[i])) continue;
            let nums = numbersIn(lines[i]);
            if (!nums.length && lines[i + 1]) nums = numbersIn(lines[i + 1]);
            if (nums.length) return nums[nums.length - 1];
        }
    }
    // fallback: biggest currency-marked figure
    const marked = lines
        .join(" ")
        .match(/(?:₹|rs\.?|inr)\s*\d[\d,]*(?:\.\d{1,2})?/gi);
    if (marked) {
        const vals = marked.map((m) => Number(m.replace(/[^\d.]/g, ""))).filter((n) => n > 0);
        if (vals.length) return Math.max(...vals);
    }
    return "";
}

// ---------------- DATE ----------------

const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const NUM_DATE = "\\b(\\d{1,2})[\\/\\-.](\\d{1,2})[\\/\\-.](\\d{2,4})\\b";
const TXT_DATE = "\\b(\\d{1,2})[\\s\\-]([A-Za-z]{3})[a-z]*[\\s\\-,]+(\\d{2,4})\\b";

const iso = (y, m, d) => {
    y = String(y).length === 2 ? 2000 + Number(y) : Number(y);
    if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return "";
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

function dateFromLine(line) {
    const n = new RegExp(NUM_DATE).exec(line);
    if (n) {
        let [a, b, y] = [Number(n[1]), Number(n[2]), n[3]];
        // Indian receipts are DD/MM; only swap if it can't be DD/MM
        const out = b > 12 && a <= 12 ? iso(y, a, b) : iso(y, b, a);
        if (out) return out;
    }
    const t = new RegExp(TXT_DATE).exec(line);
    if (t) {
        const m = MONTHS.indexOf(t[2].toLowerCase()) + 1;
        if (m) return iso(t[3], m, Number(t[1]));
    }
    return "";
}

function extractDate(lines) {
    for (const l of lines) if (/date|\bdt\b/i.test(l)) { const d = dateFromLine(l); if (d) return d; }
    for (const l of lines) { const d = dateFromLine(l); if (d) return d; }
    return "";
}

// ---------------- DESCRIPTION ----------------

const SKIP_DESC =
    /\b(gstin|gst|invoice|receipt|bill|memo|tax|date|total|ph|phone|tel|www|cash|order|fssai|welcome)\b|https?:/i;

const titleCase = (s) =>
    s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())
        .replace(/\b[A-Za-z]+\b/g, (w) => (KEEP_UPPER.has(w.toUpperCase()) ? w.toUpperCase() : w));

function extractDescription(lines) {
    const pick = lines.slice(0, 6).find((l) => {
        const letters = (l.match(/[A-Za-z]/g) || []).length;
        return l.length >= 3 && l.length <= 40 && letters >= 3 && letters / l.length > 0.6 && !SKIP_DESC.test(l);
    });
    return pick ? titleCase(pick) : "Receipt Expense";
}

// ---------------- CATEGORY ----------------

const CATEGORY_WORDS = {
    Food: ["fssai", "restaurant", "dhaba", "rasoi", "cafe", "bakery", "pizza", "burger", "biryani", "naan", "lassi", "paneer", "chicken", "thali", "swiggy", "zomato", "sweets", "dal", "rice"],
    Transport: ["petrol", "diesel", "fuel", "indian oil", "iocl", "bpcl", "hpcl", "filling station", "uber", "ola", "rapido", "metro", "cab", "taxi", "parking", "toll", "fastag"],
    Shopping: ["mall", "trends", "fashion", "shirt", "jeans", "apparel", "amazon", "flipkart", "myntra", "mrp", "exchange", "lifestyle", "westside", "footwear"],
    Bills: ["electricity", "bses", "recharge", "broadband", "airtel", "jio", "consumer no", "kwh", "postpaid", "dth", "water bill", "gas bill", "units consumed"],
    Health: ["pharmacy", "medical", "medicine", "medicines", "tab", "tablet", "syrup", "hospital", "clinic", "doctor", "diagnostic", "patient", "apollo", "dl no"],
    Entertainment: ["movie", "cinema", "pvr", "inox", "netflix", "spotify", "bookmyshow", "gaming"],
    Education: ["tuition", "school", "college", "university", "course", "stationery", "exam fee", "books"],
};

function detectCategory(text) {
    const t = text.toLowerCase();
    let best = "Other", bestScore = 0;
    for (const [cat, words] of Object.entries(CATEGORY_WORDS)) {
        const score = words.filter((w) => new RegExp(`\\b${w}\\b`).test(t)).length;
        if (score > bestScore) { best = cat; bestScore = score; }
    }
    return best;
}

// ---------------- PUBLIC ----------------

export function parseReceipt(text) {
    const lines = toLines(text);
    return {
        description: extractDescription(lines),
        amount: extractAmount(lines),
        date: extractDate(lines),
        category: detectCategory(text),
    };
}
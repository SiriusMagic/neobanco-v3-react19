// Servidor simulado que corre en el navegador.
//
// Reemplaza al antiguo backend FastAPI + MongoDB: mismas rutas (/api/...), misma
// lógica y mismo formato de respuesta, pero los datos se guardan en localStorage.
// Expone la misma interfaz que axios (get/post/patch/put/delete -> { data }),
// así que las páginas solo cambian el import.

const STORAGE_KEY = "neobanco-db-v1";
const USER = "default_user";

// ---------- Base de datos en localStorage ----------

const emptyDb = () => ({
  cards: [],
  transactions: [],
  documents: [],
  destroyed_cards: [],
  vault: null,
  vault_transactions: [],
  goals: [],
  contributions: [],
  subscriptions: [],
  loans: [],
  points_balance: null,
  points_transactions: [],
  interest_discounts: [],
  insurance_policies: [],
  insurance_claims: [],
  profile: null,
  devices: null,
  settings: null,
});

let memoryDb = null; // respaldo si localStorage no está disponible

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...emptyDb(), ...JSON.parse(raw) };
  } catch {
    if (memoryDb) return memoryDb;
  }
  return memoryDb || emptyDb();
}

function save(db) {
  memoryDb = db;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // navegación privada o almacenamiento lleno: seguimos en memoria
  }
}

/** Borra todos los datos guardados (útil para reiniciar la demo). */
export function resetLocalData() {
  memoryDb = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* sin acceso a localStorage */
  }
}

// ---------- Utilidades ----------

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

const DAY = 24 * 60 * 60 * 1000;
const nowDate = () => new Date();
const iso = (d) => d.toISOString();
const ymd = (d) => d.toISOString().slice(0, 10); // como strftime("%Y-%m-%d") en UTC
const addDays = (d, n) => new Date(d.getTime() + n * DAY);
const startOfTodayUtc = () => {
  const d = nowDate();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const randUniform = (a, b) => a + Math.random() * (b - a);
const round2 = (n) => Math.round(n * 100) / 100;
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const byDateDesc = (key) => (a, b) => new Date(b[key]) - new Date(a[key]);
const byDateAsc = (key) => (a, b) => new Date(a[key]) - new Date(b[key]);

class ApiError extends Error {
  constructor(status, detail) {
    super(detail);
    this.response = { status, data: { detail } };
  }
}
const fail = (status, detail) => {
  throw new ApiError(status, detail);
};

function findCard(db, id) {
  const card = db.cards.find((c) => c.id === id);
  if (!card) fail(404, "Card not found");
  return card;
}

// ---------- Datos de configuración (copiados del backend original) ----------

const SUBSCRIPTION_PLANS = {
  bronze: { name: "Bronce", level: "bronze", monthly_fee: 9.99, interest_rate: 3.5, loan_limit: 150.0, microcredit_only: true, major_loans_limit: 0, icon: "bronze", color: "#CD7F32" },
  silver: { name: "Plata", level: "silver", monthly_fee: 19.99, interest_rate: 2.0, loan_limit: 500.0, microcredit_only: true, major_loans_limit: 0, icon: "silver", color: "#C0C0C0" },
  gold: { name: "Oro", level: "gold", monthly_fee: 49.99, interest_rate: 1.5, loan_limit: 2000.0, microcredit_only: false, major_loans_limit: 1, icon: "gold", color: "#FFD700" },
  platinum: { name: "Platino", level: "platinum", monthly_fee: 99.99, interest_rate: 1.0, loan_limit: 10000.0, microcredit_only: false, major_loans_limit: -1, icon: "platinum", color: "#E5E4E2" },
};

const MISSIONS_CONFIG = [
  { id: "subscription_loyalty", name: "Lealtad de Suscripción", description: "Paga tu suscripción mensual", points: 10, mission_type: "active", icon: "crown", event: "subscription_paid" },
  { id: "loan_repayment", name: "Pago Puntual", description: "Repaga tu préstamo a tiempo", points: 50, mission_type: "active", icon: "check-circle", event: "loan_repaid" },
  { id: "card_purchases", name: "Compras con Tarjeta", description: "Realiza compras con tus tarjetas", points: 2, mission_type: "passive", icon: "shopping-cart", event: "card_purchase" },
  { id: "bill_payments", name: "Pago de Servicios", description: "Paga servicios públicos", points: 5, mission_type: "passive", icon: "file-text", event: "bill_payment" },
];

const REDEMPTION_OPTIONS = [
  { id: "cash_1", name: "$1.00 en Bóveda", description: "Canjea 100 puntos por $1.00 depositado en tu bóveda", points_cost: 100, reward_amount: 1.0, redeem_type: "cash", icon: "dollar-sign" },
  { id: "cash_2", name: "$2.00 en Bóveda", description: "Canjea 200 puntos por $2.00 depositado en tu bóveda", points_cost: 200, reward_amount: 2.0, redeem_type: "cash", icon: "dollar-sign" },
  { id: "cash_10", name: "$10.00 en Bóveda", description: "Canjea 1000 puntos por $10.00 depositado en tu bóveda", points_cost: 1000, reward_amount: 10.0, redeem_type: "cash", icon: "dollar-sign" },
  { id: "interest_discount", name: "Descuento de Interés 0.5%", description: "Reduce 0.5% la tasa de interés de tu próximo préstamo", points_cost: 500, reward_amount: 0.5, redeem_type: "interest_discount", icon: "percent" },
  { id: "exclusive_benefits", name: "Beneficios Exclusivos", description: "Próximamente: meses gratis, upgrades temporales y más", points_cost: 0, reward_amount: 0, redeem_type: "benefits", icon: "gift", coming_soon: true },
];

const INSURANCE_PLANS = [
  { id: "vault_protection", name: "Plan Único: Protección de Bóveda", plan_type: "vault_protection", monthly_fee: 15.99, coverage_normal: 100, coverage_negligent: 75 },
  { id: "basic_card", name: "Seguro Básico de Tarjetas", plan_type: "basic_card", monthly_fee: 5.99, coverage_normal: 100, coverage_negligent: 0 },
  { id: "premium_card", name: "Seguro Premium de Tarjetas", plan_type: "premium_card", monthly_fee: 9.99, coverage_normal: 100, coverage_negligent: 50 },
];

const HOLDER = "ADONIS Yuanshi SARANGO González";

// ---------- Creación perezosa (como hacía el backend) ----------

function getOrCreateVault(db) {
  if (!db.vault) {
    db.vault = { id: newId(), user_id: USER, name: "Mi Bóveda Segura", balance: 10000.0, created_at: iso(nowDate()) };
  }
  return db.vault;
}

function getOrCreatePoints(db) {
  if (!db.points_balance) {
    db.points_balance = { id: newId(), user_id: USER, total_points: 0, lifetime_points: 0, created_at: iso(nowDate()) };
  }
  return db.points_balance;
}

function activeSubscription(db) {
  return db.subscriptions.find((s) => s.user_id === USER && s.status === "active") || null;
}

function makeSubscription(plan_level) {
  const plan = SUBSCRIPTION_PLANS[plan_level];
  const now = nowDate();
  return {
    id: newId(), user_id: USER, plan: plan_level, monthly_fee: plan.monthly_fee,
    interest_rate: plan.interest_rate, loan_limit: plan.loan_limit, status: "active",
    start_date: iso(now), next_billing_date: iso(addDays(now, 30)),
  };
}

// ---------- Datos de demostración ----------

function seedCards(db) {
  db.cards = [];
  db.transactions = [];
  db.documents = [];
  const cardsData = [
    { type: "debit", balance: 66603.0, last4: "4532", exp_month: "12", exp_year: "2027", color_theme: "turquoise", cashback: 125.5 },
    { type: "credit", balance: 2500.5, last4: "8921", exp_month: "06", exp_year: "2026", color_theme: "blue", cashback: 45.25 },
    { type: "virtual", balance: 80.0, last4: "1234", exp_month: "03", exp_year: "2025", color_theme: "green", cashback: 2.1 },
  ];
  const categories = ["Alimentación", "Transporte", "Entretenimiento", "Compras", "Servicios", "Salud"];
  const descriptions = ["Supermercado", "Gasolina", "Cine", "Tienda online", "Netflix", "Farmacia", "Restaurante", "Uber", "Spotify", "Amazon", "Electricidad", "Gimnasio"];
  const docTypes = ["Estado de cuenta", "Contrato", "Términos y condiciones", "Seguro de tarjeta"];
  const ids = [];
  for (const c of cardsData) {
    const card = { id: newId(), holder_name: HOLDER, brand: "VISA", frozen: false, ...c };
    db.cards.push(card);
    ids.push(card.id);
    const n = randInt(20, 30);
    for (let i = 0; i < n; i++) {
      const date = new Date(nowDate().getTime() - randInt(0, 30) * DAY - randInt(0, 23) * 3600 * 1000);
      db.transactions.push({ id: newId(), card_id: card.id, date: iso(date), amount: -round2(randUniform(5, 500)), category: choice(categories), description: choice(descriptions) });
    }
    for (const name of docTypes) {
      db.documents.push({ id: newId(), card_id: card.id, name, url: `/documents/${card.id}/${name.replace(/ /g, "_").toLowerCase()}.pdf` });
    }
  }
  return ids;
}

function seedGoals(db) {
  db.goals = [];
  db.contributions = [];
  const now = nowDate();
  const goalsData = [
    { name: "Tarjetas", target_amount: 100.0, current_amount: 0.0, category: "general", created_at: iso(now), target_date: null, color: "#FFD700" },
    { name: "Mi primer millón", target_amount: 800.0, current_amount: 1.57, category: "savings", created_at: iso(addDays(now, -15)), target_date: null, color: "#FFD700" },
    { name: "Vacaciones", target_amount: 500.0, current_amount: 150.0, category: "travel", created_at: iso(addDays(now, -30)), target_date: iso(addDays(now, 90)), color: "#00CED1" },
  ];
  const ids = [];
  goalsData.forEach((g, i) => {
    const goal = { id: newId(), user_id: USER, icon: "mountain", ...g };
    db.goals.push(goal);
    ids.push(goal.id);
    if (i > 0) {
      const n = randInt(3, 8);
      for (let j = 0; j < n; j++) {
        const date = new Date(now.getTime() - randInt(0, 30) * DAY - randInt(0, 23) * 3600 * 1000);
        db.contributions.push({ id: newId(), goal_id: goal.id, amount: round2(randUniform(5, 50)), date: iso(date), description: `Aporte #${j + 1}`, type: "deposit" });
      }
    }
  });
  return ids;
}

function seedVault(db) {
  db.vault = null;
  db.vault_transactions = [];
  return getOrCreateVault(db).id;
}

function seedSubscriptions(db) {
  db.subscriptions = [makeSubscription("bronze")];
  db.loans = [];
  return db.subscriptions[0].id;
}

function seedMissions(db) {
  const now = iso(nowDate());
  db.points_balance = { id: newId(), user_id: USER, total_points: 250, lifetime_points: 250, created_at: now };
  db.points_transactions = [
    { id: newId(), user_id: USER, points: 10, transaction_type: "earn", event_type: "subscription_paid", description: "Pago de suscripción mensual", date: now },
    { id: newId(), user_id: USER, points: 50, transaction_type: "earn", event_type: "loan_repaid", description: "Repago puntual de préstamo", date: now },
    { id: newId(), user_id: USER, points: 2, transaction_type: "earn", event_type: "card_purchase", description: "Compra con tarjeta", date: now },
  ];
  return db.points_balance.id;
}

// ---------- Rutas ----------
// Cada handler recibe ({ db, params, query, body }) y devuelve los datos de la respuesta.

const num = (v) => (v === undefined || v === null || v === "" ? undefined : Number(v));

const routes = [
  ["GET", "/", () => ({ message: "Aira Card Management API (local)" })],

  // --- Tarjetas ---
  ["GET", "/cards", ({ db }) => db.cards],
  ["GET", "/cards/destroyed-history", ({ db }) => [...db.destroyed_cards].sort(byDateDesc("destroyed_at")).slice(0, 100)],
  ["GET", "/cards/:id", ({ db, params }) => findCard(db, params.id)],
  ["GET", "/cards/:id/transactions", ({ db, params, query }) => {
    const range = query.range || "semana";
    const start = range === "hoy" ? startOfTodayUtc() : addDays(nowDate(), range === "semana" ? -7 : -30);
    return db.transactions.filter((t) => t.card_id === params.id && new Date(t.date) >= start).sort(byDateDesc("date"));
  }],
  ["GET", "/cards/:id/documents", ({ db, params }) => db.documents.filter((d) => d.card_id === params.id)],
  ["PATCH", "/cards/:id/freeze", ({ db, params, body, save: persist }) => {
    const card = findCard(db, params.id);
    card.frozen = Boolean(body.frozen);
    persist();
    return card;
  }],
  ["GET", "/cards/:id/history", ({ db, params, query }) => {
    const range = query.range_type || "semana";
    let start, days;
    if (range === "hoy") { start = startOfTodayUtc(); days = 1; }
    else if (range === "semana") { start = addDays(nowDate(), -7); days = 7; }
    else { start = addDays(nowDate(), -30); days = 30; }
    const daily = {};
    for (let i = 0; i < days; i++) daily[ymd(addDays(start, i))] = 0;
    for (const t of db.transactions) {
      if (t.card_id !== params.id || new Date(t.date) < start) continue;
      const key = ymd(new Date(t.date));
      if (key in daily) daily[key] += Math.abs(t.amount);
    }
    return Object.keys(daily).sort().map((date) => ({ date, amount: daily[date] }));
  }],
  ["POST", "/cards/create-disposable", ({ db, body, save: persist }) => {
    const amount = Number(body.amount);
    const vault = db.vault;
    if (!vault || vault.balance < amount) fail(400, "Fondos insuficientes en la Bóveda");
    const card = {
      id: newId(), type: "disposable", holder_name: body.holder_name || "USUARIO AIRA", brand: body.brand,
      balance: amount, initial_amount: amount, frozen: false, last4: String(randInt(1000, 9999)),
      exp_month: body.exp_month, exp_year: body.exp_year, color_theme: body.brand === "Mastercard" ? "purple" : "orange",
      cashback: 0.0, created_at: iso(nowDate()),
    };
    db.cards.push(card);
    vault.balance -= amount;
    persist();
    return card;
  }],
  ["POST", "/cards/:id/return-funds", ({ db, params, save: persist }) => {
    const card = findCard(db, params.id);
    const amount = card.balance || 0;
    if (amount <= 0) fail(400, "No funds to return");
    card.balance = 0.0;
    if (db.vault) db.vault.balance += amount;
    persist();
    return { success: true, amount_returned: amount };
  }],
  ["DELETE", "/cards/:id/destroy", ({ db, params, save: persist }) => {
    const card = findCard(db, params.id);
    if (!["disposable", "virtual"].includes(card.type)) fail(400, "Only disposable cards can be destroyed");
    const amount = card.balance || 0;
    if (amount > 0 && db.vault) db.vault.balance += amount;
    db.destroyed_cards.push({
      id: newId(), card_id: card.id, holder_name: card.holder_name, brand: card.brand, last4: card.last4,
      initial_amount: card.initial_amount || 0, returned_amount: amount, destruction_reason: "Manual", destroyed_at: iso(nowDate()),
    });
    db.cards = db.cards.filter((c) => c.id !== card.id);
    persist();
    return { success: true, amount_returned: amount };
  }],
  ["POST", "/cards/:id/send", ({ db, params, body, save: persist }) => {
    const card = findCard(db, params.id);
    const amount = Number(body.amount);
    if ((card.balance || 0) < amount) fail(400, "Insufficient balance");
    card.balance -= amount;
    persist();
    return { success: true, amount_sent: amount };
  }],
  ["POST", "/cards/:id/receive", ({ db, params, body, save: persist }) => {
    const card = findCard(db, params.id);
    const amount = Number(body.amount);
    card.balance += amount;
    persist();
    return { success: true, amount_received: amount };
  }],
  // Carga todos los datos de demostración de una vez (el backend lo hacía en varias rutas).
  ["POST", "/dev/seed", ({ db, save: persist }) => {
    const card_ids = seedCards(db);
    if (!db.vault) seedVault(db);
    if (!activeSubscription(db)) seedSubscriptions(db);
    if (!db.points_balance) seedMissions(db);
    persist();
    return { message: "Database seeded successfully", card_ids };
  }],

  // --- Perfil ---
  ["GET", "/profile", ({ db, save: persist }) => {
    if (!db.profile) {
      db.profile = {
        id: newId(), user_id: USER, name: HOLDER, email: "sarangoadonis52@gmail.com", phone: "098 267 3214",
        id_number: "1234567890", id_verified: true, address: "", two_factor_enabled: false,
        daily_send_limit: 5000.0, card_spend_limit: 10000.0, created_at: iso(nowDate()),
      };
      persist();
    }
    return db.profile;
  }],
  ["PATCH", "/profile", ({ db, body, save: persist }) => {
    if (db.profile) Object.assign(db.profile, body);
    persist();
    return { message: "Profile updated successfully" };
  }],
  ["POST", "/profile/toggle-2fa", ({ db, save: persist }) => {
    if (!db.profile) fail(400, "Profile not found");
    db.profile.two_factor_enabled = !db.profile.two_factor_enabled;
    persist();
    return { message: "2FA toggled", enabled: db.profile.two_factor_enabled };
  }],
  ["GET", "/profile/devices", ({ db, save: persist }) => {
    if (!db.devices || db.devices.length === 0) {
      db.devices = [{ id: newId(), user_id: USER, name: "098 267 3214", device_type: "mobile", is_current: true, last_access: iso(nowDate()) }];
      persist();
    }
    return db.devices;
  }],
  ["DELETE", "/profile/devices/:id", ({ db, params, save: persist }) => {
    db.devices = (db.devices || []).filter((d) => d.id !== params.id);
    persist();
    return { message: "Device revoked" };
  }],
  ["GET", "/profile/settings", ({ db, save: persist }) => {
    if (!db.settings) {
      db.settings = {
        id: newId(), user_id: USER, notifications: { transactions: true, missions: true, subscriptions: true },
        notificationMethod: "push", darkMode: false, language: "es",
      };
      persist();
    }
    return db.settings;
  }],
  ["PATCH", "/profile/settings", ({ db, body, save: persist }) => {
    db.settings = { ...(db.settings || { id: newId(), user_id: USER }), ...body };
    persist();
    return { message: "Settings updated" };
  }],

  // --- Metas ---
  ["GET", "/goals", ({ db }) => db.goals],
  ["GET", "/goals/:id", ({ db, params }) => db.goals.find((g) => g.id === params.id) || fail(404, "Goal not found")],
  ["POST", "/goals", ({ db, body, save: persist }) => {
    const goal = {
      id: newId(), user_id: USER, name: body.name, target_amount: Number(body.target_amount), current_amount: 0.0,
      icon: body.icon || "mountain", category: body.category || "general", created_at: iso(nowDate()),
      target_date: body.target_date ? iso(new Date(body.target_date)) : null, color: "#FFD700",
    };
    db.goals.push(goal);
    persist();
    return goal;
  }],
  ["PATCH", "/goals/:id", ({ db, params, body, save: persist }) => {
    const goal = db.goals.find((g) => g.id === params.id) || fail(404, "Goal not found");
    for (const k of ["name", "target_amount", "target_date"]) {
      if (body[k] !== undefined && body[k] !== null) goal[k] = k === "target_date" ? iso(new Date(body[k])) : body[k];
    }
    persist();
    return goal;
  }],
  ["DELETE", "/goals/:id", ({ db, params, save: persist }) => {
    if (!db.goals.some((g) => g.id === params.id)) fail(404, "Goal not found");
    db.goals = db.goals.filter((g) => g.id !== params.id);
    db.contributions = db.contributions.filter((c) => c.goal_id !== params.id);
    persist();
    return { message: "Goal deleted successfully" };
  }],
  ["GET", "/goals/:id/contributions", ({ db, params, query }) => {
    const start = addDays(nowDate(), -(num(query.days) ?? 30));
    return db.contributions.filter((c) => c.goal_id === params.id && new Date(c.date) >= start).sort(byDateDesc("date"));
  }],
  ["POST", "/goals/:id/contributions", ({ db, params, body, save: persist }) => {
    const goal = db.goals.find((g) => g.id === params.id) || fail(404, "Goal not found");
    const amount = Number(body.amount);
    const type = body.type || "deposit";
    const contribution = { id: newId(), goal_id: goal.id, amount, date: iso(nowDate()), description: body.description ?? null, type };
    db.contributions.push(contribution);
    goal.current_amount = type === "deposit" ? goal.current_amount + amount : Math.max(0, goal.current_amount - amount);
    persist();
    return contribution;
  }],
  ["GET", "/goals/:id/history", ({ db, params, query }) => {
    const days = num(query.days) ?? 30;
    const start = addDays(nowDate(), -days);
    const daily = {};
    db.contributions
      .filter((c) => c.goal_id === params.id && new Date(c.date) >= start)
      .sort(byDateAsc("date"))
      .forEach((c) => {
        const key = ymd(new Date(c.date));
        daily[key] = (daily[key] || 0) + (c.type === "deposit" ? c.amount : -c.amount);
      });
    let cumulative = 0;
    const history = [];
    for (let i = 0; i < days; i++) {
      const key = ymd(addDays(start, i));
      if (key in daily) cumulative += daily[key];
      history.push({ date: key, amount: cumulative });
    }
    return history;
  }],
  ["POST", "/dev/seed-goals", ({ db, save: persist }) => {
    const goal_ids = seedGoals(db);
    persist();
    return { message: "Goals seeded successfully", goal_ids };
  }],

  // --- Suscripciones y préstamos ---
  ["GET", "/subscription-plans", () => Object.values(SUBSCRIPTION_PLANS)],
  ["GET", "/subscription", ({ db }) => activeSubscription(db)],
  ["POST", "/subscription", ({ db, query, body, save: persist }) => {
    const level = query.plan_level || body.plan_level;
    if (!SUBSCRIPTION_PLANS[level]) fail(400, "Invalid plan");
    db.subscriptions.forEach((s) => { if (s.user_id === USER && s.status === "active") s.status = "cancelled"; });
    const sub = makeSubscription(level);
    db.subscriptions.push(sub);
    persist();
    return sub;
  }],
  ["POST", "/loans", ({ db, body, save: persist }) => {
    const sub = activeSubscription(db);
    if (!sub) fail(400, "No hay suscripción activa");
    const plan = SUBSCRIPTION_PLANS[sub.plan];
    const amount = Number(body.amount);
    if (body.loan_type === "microcredit") {
      if (amount > plan.loan_limit) fail(400, `El monto excede el límite de tu plan (${plan.loan_limit})`);
    } else if (body.loan_type === "personal") {
      if (plan.microcredit_only) fail(400, "Tu plan solo permite microcréditos. Actualiza a Oro o Platino.");
      const activeMajor = db.loans.filter((l) => ["personal", "business"].includes(l.loan_type) && ["approved", "active"].includes(l.status)).length;
      if (plan.major_loans_limit !== -1 && activeMajor >= plan.major_loans_limit) fail(400, "Has alcanzado el límite de préstamos mayores de tu plan");
    } else if (body.loan_type === "business") {
      fail(400, "Préstamos para negocios próximamente");
    }
    const interest = amount * (plan.interest_rate / 100);
    const total = amount + interest;
    const now = nowDate();
    const loan = {
      id: newId(), user_id: USER, subscription_id: sub.id, loan_type: body.loan_type, amount,
      interest_rate: plan.interest_rate, total_amount: total, status: body.loan_type === "microcredit" ? "approved" : "pending",
      created_at: iso(now), due_date: iso(addDays(now, 30)), paid_amount: 0.0, remaining_amount: total,
    };
    if (body.cedula) loan.cedula = body.cedula;
    db.loans.push(loan);
    persist();
    return loan;
  }],
  ["GET", "/loans", ({ db }) => [...db.loans].sort(byDateDesc("created_at")).slice(0, 100)],
  ["GET", "/loans/:id", ({ db, params }) => db.loans.find((l) => l.id === params.id) || fail(404, "Préstamo no encontrado")],
  ["POST", "/dev/seed-subscriptions", ({ db, save: persist }) => {
    const subscription_id = seedSubscriptions(db);
    persist();
    return { message: "Subscription seeded successfully", subscription_id };
  }],

  // --- Bóveda ---
  ["GET", "/vault", ({ db, save: persist }) => {
    const created = !db.vault;
    const vault = getOrCreateVault(db);
    if (created) persist();
    return vault;
  }],
  ["POST", "/vault/deposit", ({ db, query, body, save: persist }) => {
    const vault = db.vault || fail(404, "Bóveda no encontrada");
    const amount = Number(query.amount ?? body.amount);
    vault.balance += amount;
    db.vault_transactions.push({ id: newId(), vault_id: vault.id, transaction_type: "deposit", amount, description: "Depósito a bóveda", date: iso(nowDate()) });
    persist();
    return { success: true, new_balance: vault.balance };
  }],
  ["POST", "/vault/transfer-to-card", ({ db, body, save: persist }) => {
    const vault = db.vault || fail(404, "Bóveda no encontrada");
    const amount = Number(body.amount);
    if (vault.balance < amount) fail(400, "Saldo insuficiente en la bóveda");
    const card = db.cards.find((c) => c.id === body.card_id) || fail(404, "Tarjeta no encontrada");
    vault.balance -= amount;
    card.balance += amount;
    db.vault_transactions.push({
      id: newId(), vault_id: vault.id, transaction_type: "transfer_to_card", amount, card_id: card.id,
      description: `Transferencia a tarjeta ****${card.last4}`, date: iso(nowDate()),
    });
    persist();
    return { success: true, vault_balance: vault.balance, card_balance: card.balance };
  }],
  ["GET", "/vault/transactions", ({ db, query }) => {
    if (!db.vault) return [];
    const limit = num(query.limit) ?? 10;
    return db.vault_transactions.filter((t) => t.vault_id === db.vault.id).sort(byDateDesc("date")).slice(0, limit);
  }],
  ["GET", "/vault/stats", ({ db, save: persist }) => {
    const vault = db.vault;
    if (!vault) return { monthly_income: 0, monthly_expenses: 0, flow_chart: [] };
    const now = nowDate();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const txs = db.vault_transactions.filter((t) => t.vault_id === vault.id && new Date(t.date) >= monthStart);
    const sum = (type, pred = () => true) => txs.filter((t) => t.transaction_type === type && pred(t)).reduce((a, t) => a + t.amount, 0);
    const flow_chart = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(now, -(6 - i));
      const sameDay = (t) => ymd(new Date(t.date)) === ymd(date);
      flow_chart.push({
        date: date.toLocaleDateString("es", { day: "2-digit", month: "short", timeZone: "UTC" }),
        income: sum("deposit", sameDay),
        expenses: sum("transfer_to_card", sameDay),
      });
    }
    vault.history = txs.slice(-5);
    persist();
    return { monthly_income: sum("deposit"), monthly_expenses: sum("transfer_to_card"), flow_chart };
  }],
  ["POST", "/dev/seed-vault", ({ db, save: persist }) => {
    const vault_id = seedVault(db);
    persist();
    return { message: "Vault seeded successfully", vault_id };
  }],

  // --- Misiones y puntos ---
  ["GET", "/missions/balance", ({ db, save: persist }) => {
    const created = !db.points_balance;
    const balance = getOrCreatePoints(db);
    if (created) persist();
    return balance;
  }],
  ["GET", "/missions", () => MISSIONS_CONFIG],
  ["GET", "/missions/history", ({ db, query }) => {
    const limit = num(query.limit) ?? 20;
    return db.points_transactions.filter((t) => t.user_id === USER).sort(byDateDesc("date")).slice(0, limit);
  }],
  ["GET", "/missions/redemptions", () => REDEMPTION_OPTIONS],
  ["POST", "/missions/redeem", ({ db, body, save: persist }) => {
    const balance = getOrCreatePoints(db);
    const cost = Number(body.points_cost);
    if (balance.total_points < cost) fail(400, "Puntos insuficientes");
    const option = REDEMPTION_OPTIONS.find((o) => o.points_cost === cost) || fail(400, "Opción de canje no válida");
    if (option.coming_soon) fail(400, "Esta opción estará disponible próximamente");
    const reward = Number(body.reward_amount);
    if (body.redeem_type === "cash" && db.vault) {
      db.vault.balance += reward;
      db.vault_transactions.push({ id: newId(), vault_id: db.vault.id, transaction_type: "deposit", amount: reward, description: `Canje de ${cost} puntos`, date: iso(nowDate()) });
    } else if (body.redeem_type === "interest_discount") {
      db.interest_discounts.push({ id: newId(), user_id: USER, discount_percent: reward, used: false, created_at: iso(nowDate()) });
    }
    balance.total_points -= cost;
    db.points_transactions.push({ id: newId(), user_id: USER, points: -cost, transaction_type: "redeem", event_type: body.redeem_type, description: option.name, date: iso(nowDate()) });
    persist();
    return { success: true, new_balance: balance.total_points, reward: option.name };
  }],
  ["POST", "/missions/award/:event", ({ db, params, query, save: persist }) => {
    const balance = getOrCreatePoints(db);
    const points = Number(query.points);
    balance.total_points += points;
    balance.lifetime_points += points;
    db.points_transactions.push({ id: newId(), user_id: USER, points, transaction_type: "earn", event_type: params.event, description: query.description || "", date: iso(nowDate()), related_id: null });
    persist();
    return { success: true, new_balance: balance.total_points };
  }],
  ["POST", "/dev/seed-missions", ({ db, save: persist }) => {
    const balance_id = seedMissions(db);
    persist();
    return { message: "Missions seeded successfully", balance_id };
  }],

  // --- Seguros (no estaban conectados en el backend original) ---
  ["GET", "/insurance", ({ db }) => {
    const policy = db.insurance_policies.find((p) => p.user_id === USER && p.status === "active");
    return policy
      ? { has_insurance: true, plan_name: policy.plan_name || "Plan Único", plan_type: policy.plan_type, monthly_fee: policy.monthly_fee, status: "active" }
      : { has_insurance: false, plan_name: null, plan_type: null, monthly_fee: null, status: "none" };
  }],
  ["POST", "/insurance/activate", ({ db, body, save: persist }) => {
    const plan = INSURANCE_PLANS.find((p) => p.plan_type === (body.plan_type || "vault_protection")) || fail(400, "Plan no encontrado");
    db.insurance_policies.forEach((p) => { if (p.user_id === USER && p.status === "active") p.status = "cancelled"; });
    const now = nowDate();
    const policy = {
      id: newId(), user_id: USER, plan_type: plan.plan_type, plan_name: plan.name, monthly_fee: plan.monthly_fee,
      coverage_percentage_normal: plan.coverage_normal, coverage_percentage_negligent: plan.coverage_negligent,
      status: "active", start_date: iso(now), next_billing_date: iso(addDays(now, 30)),
    };
    db.insurance_policies.push(policy);
    persist();
    return { message: "Plan activado exitosamente", policy_id: policy.id };
  }],
  ["POST", "/insurance/claim", ({ db, body, save: persist }) => {
    const policy = db.insurance_policies.find((p) => p.user_id === USER && p.status === "active") || fail(400, "No tienes un plan activo");
    const claim = {
      id: newId(), user_id: USER, policy_id: policy.id, incident_type: body.incident_type, amount: Number(body.amount),
      description: body.description, status: "pending", evidence_count: body.evidence_count || 0, created_at: iso(nowDate()),
    };
    db.insurance_claims.push(claim);
    persist();
    return { message: "Reclamo enviado exitosamente", claim_id: claim.id, status: "pending" };
  }],
  ["POST", "/dev/seed-insurance", ({ db, save: persist }) => {
    db.insurance_policies = [];
    db.insurance_claims = [];
    persist();
    return { message: "Insurance seeded successfully" };
  }],
];

// Compila "/cards/:id/history" en una expresión regular.
const compiled = routes.map(([method, pattern, handler]) => {
  const keys = [];
  const re = new RegExp(
    "^" + pattern.replace(/\/:([a-zA-Z_]+)/g, (_, k) => { keys.push(k); return "/([^/]+)"; }) + "/?$"
  );
  return { method, re, keys, handler };
});

function bodyToObject(data) {
  if (data == null) return {};
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    const obj = {};
    let evidence = 0;
    for (const [k, v] of data.entries()) {
      if (k === "evidence") evidence++;
      else obj[k] = v;
    }
    obj.evidence_count = evidence;
    return obj;
  }
  if (typeof data === "string") {
    try { return JSON.parse(data); } catch { return {}; }
  }
  return data;
}

async function request(method, url, data, config = {}) {
  const [rawPath, rawQuery = ""] = String(url).split("?");
  // Acepta "/api/cards", "http://x/api/cards" o "undefined/api/cards".
  const idx = rawPath.indexOf("/api");
  const path = idx >= 0 ? rawPath.slice(idx + 4) || "/" : rawPath;
  const query = { ...Object.fromEntries(new URLSearchParams(rawQuery)), ...(config.params || {}) };
  const body = bodyToObject(data);

  for (const r of compiled) {
    if (r.method !== method) continue;
    const m = path.match(r.re);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    const db = load();
    const result = r.handler({ db, params, query, body, save: () => save(db) });
    // Copia profunda para que la UI no modifique la "base de datos" por accidente.
    return { status: 200, data: result === undefined ? null : JSON.parse(JSON.stringify(result)) };
  }
  throw new ApiError(404, `Ruta no encontrada: ${method} ${path}`);
}

const localApi = {
  get: (url, config) => request("GET", url, undefined, config),
  delete: (url, config) => request("DELETE", url, undefined, config),
  post: (url, data, config) => request("POST", url, data, config),
  put: (url, data, config) => request("PUT", url, data, config),
  patch: (url, data, config) => request("PATCH", url, data, config),
};

export default localApi;

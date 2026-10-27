// Pruebas del servidor simulado del neobanco (lógica de negocio).
import { beforeEach, describe, expect, it } from "vitest";
import api, { resetLocalData } from "./localApi";

const store = {};
globalThis.window = {
  localStorage: {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; },
  },
};
const A = "/api";
const fails = async (promise) => {
  try { await promise; } catch (e) { return e.response; }
  throw new Error("se esperaba un error");
};

let cards;
beforeEach(async () => {
  resetLocalData();
  await api.post(`${A}/dev/seed`);
  await api.post(`${A}/dev/seed-goals`);
  cards = (await api.get(`${A}/cards`)).data;
});

describe("tarjetas y bóveda", () => {
  it("carga 3 tarjetas y una bóveda de $10.000", async () => {
    expect(cards).toHaveLength(3);
    expect((await api.get(`${A}/vault`)).data.balance).toBe(10000);
  });

  it("el historial semanal tiene 7 días y solo movimientos de esa tarjeta", async () => {
    const id = cards[0].id;
    expect((await api.get(`${A}/cards/${id}/history?range_type=semana`)).data).toHaveLength(7);
    const txs = (await api.get(`${A}/cards/${id}/transactions`)).data;
    expect(txs.every((t) => t.card_id === id)).toBe(true);
  });

  it("congela una tarjeta", async () => {
    await api.patch(`${A}/cards/${cards[0].id}/freeze`, { frozen: true });
    expect((await api.get(`${A}/cards/${cards[0].id}`)).data.frozen).toBe(true);
  });

  it("transfiere de la bóveda a una tarjeta y rechaza si no hay saldo", async () => {
    const card = cards[0];
    await api.post(`${A}/vault/transfer-to-card`, { card_id: card.id, amount: 500 });
    expect((await api.get(`${A}/vault`)).data.balance).toBe(9500);
    expect((await api.get(`${A}/cards/${card.id}`)).data.balance).toBe(card.balance + 500);
    const err = await fails(api.post(`${A}/vault/transfer-to-card`, { card_id: card.id, amount: 1e9 }));
    expect(err.data.detail).toBe("Saldo insuficiente en la bóveda");
  });

  it("crea y destruye una tarjeta desechable devolviendo el dinero", async () => {
    const disp = (await api.post(`${A}/cards/create-disposable`, { brand: "Mastercard", amount: 200, holder_name: "X", exp_month: "01", exp_year: "2030" })).data;
    expect(disp.type).toBe("disposable");
    expect((await api.get(`${A}/vault`)).data.balance).toBe(9800);
    await api.delete(`${A}/cards/${disp.id}/destroy`);
    expect((await api.get(`${A}/vault`)).data.balance).toBe(10000);
    expect((await api.get(`${A}/cards/destroyed-history`)).data).toHaveLength(1);
  });

  it("no permite destruir una tarjeta de débito", async () => {
    expect((await fails(api.delete(`${A}/cards/${cards[0].id}/destroy`))).status).toBe(400);
  });
});

describe("metas", () => {
  it("suma aportes y resta retiros", async () => {
    const goal = (await api.post(`${A}/goals`, { name: "Moto", target_amount: 1000 })).data;
    await api.post(`${A}/goals/${goal.id}/contributions`, { amount: 100, type: "deposit" });
    await api.post(`${A}/goals/${goal.id}/contributions`, { amount: 30, type: "withdraw" });
    expect((await api.get(`${A}/goals/${goal.id}`)).data.current_amount).toBe(70);
    expect((await api.get(`${A}/goals/${goal.id}/history?days=30`)).data).toHaveLength(30);
  });
});

describe("suscripciones y préstamos", () => {
  it("el plan Bronce solo permite microcréditos, con 3,5 % de interés", async () => {
    expect((await api.get(`${A}/subscription`)).data.plan).toBe("bronze");
    expect((await fails(api.post(`${A}/loans`, { loan_type: "personal", amount: 100 }))).status).toBe(400);
    const loan = (await api.post(`${A}/loans`, { loan_type: "microcredit", amount: 100 })).data;
    expect(loan.status).toBe("approved");
    expect(loan.total_amount).toBeCloseTo(103.5);
  });

  it("con plan Oro permite un préstamo personal pendiente", async () => {
    await api.post(`${A}/subscription?plan_level=gold`);
    const loan = (await api.post(`${A}/loans`, { loan_type: "personal", amount: 1000, cedula: "1" })).data;
    expect(loan.status).toBe("pending");
  });
});

describe("misiones, seguros y perfil", () => {
  it("canjea puntos por dinero en la bóveda", async () => {
    expect((await api.get(`${A}/missions/balance`)).data.total_points).toBe(250);
    const r = (await api.post(`${A}/missions/redeem`, { redeem_type: "cash", points_cost: 200, reward_amount: 2 })).data;
    expect(r.new_balance).toBe(50);
    expect((await api.get(`${A}/vault`)).data.balance).toBe(10002);
  });

  it("activa un seguro y registra un reclamo", async () => {
    expect((await api.get(`${A}/insurance`)).data.has_insurance).toBe(false);
    await api.post(`${A}/insurance/activate`, { plan_type: "vault_protection" });
    expect((await api.get(`${A}/insurance`)).data.has_insurance).toBe(true);
    const fd = new FormData();
    fd.append("amount", "50"); fd.append("description", "x"); fd.append("incident_type", "fraud");
    expect((await api.post(`${A}/insurance/claim`, fd)).data.status).toBe("pending");
  });

  it("calcula las estadísticas del mes", async () => {
    await api.post(`${A}/vault/transfer-to-card`, { card_id: cards[0].id, amount: 500 });
    const stats = (await api.get(`${A}/vault/stats`)).data;
    expect(stats.flow_chart).toHaveLength(7);
    expect(stats.monthly_expenses).toBe(500);
  });

  it("activa la verificación en dos pasos y guarda ajustes", async () => {
    const before = (await api.get(`${A}/profile`)).data.two_factor_enabled;
    await api.post(`${A}/profile/toggle-2fa`);
    expect((await api.get(`${A}/profile`)).data.two_factor_enabled).toBe(!before);
    await api.patch(`${A}/profile/settings`, { darkMode: true });
    expect((await api.get(`${A}/profile/settings`)).data.darkMode).toBe(true);
  });

  it("responde 404 en rutas que no existen", async () => {
    expect((await fails(api.get(`${A}/nope`))).status).toBe(404);
  });
});

const SR_API = process.env.SHIPROCKET_API_URL || "https://apiv2.shiprocket.in/v1/external";

let authToken = null;
let tokenExpiry = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${SR_API}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Shiprocket API error: ${res.status}`);
  return data;
}

export async function login() {
  if (authToken && tokenExpiry && Date.now() < tokenExpiry) return authToken;
  const data = await makeRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });
  authToken = data.token;
  tokenExpiry = Date.now() + 6 * 60 * 60 * 1000;
  return authToken;
}

export async function createOrder(orderData) {
  await login();
  return makeRequest("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export async function generateAWB(shipmentId) {
  await login();
  return makeRequest("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentId }),
  });
}

export async function requestPickup(shipmentIds) {
  await login();
  return makeRequest("/courier/pickup", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
}

export async function trackShipment(shipmentId) {
  await login();
  return makeRequest(`/courier/track/shipments/${shipmentId}`);
}

export async function cancelShipment(shipmentIds) {
  await login();
  return makeRequest("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: shipmentIds }),
  });
}

export async function getPickupLocations() {
  await login();
  return makeRequest("/settings/company/pickup");
}

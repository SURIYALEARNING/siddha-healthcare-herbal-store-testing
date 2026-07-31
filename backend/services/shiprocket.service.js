import ShiprocketAuth from "../models/ShiprocketAuth.js";
import ShiprocketSettings from "../models/ShiprocketSettings.js";

const SR_API = process.env.SHIPROCKET_API_URL || "https://apiv2.shiprocket.in/v1/external";

let cachedToken = null;
let cachedExpiry = null;

async function readTokenFromDb() {
  const doc = await ShiprocketAuth.findOne().sort({ createdAt: -1 }).lean();
  if (doc && new Date(doc.expiresAt) > new Date()) {
    cachedToken = doc.token;
    cachedExpiry = new Date(doc.expiresAt).getTime();
    return doc.token;
  }
  cachedToken = null;
  cachedExpiry = null;
  return null;
}

async function saveTokenToDb(token) {
  await ShiprocketAuth.deleteMany({});
  const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);

  await ShiprocketAuth.create({ token, expiresAt });
  cachedToken = token;
  cachedExpiry = expiresAt.getTime();
}

async function loginToShiprocket() {


  const url = `${SR_API}/auth/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  const data = await res.json();


  if (!res.ok) throw new Error(data.message || `Shiprocket login failed: ${res.status}`);
  await saveTokenToDb(data.token);
  return data.token;
}

export async function getValidToken() {
  if (cachedToken && cachedExpiry && Date.now() < cachedExpiry) return cachedToken;
  const fromDb = await readTokenFromDb();
  if (fromDb) return fromDb;
  return loginToShiprocket();
}

async function makeRequest(endpoint, options = {}) {
  const execute = async (token) => {
    const url = `${SR_API}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message || `Shiprocket API error: ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  };

  try {
    const token = await getValidToken();
    return await execute(token);
  } catch (err) {
    if (err.status === 401) {
      cachedToken = null;
      cachedExpiry = null;
      await ShiprocketAuth.deleteMany({});
      const newToken = await loginToShiprocket();
      return execute(newToken);
    }
    throw err;
  }
}

export async function login() {
  return getValidToken();
}

export async function createOrder(orderData) {
  return makeRequest("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export async function generateAWB(shipmentId) {
  return makeRequest("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentId }),
  });
}

export async function requestPickup(shipmentIds) {
  return makeRequest("/courier/pickup", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
}

export async function trackShipment(shipmentId) {
  return makeRequest(`/courier/track/shipments/${shipmentId}`);
}

export async function cancelShipment(shipmentIds) {
  return makeRequest("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: shipmentIds }),
  });
}

export async function getPickupLocations() {
  return makeRequest("/settings/company/pickup");
}

export async function syncPickupLocations() {
  try {
    const data = await getPickupLocations();
    const addresses = data?.data?.shipping_address || data?.shipping_address || [];
    const companyName = data?.data?.company_name || data?.company_name || "";

    await ShiprocketSettings.deleteMany({});
    await ShiprocketSettings.create({
      pickupLocations: addresses,
      companyName,
      lastSyncedAt: new Date(),
    });

    return { success: true, count: addresses.length, companyName };
  } catch (error) {
    console.error("Failed to sync pickup locations:", error);
    throw error;
  }
}

export async function getStoredPickupLocations() {
  try {
    const settings = await ShiprocketSettings.findOne().sort({ createdAt: -1 }).lean();
    if (settings && settings.pickupLocations && settings.pickupLocations.length > 0) {
      return settings.pickupLocations.map((loc) => ({
        id: loc.id,
        pickup_location: loc.pickup_location,
        address: loc.address,
        address_2: loc.address_2,
        city: loc.city,
        state: loc.state,
        country: loc.country,
        pin_code: loc.pin_code,
        email: loc.email,
        phone: loc.phone,
        name: loc.name,
        is_primary_location: loc.is_primary_location,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function ndrAction(awb, action, comments) {
  return makeRequest(`/ndr/${awb}/action`, {
    method: "POST",
    body: JSON.stringify({ action, comments }),
  });
}

export async function checkServiceability({ pickupPincode, deliveryPincode, weight = 0.5, cod = false }) {
  const params = new URLSearchParams({
    pickup_postcode: String(pickupPincode),
    delivery_postcode: String(deliveryPincode),
    weight: String(weight),
    cod: cod ? "1" : "0",
  });
  const response = await makeRequest(`/courier/serviceability/?${params.toString()}`);

  const couriers = response?.data?.available_courier_companies ?? [];

  if (!Array.isArray(couriers) || couriers.length === 0) {
    return {
      success: true,
      available: false,
      message: "Delivery is not available for this pincode.",
      estimatedDays: null,
      estimatedDate: null,
      codAvailable: false,
      courier: null,
    };
  }

  const bestCourier = [...couriers].sort((a, b) => {
    const dayA = Number(a.estimated_delivery_days || 999);
    const dayB = Number(b.estimated_delivery_days || 999);
    if (dayA !== dayB) return dayA - dayB;
    return Number(a.freight_charge || 0) - Number(b.freight_charge || 0);
  })[0];

  return {
    success: true,
    available: true,
    message: "Delivery available",
    estimatedDays: Number(bestCourier.estimated_delivery_days),
    estimatedDate: bestCourier.etd,
    codAvailable: bestCourier.cod === 1,
    courier: {
      id: bestCourier.courier_company_id,
      name: bestCourier.courier_name,
      rating: bestCourier.rating,
      freightCharge: bestCourier.freight_charge,
      tracking: bestCourier.realtime_tracking,
      deliveryPerformance: bestCourier.delivery_performance,
    },
    couriers: couriers.map((c) => ({
      id: c.courier_company_id,
      name: c.courier_name,
      estimatedDays: Number(c.estimated_delivery_days),
      estimatedDate: c.etd,
      freightCharge: c.freight_charge,
      codAvailable: c.cod === 1,
      rating: c.rating,
      isSurface: c.is_surface,
    })),
  };
}

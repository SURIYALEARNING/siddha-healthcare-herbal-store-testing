import { useState, useEffect, useCallback } from "react";
import { useToastContext } from "../../context/ToastContext";
import type { Order, ShippingStats } from "../../types";
import {
  fetchShippingOrdersApi,
  fetchShippingStatsApi,
  confirmOrderApi,
  markPackedApi,
  createShiprocketOrderApi,
  generateAwbApi,
  requestPickupApi,
} from "../../api/shipping";
import ShippingDashboard from "./ShippingDashboard";
import ShippingTable from "./ShippingTable";
import ShipmentDetailsModal from "./ShipmentDetailsModal";

export default function ShippingTab() {
  const { showSuccess, showError } = useToastContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<ShippingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [o, s] = await Promise.all([
        fetchShippingOrdersApi(),
        fetchShippingStatsApi(),
      ]);
      setOrders(o);
      setStats(s);
    } catch {
      showError("Failed to load", "Could not fetch shipping data.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirmOrder = async (orderId: string) => {
    await confirmOrderApi(orderId);
    showSuccess("Confirmed", "Order confirmed for shipping.");
  };

  const handleCreateShiprocketOrder = async (orderId: string, formData?: Record<string, any>): Promise<string | null> => {
    try {
      const res = await createShiprocketOrderApi(orderId, formData);
      showSuccess("Shiprocket", "Shiprocket order created.");
      await loadData();
      return res.shipmentId;
    } catch {
      showError("Shiprocket Error", "Failed to create Shiprocket order.");
      return null;
    }
  };

  const handleMarkPacked = async (orderId: string) => {
    await markPackedApi(orderId, { length: 10, breadth: 10, height: 10, weight: 0.5 });
    showSuccess("Packed", "Order marked as packed.");
    await loadData();
  };

  const handleGenerateAWB = async (orderId: string, shipmentId: string) => {
    const res = await generateAwbApi(orderId, shipmentId);
    showSuccess("AWB Generated", `AWB: ${res.awbCode} via ${res.courierName}`);
    await loadData();
  };

  const handleRequestPickup = async (orderId: string, shipmentIds: string[]) => {
    await requestPickupApi(orderId, shipmentIds);
    showSuccess("Pickup Requested", "Courier pickup has been scheduled.");
    await loadData();
  };

  return (
    <div className="space-y-6">
      <ShippingDashboard stats={stats} />
      <ShippingTable
        orders={orders}
        loading={loading}
        onConfirmOrder={handleConfirmOrder}
        onMarkPacked={handleMarkPacked}
        onCreateShiprocketOrder={handleCreateShiprocketOrder}
        onGenerateAWB={handleGenerateAWB}
        onRequestPickup={handleRequestPickup}
        onViewDetails={setSelectedOrder}
        onRefresh={loadData}
      />
      <ShipmentDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}

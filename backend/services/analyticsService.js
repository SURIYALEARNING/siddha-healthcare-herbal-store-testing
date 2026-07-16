export function buildAnalytics(orders, products, users, consultations) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = users.filter(u => !u.isAdmin).length;

  const productSalesMap = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const pid = item.productId ? item.productId.toString() : item.productId;
      if (!productSalesMap[pid]) {
        productSalesMap[pid] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productSalesMap[pid].quantity += item.quantity || 0;
      productSalesMap[pid].revenue += (item.quantity || 0) * (item.price || 0);
    });
  });

  const topProducts = Object.keys(productSalesMap).map(id => ({
    id,
    ...productSalesMap[id]
  })).sort((a, b) => b.quantity - a.quantity);

  const categorySales = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const prod = products.find(p => {
        const pid = p._id ? p._id.toString() : p.id;
        const itemPid = item.productId ? item.productId.toString() : item.productId;
        return pid === itemPid;
      });
      const cat = prod ? prod.category : "Herbal Care";
      categorySales[cat] = (categorySales[cat] || 0) + ((item.quantity || 0) * (item.price || 0));
    });
  });

  const categoryData = Object.keys(categorySales).map(cat => ({
    name: cat,
    value: categorySales[cat]
  }));

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyMap = {};
  orders.forEach(o => {
    const d = o.createdAt ? new Date(o.createdAt) : new Date();
    const key = monthNames[d.getMonth()];
    if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, count: 0 };
    monthlyMap[key].revenue += o.total || 0;
    monthlyMap[key].count += 1;
  });

  const monthlyRevenue = monthNames
    .filter(m => monthlyMap[m])
    .map(m => ({ name: m, revenue: monthlyMap[m].revenue, orders: monthlyMap[m].count }));

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    topProducts: topProducts.slice(0, 5),
    categoryData,
    monthlyRevenue,
    bookingCount: consultations.length,
  };
}

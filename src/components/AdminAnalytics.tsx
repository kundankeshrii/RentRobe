import { useMemo } from "react";
import { format, parseISO, startOfMonth } from "date-fns";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { IndianRupee, ShoppingBag, CheckCircle, TrendingUp } from "lucide-react";

interface Order {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  product_id: string | null;
  products?: { name: string; designer: string; images: string[] } | null;
}

interface AdminAnalyticsProps {
  orders: Order[];
}

const AdminAnalytics = ({ orders }: AdminAnalyticsProps) => {
  const totalRevenue = useMemo(
    () => orders.reduce((s, o) => s + Number(o.total_price), 0),
    [orders]
  );
  const activeRentals = useMemo(() => orders.filter((o) => o.status === "active").length, [orders]);
  const completedRentals = useMemo(() => orders.filter((o) => o.status === "completed").length, [orders]);

  // Revenue over time (monthly)
  const revenueData = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const month = format(startOfMonth(parseISO(o.created_at)), "MMM yyyy");
      map.set(month, (map.get(month) || 0) + Number(o.total_price));
    });
    return Array.from(map.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-12);
  }, [orders]);

  // Most rented products (top 8)
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    orders.forEach((o) => {
      if (!o.product_id || !o.products) return;
      const existing = map.get(o.product_id);
      if (existing) {
        existing.count++;
      } else {
        map.set(o.product_id, { name: o.products.name, count: 1 });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [orders]);

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee },
    { label: "Active Rentals", value: activeRentals, icon: TrendingUp },
    { label: "Completed", value: completedRentals, icon: CheckCircle },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-secondary p-5 border border-border">
              <div className="flex items-center justify-between mb-2">
                <Icon size={16} className="text-primary" />
              </div>
              <p className="font-display text-3xl font-light text-primary">{stat.value}</p>
              <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <div className="border border-border bg-secondary p-5">
          <h3 className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-4">
            Revenue Over Time
          </h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "4px",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground font-body font-light py-12 text-center">
              No revenue data yet
            </p>
          )}
        </div>

        {/* Most Rented Products */}
        <div className="border border-border bg-secondary p-5">
          <h3 className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-4">
            Most Rented Products
          </h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "4px",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [value, "Rentals"]}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground font-body font-light py-12 text-center">
              No rental data yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, Sparkles } from 'lucide-react';

const revenueData = [
  { day: 'Mon', revenue: 24000, orders: 45 },
  { day: 'Tue', revenue: 13980, orders: 32 },
  { day: 'Wed', revenue: 32000, orders: 58 },
  { day: 'Thu', revenue: 27800, orders: 49 },
  { day: 'Fri', revenue: 48900, orders: 72 },
  { day: 'Sat', revenue: 53900, orders: 89 },
  { day: 'Sun', revenue: 44900, orders: 78 },
];

const categoryData = [
  { name: 'Mains', value: 45, color: '#00f3ff' },
  { name: 'Starters', value: 25, color: '#bc13fe' },
  { name: 'Desserts', value: 15, color: '#ff6b6b' },
  { name: 'Drinks', value: 15, color: '#4ade80' },
];

const topItems = [
  { name: 'Murgh Makhani', orders: 124, revenue: 117800 },
  { name: 'Dal Bukhara', orders: 98, revenue: 73500 },
  { name: 'Galouti Kebab', orders: 87, revenue: 73950 },
  { name: 'Hyderabadi Biryani', orders: 156, revenue: 132600 },
  { name: 'Saffron Rasmalai', orders: 112, revenue: 39200 },
];

const aiInsights = [
  "📈 Sunday Brunch revenue is up 23% compared to last month. Consider adding more Chaat stations.",
  "🍷 Lassi pairing suggestions have increased average order value by ₹200. Keep promoting them!",
  "⏰ Peak hours are between 8-10 PM on weekends. Consider prep for Tandoor station.",
  "🥩 Galouti Kebab remains your top starter. Current saffron stock should last 5 more days.",
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Analytics War Room</h2>
        <p className="text-muted-foreground">Real-time insights powered by AI</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Weekly Revenue', value: '₹2,45,480', icon: DollarSign, change: '+12%', color: 'text-neon-cyan' },
          { label: 'Total Orders', value: '423', icon: ShoppingCart, change: '+8%', color: 'text-neon-purple' },
          { label: 'Avg Order Value', value: '₹850', icon: TrendingUp, change: '+5%', color: 'text-neon-green' },
          { label: 'Unique Guests', value: '312', icon: Users, change: '+15%', color: 'text-neon-orange' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-display font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <TrendingUp className="w-4 h-4 text-neon-green" />
              <span className="text-sm text-neon-green">{stat.change}</span>
              <span className="text-sm text-muted-foreground">vs last week</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">Weekly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--primary) / 0.3)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Orders by Category */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">Sales by Category</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--primary) / 0.3)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-foreground">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 glass-card p-5"
        >
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">Top Performing Items</h3>
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.orders} orders</p>
                  </div>
                </div>
                <span className="font-semibold text-neon-green">₹{item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-secondary" />
            <h3 className="text-lg font-display font-semibold text-foreground">AI Insights</h3>
          </div>
          <div className="space-y-3">
            {aiInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="p-3 rounded-lg bg-secondary/10 border border-secondary/20"
              >
                <p className="text-sm text-foreground">{insight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

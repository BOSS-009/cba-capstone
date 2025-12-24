import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Bell,
  Moon,
  Globe,
  CreditCard,
  Shield,
  Key,
  Palette,
  Volume2,
} from 'lucide-react';

const settingsSections = [
  {
    title: 'Notifications',
    icon: Bell,
    settings: [
      { id: 'order-alerts', label: 'Order Alerts', description: 'Get notified for new orders', enabled: true },
      { id: 'low-stock', label: 'Low Stock Alerts', description: 'Notify when inventory is low', enabled: true },
      { id: 'sound', label: 'Sound Effects', description: 'Play sounds for notifications', enabled: false },
    ],
  },
  {
    title: 'Appearance',
    icon: Palette,
    settings: [
      { id: 'dark-mode', label: 'Dark Mode', description: 'Use dark theme (always on)', enabled: true },
      { id: 'animations', label: 'Animations', description: 'Enable UI animations', enabled: true },
      { id: 'compact', label: 'Compact Mode', description: 'Reduce spacing for more content', enabled: false },
    ],
  },
  {
    title: 'Security',
    icon: Shield,
    settings: [
      { id: '2fa', label: 'Two-Factor Auth', description: 'Add extra security to your account', enabled: false },
      { id: 'session-timeout', label: 'Auto Logout', description: 'Logout after 30 min of inactivity', enabled: true },
    ],
  },
];

export default function Settings() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-display font-semibold text-foreground">Profile</h3>
        </div>

        <div className="flex items-start gap-6">
          <Avatar className="w-20 h-20 border-2 border-primary/30">
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold">
              {user?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                defaultValue={user?.name}
                className="bg-muted border-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email}
                className="bg-muted border-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                defaultValue={user?.role}
                disabled
                className="bg-muted border-muted capitalize"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Button variant="outline" className="w-full justify-start text-muted-foreground">
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button className="bg-primary text-primary-foreground">
            Save Changes
          </Button>
        </div>
      </motion.div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sectionIndex + 1) * 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <section.icon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display font-semibold text-foreground">{section.title}</h3>
          </div>

          <div className="space-y-4">
            {section.settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium text-foreground">{setting.label}</p>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <Switch defaultChecked={setting.enabled} />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Integrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-display font-semibold text-foreground">Integrations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#635bff]/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#635bff]" />
              </div>
              <div>
                <p className="font-medium text-foreground">Razorpay</p>
                <p className="text-xs text-muted-foreground">Payment processing</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-neon-green border-neon-green">
              Connected
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4285f4]/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#4285f4]" />
              </div>
              <div>
                <p className="font-medium text-foreground">Google Gemini</p>
                <p className="text-xs text-muted-foreground">AI voice orders</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-neon-green border-neon-green">
              Connected
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

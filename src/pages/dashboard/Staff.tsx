import { motion } from 'framer-motion';
import { useStaff } from '@/hooks/useStaff';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Mail, Shield, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { UserRole } from '@/types';
import { toast } from 'sonner';

const roleColors: Record<string, string> = {
  admin: 'bg-neon-purple/20 text-neon-purple border-neon-purple/50',
  manager: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50',
  waiter: 'bg-neon-green/20 text-neon-green border-neon-green/50',
  kitchen: 'bg-neon-orange/20 text-neon-orange border-neon-orange/50',
  cashier: 'bg-neon-pink/20 text-neon-pink border-neon-pink/50',
};

const roles: UserRole[] = ['admin', 'manager', 'waiter', 'kitchen', 'cashier'];

export default function Staff() {
  const { staff, isLoading, updateStaffRole, removeStaff } = useStaff();

  const handleInvite = () => {
    toast.info("Invite Feature: Share the login link with your staff. They can sign up, and you can assign their role here.");
  };

  if (isLoading) {
      return (
          <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Staff Management</h2>
          <p className="text-muted-foreground">Manage your team members and their roles</p>
        </div>
        <Button onClick={handleInvite} className="bg-gradient-to-r from-primary to-secondary text-primary-foreground btn-ripple">
          <Plus className="w-4 h-4 mr-2" />
          Invite Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {roles.map((role, index) => {
          const count = staff.filter((u) => u.role === role).length;
          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4 text-center"
            >
              <p className="text-2xl font-display font-bold text-foreground">{count}</p>
              <p className="text-sm text-muted-foreground capitalize">{role}s</p>
            </motion.div>
          );
        })}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-5 group hover:neon-glow-cyan transition-all duration-300 relative"
          >
            <div className="flex items-start gap-4">
              <Avatar className="w-14 h-14 border-2 border-primary/30">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                  {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{user.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border capitalize',
                      roleColors[user.role] || 'border-gray-500 text-gray-400'
                    )}
                  >
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover/95 backdrop-blur-md border-primary/20">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-popover/95 backdrop-blur-md border-primary/20">
                        <DropdownMenuRadioGroup value={user.role} onValueChange={(val) => updateStaffRole(user.id, val as UserRole)}>
                            {roles.map(r => (
                                <DropdownMenuRadioItem key={r} value={r} className="capitalize cursor-pointer">
                                    {r}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => removeStaff(user.id)} className="text-destructive focus:text-destructive cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Staff
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </motion.div>
        ))}
        
        {staff.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground glass-card">
                No staff members found.
            </div>
        )}
      </div>
    </div>
  );
}

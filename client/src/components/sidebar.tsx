import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  Folder, 
  Cog,
  LogOut,
  Network,
  BarChart3,
  Shield
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  // Mock user info for guest mode (no auth required)
  const user = {
    firstName: 'Guest',
    lastName: 'User',
    email: 'guest@system.local',
    profileImageUrl: null
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "All Processes", href: "/processes", icon: Folder },
    { name: "Mind Map", href: "/mindmap", icon: Network },
    { name: "Balanced Scorecard", href: "/scorecard", icon: BarChart3 },
    { name: "Risk Management", href: "/risk-management", icon: Shield },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === href;
    }
    return location.startsWith(href);
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border sidebar-shadow hidden lg:block">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Cog className="text-sidebar-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">OE Manager</h1>
            <p className="text-sm text-muted-foreground">Process Control</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive(item.href) 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* User Profile */}
      <div className="mt-auto p-6 border-t border-sidebar-border">
        <div className="flex items-center space-x-3 mb-4">
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full object-cover"
              data-testid="user-avatar"
            />
          ) : (
            <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center">
              <span className="text-sidebar-accent-foreground font-medium">
                {user?.firstName?.[0] || user?.email?.[0] || '?'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate" data-testid="user-name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || 'User'
              }
            </p>
            <p className="text-xs text-muted-foreground truncate">Process Manager</p>
          </div>
        </div>
        
        <Separator className="mb-4" />
        
      </div>
    </aside>
  );
}

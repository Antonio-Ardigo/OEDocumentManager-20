import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Menu, Search, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface HeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function Header({ 
  title,
  breadcrumbs
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden" 
            data-testid="button-toggle-sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {(title || breadcrumbs) && (
            <div>
              {title && <h1 className="text-2xl font-bold" data-testid="header-title">{title}</h1>}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className={index === breadcrumbs.length - 1 ? "text-foreground" : ""}>
                        {crumb.label}
                      </span>
                      {index < breadcrumbs.length - 1 && (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </div>
                  ))}
                </nav>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search processes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  setLocation(`/processes?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="w-64 pl-10"
              data-testid="input-search"
            />
          </div>
          
        </div>
      </div>
    </header>
  );
}

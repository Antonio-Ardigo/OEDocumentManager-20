import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cog, Users, TrendingUp, Shield, Target, BookOpen } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Cog className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            WSM OE Manager
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Comprehensive Operational Excellence Process Management System
          </p>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-3xl mx-auto">
            Streamline your OE processes with our enterprise-grade platform designed for
            creating, managing, and optimizing operational excellence workflows with
            full document control and version management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
            >
              Access OE Manager
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Badge variant="secondary" className="px-4 py-2">
              Enterprise Ready • Document Control • Version Management
            </Badge>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful OE Management Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to implement and maintain operational excellence processes
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Process Templates</CardTitle>
              <CardDescription>
                Pre-built templates for all OE elements including Leadership & Accountability,
                Asset Management, and Risk Management
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Collaboration</CardTitle>
              <CardDescription>
                Multi-user editing with role-based access control and
                real-time collaboration features
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Document Control</CardTitle>
              <CardDescription>
                Complete version control, approval workflows, and
                audit trails for compliance requirements
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Analytics & KPIs</CardTitle>
              <CardDescription>
                Built-in performance measurement and analytics
                with customizable KPI tracking
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Process Management</CardTitle>
              <CardDescription>
                Comprehensive process lifecycle management from
                creation to implementation and optimization
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Cog className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>WSM Compliance</CardTitle>
              <CardDescription>
                Designed specifically for WSM OE requirements
                with full compliance to company standards
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your OE Processes?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join the digital transformation of operational excellence management
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-get-started"
          >
            Get Started Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 WSM OE Manager. Enterprise Operational Excellence Management Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}

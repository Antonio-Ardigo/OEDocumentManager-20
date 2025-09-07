import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import AllProcesses from "@/pages/all-processes";
import MindMap from "@/pages/mind-map";
import BalancedScorecard from "@/pages/balanced-scorecard";
import RiskManagement from "@/pages/risk-management";
import ElementDetail from "@/pages/element-detail";
import ProcessDetail from "@/pages/process-detail";
import ProcessEditor from "@/pages/process-editor";
import ElementEditor from "@/pages/element-editor";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Landing page only for loading state - guests can access all other pages */}
      {isLoading ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          {/* Dashboard accessible to both authenticated and guest users */}
          <Route path="/" component={Dashboard} />
          <Route path="/landing" component={Landing} />
          <Route path="/processes" component={AllProcesses} />
          <Route path="/mindmap" component={MindMap} />
          <Route path="/scorecard" component={BalancedScorecard} />
          <Route path="/risk-management" component={RiskManagement} />
          <Route path="/element/:id" component={ElementDetail} />
          <Route path="/process/:id" component={ProcessDetail} />
          <Route path="/process/:id/edit" component={ProcessEditor} />
          <Route path="/create-process" component={ProcessEditor} />
          <Route path="/create-element" component={ElementEditor} />
          <Route path="/element/:id/edit" component={ElementEditor} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

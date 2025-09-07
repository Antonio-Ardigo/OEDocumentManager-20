import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, TrendingUp, Eye } from "lucide-react";
import { Link } from "wouter";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

interface ProcessRisk {
  id: string;
  name: string;
  processNumber: string;
  elementTitle: string;
  elementNumber: number;
  riskFrequency?: string;
  riskImpact?: string;
  riskMitigation?: string;
  status: string;
}

// Risk level calculation and styling
const getRiskLevel = (frequency?: string, impact?: string) => {
  if (!frequency || !impact) return { level: "Not Assessed", color: "gray", score: 0 };
  
  const freqScore = frequency.toLowerCase() === "high" ? 3 : frequency.toLowerCase() === "medium" ? 2 : 1;
  const impactScore = impact.toLowerCase() === "high" ? 3 : impact.toLowerCase() === "medium" ? 2 : 1;
  const totalScore = freqScore * impactScore;
  
  if (totalScore >= 7) return { level: "High Risk", color: "red", score: totalScore };
  if (totalScore >= 3) return { level: "Medium Risk", color: "yellow", score: totalScore };
  return { level: "Low Risk", color: "green", score: totalScore };
};

const getRiskBadgeClass = (color: string) => {
  switch (color) {
    case "red":
      return "bg-red-100 text-red-800 border-red-200";
    case "yellow":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "green":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function RiskManagement() {

  const { data: processes = [], isLoading: processesLoading } = useQuery<ProcessRisk[]>({
    queryKey: ["/api/oe-processes"],
    enabled: true,
  });

  if (processesLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Filter processes and categorize by risk level
  const assessedProcesses = processes.filter(p => p.riskFrequency && p.riskImpact);
  const unassessedProcesses = processes.filter(p => !p.riskFrequency || !p.riskImpact);
  
  const highRiskProcesses = assessedProcesses.filter(p => 
    getRiskLevel(p.riskFrequency, p.riskImpact).level === "High Risk"
  );
  const mediumRiskProcesses = assessedProcesses.filter(p => 
    getRiskLevel(p.riskFrequency, p.riskImpact).level === "Medium Risk"
  );
  const lowRiskProcesses = assessedProcesses.filter(p => 
    getRiskLevel(p.riskFrequency, p.riskImpact).level === "Low Risk"
  );

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header />
        
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <Shield className="w-8 h-8 mr-3 text-blue-600" />
                  Risk Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Assess and manage process risks across your OE framework
                </p>
              </div>
            </div>

            {/* Risk Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">High Risk</p>
                      <p className="text-2xl font-bold text-red-700">{highRiskProcesses.length}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">Medium Risk</p>
                      <p className="text-2xl font-bold text-yellow-700">{mediumRiskProcesses.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Low Risk</p>
                      <p className="text-2xl font-bold text-green-700">{lowRiskProcesses.length}</p>
                    </div>
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-gray-50 dark:bg-gray-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Not Assessed</p>
                      <p className="text-2xl font-bold text-gray-700">{unassessedProcesses.length}</p>
                    </div>
                    <Eye className="w-8 h-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* High Risk Processes */}
            {highRiskProcesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    High Risk Processes - Immediate Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {highRiskProcesses.map((process) => (
                      <ProcessRiskCard key={process.id} process={process} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medium Risk Processes */}
            {mediumRiskProcesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-700 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Medium Risk Processes - Monitor and Mitigate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mediumRiskProcesses.map((process) => (
                      <ProcessRiskCard key={process.id} process={process} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Low Risk Processes */}
            {lowRiskProcesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Low Risk Processes - Well Controlled
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lowRiskProcesses.map((process) => (
                      <ProcessRiskCard key={process.id} process={process} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Unassessed Processes */}
            {unassessedProcesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-700 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Processes Requiring Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {unassessedProcesses.map((process) => (
                      <ProcessRiskCard key={process.id} process={process} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Individual process risk card component
function ProcessRiskCard({ process }: { process: ProcessRisk }) {
  const riskLevel = getRiskLevel(process.riskFrequency, process.riskImpact);
  
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {process.processNumber} - {process.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Element {process.elementNumber}: {process.elementTitle}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={getRiskBadgeClass(riskLevel.color)}>
            {riskLevel.level}
          </Badge>
          <Link href={`/process/${process.id}/edit`}>
            <Button variant="outline" size="sm" data-testid={`edit-risk-${process.id}`}>
              Edit Risk
            </Button>
          </Link>
          <Link href={`/process/${process.id}`}>
            <Button variant="ghost" size="sm" data-testid={`view-process-${process.id}`}>
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {process.riskFrequency && process.riskImpact && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Frequency:</span>
            <Badge variant="outline" className="ml-2">
              {process.riskFrequency}
            </Badge>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Impact:</span>
            <Badge variant="outline" className="ml-2">
              {process.riskImpact}
            </Badge>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Risk Score:</span>
            <Badge variant="outline" className={`ml-2 ${getRiskBadgeClass(riskLevel.color)}`}>
              {riskLevel.score}
            </Badge>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <Badge variant="outline" className="ml-2">
              {process.status}
            </Badge>
          </div>
        </div>
      )}

      {process.riskMitigation && (
        <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md">
          <p className="text-sm">
            <span className="font-medium text-orange-700 dark:text-orange-300">Risk Description:</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">{process.riskMitigation}</span>
          </p>
        </div>
      )}

      {process.riskMitigation && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
          <p className="text-sm">
            <span className="font-medium text-blue-700 dark:text-blue-300">Mitigation Strategy:</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">{process.riskMitigation}</span>
          </p>
        </div>
      )}

      {(!process.riskFrequency || !process.riskImpact) && (
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⚠️ Risk assessment not completed. Click "Edit Risk" to add frequency, impact, and mitigation details.
          </p>
        </div>
      )}
    </div>
  );
}
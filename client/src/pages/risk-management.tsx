import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, TrendingUp, Eye, Download, FileSpreadsheet } from "lucide-react";
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
  const { toast } = useToast();

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

  // Comprehensive PDF Export functionality
  const handleExportPDF = async () => {
    if (!processes || processes.length === 0) {
      toast({
        title: "No Data Available",
        description: "No risk data available to export",
        variant: "destructive",
      });
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      let yPos = 20;

      // Helper function to add justified text
      const addJustifiedText = (text: string, x: number, fontSize: number = 9, maxWidth: number = 165, indent: number = 0) => {
        doc.setFontSize(fontSize);
        const availableWidth = maxWidth - indent;
        const lines = doc.splitTextToSize(text, availableWidth);
        
        lines.forEach((line: string) => {
          doc.text(line, x + indent, yPos);
          yPos += fontSize * 0.6 + 1;
        });
        
        return yPos;
      };
      
      // Helper function for chapter headings
      const addChapterHeading = (title: string, level: number = 1) => {
        checkNewPage(15);
        yPos += level === 1 ? 8 : 5;
        
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(level === 1 ? 12 : 10);
        doc.text(title.toUpperCase(), 20, yPos);
        
        if (level === 1) {
          doc.setLineWidth(0.3);
          doc.line(20, yPos + 1, 20 + doc.getTextWidth(title.toUpperCase()), yPos + 1);
        }
        
        yPos += level === 1 ? 6 : 4;
      };
      
      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace: number = 20) => {
        if (yPos + requiredSpace > 275) {
          doc.addPage();
          yPos = 20;
        }
      };

      // Document Title Page
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('WSM OPERATIONAL EXCELLENCE', 105, 50, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('RISK MANAGEMENT REPORT', 105, 65, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Comprehensive Risk Assessment Analysis', 105, 80, { align: 'center' });
      
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 110, { align: 'center' });
      doc.text('WSM Operational Excellence Framework', 105, 120, { align: 'center' });
      
      doc.setLineWidth(0.5);
      doc.line(50, 130, 160, 130);
      
      doc.addPage();
      yPos = 20;

      // Chapter 1: Risk Assessment Overview
      addChapterHeading('1. RISK ASSESSMENT OVERVIEW', 1);
      
      doc.setFont('helvetica', 'normal');
      addJustifiedText(`This risk management report provides a comprehensive analysis of process risks across the WSM Operational Excellence framework. The assessment covers ${processes.length} total processes with detailed risk evaluation and mitigation strategies.`, 20, 9);
      yPos += 3;

      doc.setFont('helvetica', 'bold');
      addJustifiedText('Risk Assessment Summary:', 20, 9);
      doc.setFont('helvetica', 'normal');
      addJustifiedText(`• High Risk Processes: ${highRiskProcesses.length} (requiring immediate attention)`, 25, 8, 165, 5);
      addJustifiedText(`• Medium Risk Processes: ${mediumRiskProcesses.length} (requiring monitoring)`, 25, 8, 165, 5);
      addJustifiedText(`• Low Risk Processes: ${lowRiskProcesses.length} (well controlled)`, 25, 8, 165, 5);
      addJustifiedText(`• Unassessed Processes: ${unassessedProcesses.length} (requiring assessment)`, 25, 8, 165, 5);
      yPos += 3;

      const assessmentRate = Math.round((assessedProcesses.length / processes.length) * 100);
      doc.setFont('helvetica', 'bold');
      addJustifiedText('Assessment Coverage:', 20, 9);
      doc.setFont('helvetica', 'normal');
      addJustifiedText(`Risk assessment completion rate: ${assessmentRate}% (${assessedProcesses.length} of ${processes.length} processes)`, 25, 8, 165, 5);
      yPos += 5;

      // Chapter 2: High Risk Processes
      if (highRiskProcesses.length > 0) {
        addChapterHeading('2. HIGH RISK PROCESSES - IMMEDIATE ACTION REQUIRED', 1);
        
        doc.setFont('helvetica', 'normal');
        addJustifiedText(`${highRiskProcesses.length} processes have been identified as high risk, requiring immediate attention and priority mitigation efforts.`, 20, 9);
        yPos += 3;

        highRiskProcesses.forEach((process, index) => {
          checkNewPage(30);
          const riskLevel = getRiskLevel(process.riskFrequency, process.riskImpact);
          
          doc.setFont('helvetica', 'bold');
          addJustifiedText(`2.${index + 1} ${process.processNumber}: ${process.name}`, 25, 9, 165, 5);
          
          doc.setFont('helvetica', 'normal');
          addJustifiedText(`Element: ${process.elementNumber} - ${process.elementTitle}`, 30, 8, 165, 10);
          addJustifiedText(`Risk Level: ${riskLevel.level} (Score: ${riskLevel.score})`, 30, 8, 165, 10);
          addJustifiedText(`Frequency: ${process.riskFrequency} | Impact: ${process.riskImpact}`, 30, 8, 165, 10);
          addJustifiedText(`Status: ${process.status}`, 30, 8, 165, 10);
          
          if (process.riskMitigation) {
            doc.setFont('helvetica', 'bold');
            addJustifiedText('Mitigation Strategy:', 30, 8, 165, 10);
            doc.setFont('helvetica', 'normal');
            addJustifiedText(process.riskMitigation, 35, 8, 165, 15);
          }
          
          yPos += 4;
        });
      }

      // Chapter 3: Medium Risk Processes
      if (mediumRiskProcesses.length > 0) {
        addChapterHeading('3. MEDIUM RISK PROCESSES - MONITOR AND MITIGATE', 1);
        
        doc.setFont('helvetica', 'normal');
        addJustifiedText(`${mediumRiskProcesses.length} processes have been classified as medium risk, requiring ongoing monitoring and mitigation planning.`, 20, 9);
        yPos += 3;

        mediumRiskProcesses.forEach((process, index) => {
          checkNewPage(25);
          const riskLevel = getRiskLevel(process.riskFrequency, process.riskImpact);
          
          doc.setFont('helvetica', 'bold');
          addJustifiedText(`3.${index + 1} ${process.processNumber}: ${process.name}`, 25, 8, 165, 5);
          
          doc.setFont('helvetica', 'normal');
          addJustifiedText(`Element: ${process.elementNumber} - ${process.elementTitle}`, 30, 8, 165, 10);
          addJustifiedText(`Risk Level: ${riskLevel.level} (Score: ${riskLevel.score})`, 30, 8, 165, 10);
          addJustifiedText(`Frequency: ${process.riskFrequency} | Impact: ${process.riskImpact}`, 30, 8, 165, 10);
          
          if (process.riskMitigation) {
            doc.setFont('helvetica', 'bold');
            addJustifiedText('Mitigation:', 30, 8, 165, 10);
            doc.setFont('helvetica', 'normal');
            addJustifiedText(process.riskMitigation, 35, 8, 165, 15);
          }
          
          yPos += 3;
        });
      }

      // Chapter 4: Low Risk Processes
      if (lowRiskProcesses.length > 0) {
        addChapterHeading('4. LOW RISK PROCESSES - WELL CONTROLLED', 1);
        
        doc.setFont('helvetica', 'normal');
        addJustifiedText(`${lowRiskProcesses.length} processes are classified as low risk, indicating effective risk controls and management.`, 20, 9);
        yPos += 3;

        // Summary table for low risk processes
        doc.setFont('helvetica', 'bold');
        addJustifiedText('Low Risk Process Summary:', 25, 8, 165, 5);
        doc.setFont('helvetica', 'normal');
        lowRiskProcesses.forEach((process) => {
          checkNewPage(10);
          addJustifiedText(`• ${process.processNumber}: ${process.name} (Element ${process.elementNumber})`, 30, 8, 165, 10);
        });
        yPos += 3;
      }

      // Chapter 5: Unassessed Processes
      if (unassessedProcesses.length > 0) {
        addChapterHeading('5. PROCESSES REQUIRING RISK ASSESSMENT', 1);
        
        doc.setFont('helvetica', 'normal');
        addJustifiedText(`${unassessedProcesses.length} processes require risk assessment to complete the comprehensive risk analysis.`, 20, 9);
        yPos += 3;

        doc.setFont('helvetica', 'bold');
        addJustifiedText('Action Required:', 25, 8, 165, 5);
        doc.setFont('helvetica', 'normal');
        unassessedProcesses.forEach((process) => {
          checkNewPage(10);
          addJustifiedText(`• ${process.processNumber}: ${process.name} (Element ${process.elementNumber})`, 30, 8, 165, 10);
        });
        yPos += 3;
      }

      // Chapter 6: Risk Management Recommendations
      addChapterHeading('6. RISK MANAGEMENT RECOMMENDATIONS', 1);
      
      doc.setFont('helvetica', 'normal');
      addJustifiedText('Based on the comprehensive risk assessment, the following actions are recommended:', 20, 9);
      yPos += 2;

      const recommendations = [];
      if (highRiskProcesses.length > 0) {
        recommendations.push(`Immediate action required for ${highRiskProcesses.length} high-risk processes`);
      }
      if (unassessedProcesses.length > 0) {
        recommendations.push(`Complete risk assessment for ${unassessedProcesses.length} remaining processes`);
      }
      if (assessmentRate < 100) {
        recommendations.push(`Improve risk assessment coverage from ${assessmentRate}% to 100%`);
      }
      recommendations.push('Establish regular risk review cycles for all assessed processes');
      recommendations.push('Implement risk monitoring dashboards and alerts');
      recommendations.push('Develop standardized risk mitigation procedures');

      recommendations.forEach((rec, index) => {
        addJustifiedText(`${index + 1}. ${rec}`, 25, 8, 165, 5);
      });

      // Footer for all pages
      const pageCount = (doc as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        doc.setLineWidth(0.3);
        doc.setDrawColor(0, 0, 0);
        doc.line(20, 285, 190, 285);
        
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('WSM Risk Management Report', 20, 292);
        doc.text(`Page ${i} of ${pageCount}`, 190, 292, { align: 'right' });
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 292, { align: 'center' });
      }

      doc.save(`WSM-Risk-Management-Report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export Successful",
        description: "Risk management report has been exported as PDF",
      });
      
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF report",
        variant: "destructive",
      });
    }
  };

  // Excel Risk Register Export functionality
  const handleExportExcel = () => {
    if (!processes || processes.length === 0) {
      toast({
        title: "No Data Available",
        description: "No risk data available to export",
        variant: "destructive",
      });
      return;
    }

    try {
      // Helper function to sanitize CSV values and prevent CSV injection
      const sanitizeCsvValue = (value: string): string => {
        if (!value) return '';
        
        // Convert to string and normalize line breaks
        let sanitized = String(value).replace(/\r?\n/g, ' ').trim();
        
        // Escape internal quotes by doubling them
        sanitized = sanitized.replace(/"/g, '""');
        
        // Prevent CSV formula injection by prefixing with single quote if starts with dangerous characters
        if (/^[=+\-@]/.test(sanitized)) {
          sanitized = "'" + sanitized;
        }
        
        return `"${sanitized}"`;
      };

      // Create Excel-compatible CSV with proper formatting and security
      const headers = [
        'Risk ID',
        'Process Number',
        'Process Name',
        'Element',
        'Risk Level',
        'Frequency',
        'Impact',
        'Risk Score',
        'Status',
        'Risk Description',
        'Mitigation Strategy'
      ];
      
      const csvContent = [
        headers.map(h => sanitizeCsvValue(h)).join(','),
        ...processes.map((process) => {
          const riskLevel = getRiskLevel(process.riskFrequency, process.riskImpact);
          return [
            sanitizeCsvValue(process.id), // Use actual process ID instead of synthetic
            sanitizeCsvValue(process.processNumber),
            sanitizeCsvValue(process.name),
            sanitizeCsvValue(`Element ${process.elementNumber}: ${process.elementTitle}`),
            sanitizeCsvValue(riskLevel.level),
            sanitizeCsvValue(process.riskFrequency || 'Not Assessed'),
            sanitizeCsvValue(process.riskImpact || 'Not Assessed'),
            sanitizeCsvValue(riskLevel.score ? String(riskLevel.score) : 'N/A'),
            sanitizeCsvValue(process.status),
            sanitizeCsvValue(''), // Risk Description - separate field not available in current schema
            sanitizeCsvValue(process.riskMitigation || 'Not specified')
          ].join(',');
        })
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `WSM-Risk-Register-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Export Successful",
        description: `Risk register exported with ${processes.length} processes`,
      });
      
    } catch (error) {
      console.error('Excel export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the Excel file",
        variant: "destructive",
      });
    }
  };

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
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportPDF}
                  disabled={processesLoading || !processes || processes.length === 0}
                  data-testid="button-export-risk-pdf"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportExcel}
                  disabled={processesLoading || !processes || processes.length === 0}
                  data-testid="button-export-risk-excel"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Risk Register
                </Button>
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
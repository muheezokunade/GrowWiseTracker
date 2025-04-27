import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { ReportCard } from "@/components/reports/ReportCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Calendar, FileBarChart, FilePieChart } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Report types
const REPORT_TYPES = {
  PL: "Profit & Loss",
  CASH_FLOW: "Cash Flow",
  GROWTH: "Growth Analysis",
};

// Map report types to icons
const reportIcons = {
  [REPORT_TYPES.PL]: FileBarChart,
  [REPORT_TYPES.CASH_FLOW]: FilePieChart,
  [REPORT_TYPES.GROWTH]: Calendar,
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [selectedQuarter, setSelectedQuarter] = useState(
    `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  // Define report type interface
  interface Report {
    id: number;
    name: string;
    type: string;
    period: string;
    createdAt: string | Date;
    url?: string;
  }

  // Fetch recent reports
  const { 
    data: recentReports = [] as Report[], 
    isLoading: isLoadingReports 
  } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  // Fetch transactions for reference (might be needed for report generation)
  const { isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const isLoading = isLoadingReports || isLoadingTransactions;

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async ({ reportType, period }: { reportType: string, period: string }) => {
      const res = await apiRequest('POST', '/api/reports', { reportType, period });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report Generated",
        description: `Your ${data.type} report for ${data.period} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Generate Report",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Generate reports
  const generateReport = (reportType: string) => {
    let period;
    switch (activeTab) {
      case "monthly":
        // Format: "2023-04" -> "April 2023"
        const [year, month] = selectedMonth.split('-');
        const monthName = new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'long' });
        period = `${monthName} ${year}`;
        break;
      case "quarterly":
        period = selectedQuarter;
        break;
      case "yearly":
        period = selectedYear;
        break;
      default:
        period = selectedMonth;
    }

    generateReportMutation.mutate({ reportType, period });
  };

  // Get years for dropdown (last 3 years)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  };

  // Get quarters for dropdown
  const getQuarterOptions = () => {
    const currentYear = new Date().getFullYear();
    return [
      `${currentYear}-Q1`,
      `${currentYear}-Q2`,
      `${currentYear}-Q3`,
      `${currentYear}-Q4`,
      `${currentYear - 1}-Q4`,
    ];
  };

  // Add icons to reports data
  const reportsWithIcons = recentReports.map((report: Report) => ({
    ...report,
    icon: reportIcons[report.type as keyof typeof reportIcons] || FileBarChart
  }));

  return (
    <MainLayout title="Financial Reports">
      <div className="max-w-4xl mx-auto">
        <p className="text-gray-600 mb-6">
          Generate and download financial reports for your business.
        </p>

        {/* Report Generator */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">Generate New Report</h2>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Month
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-[#27AE60]"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    className="bg-[#27AE60] hover:bg-[#219653] w-full sm:w-auto"
                    onClick={() => generateReport(REPORT_TYPES.PL)}
                    disabled={isLoading}
                  >
                    Generate P&L Report
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quarterly" className="pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Quarter
                  </label>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-[#27AE60] bg-white"
                  >
                    {getQuarterOptions().map((quarter) => (
                      <option key={quarter} value={quarter}>
                        {quarter}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    className="bg-[#27AE60] hover:bg-[#219653] w-full sm:w-auto"
                    onClick={() => generateReport(REPORT_TYPES.CASH_FLOW)}
                    disabled={isLoading}
                  >
                    Generate Cash Flow Report
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="yearly" className="pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-[#27AE60] bg-white"
                  >
                    {getYearOptions().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    className="bg-[#27AE60] hover:bg-[#219653] w-full sm:w-auto"
                    onClick={() => generateReport(REPORT_TYPES.GROWTH)}
                    disabled={isLoading}
                  >
                    Generate Growth Analysis
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Reports */}
        <h2 className="text-xl font-medium mb-4">Recent Reports</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#27AE60]" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {recentReports.map((report: Report) => (
              <ReportCard key={report.id} report={report} />
            ))}

            {/* If no reports, show empty state */}
            {recentReports.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center md:col-span-2">
                <div className="mx-auto w-16 h-16 bg-[#27AE60]/10 rounded-full flex items-center justify-center mb-4">
                  <FileBarChart className="h-8 w-8 text-[#27AE60]" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
                <p className="text-gray-500 mb-6">
                  Generate your first report to see it here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Learning Section */}
        <div className="mt-8 bg-[#27AE60]/5 border border-[#27AE60]/20 p-5 rounded-lg">
          <h3 className="font-medium text-lg mb-3">Understanding Your Reports</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="h-5 w-5 bg-[#27AE60]/20 rounded-full flex items-center justify-center text-[#27AE60] mr-2 flex-shrink-0">•</span>
              <span>
                <strong>Profit & Loss (P&L):</strong> Shows your income, expenses, and resulting profit or loss for a specific period.
              </span>
            </li>
            <li className="flex items-start">
              <span className="h-5 w-5 bg-[#27AE60]/20 rounded-full flex items-center justify-center text-[#27AE60] mr-2 flex-shrink-0">•</span>
              <span>
                <strong>Cash Flow:</strong> Tracks how money moves in and out of your business, helping you understand your liquidity.
              </span>
            </li>
            <li className="flex items-start">
              <span className="h-5 w-5 bg-[#27AE60]/20 rounded-full flex items-center justify-center text-[#27AE60] mr-2 flex-shrink-0">•</span>
              <span>
                <strong>Growth Analysis:</strong> Compares your performance over time to identify trends and growth opportunities.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}

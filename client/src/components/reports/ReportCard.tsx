import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, Calendar, FileBarChart, FilePieChart, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ReportCardProps {
  report: {
    id: number;
    name: string;
    type: string;
    period: string;
    createdAt: Date | string;
    icon?: any;
    url?: string;
  };
}

export function ReportCard({ report }: ReportCardProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  // Report download function using direct fetch to handle file download
  const handleDownloadReport = async (reportId: number) => {
    setIsDownloading(true);
    try {
      // Create a URL for the API endpoint
      const apiUrl = `/api/reports/${reportId}/download`;
      
      // Notify user that download is starting
      toast({
        title: "Preparing Download",
        description: `${report.name} is being prepared for download.`,
      });
      
      // Trigger the download by opening the URL in a new window
      // This approach handles file downloads better than using fetch/apiRequest
      window.open(apiUrl, '_blank');
      
      toast({
        title: "Download Started",
        description: `${report.name} download has started.`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Email report mutation
  const emailMutation = useMutation({
    mutationFn: async (reportId: number) => {
      setIsEmailing(true);
      try {
        const res = await apiRequest('POST', `/api/reports/${reportId}/email`);
        const data = await res.json();
        
        if (data.success) {
          toast({
            title: "Email Sent",
            description: `${report.name} has been sent to your email.`,
          });
        }
      } finally {
        setIsEmailing(false);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Email Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsEmailing(false);
    }
  });

  const handleDownload = () => {
    handleDownloadReport(report.id);
  };

  const handleEmail = () => {
    emailMutation.mutate(report.id);
  };

  // Determine icon component
  const IconComponent = report.icon || FileBarChart;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start">
            <div className="h-10 w-10 rounded-full bg-[#27AE60]/10 flex items-center justify-center mr-3 flex-shrink-0">
              <IconComponent className="h-5 w-5 text-[#27AE60]" />
            </div>
            <div>
              <h3 className="font-medium">{report.name}</h3>
              <p className="text-sm text-gray-500">Period: {report.period}</p>
              <p className="text-xs text-gray-400 mt-1">
                Generated on {formatDate(report.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end bg-gray-50 px-6 py-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="mr-2"
          onClick={handleEmail}
          disabled={isEmailing}
        >
          {isEmailing ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : null}
          Email
        </Button>
        <Button
          size="sm"
          className="bg-[#27AE60] hover:bg-[#219653]"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <ArrowDown className="h-4 w-4 mr-1" />
          )}
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}

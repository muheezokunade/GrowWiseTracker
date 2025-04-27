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

  // Download report mutation
  const downloadMutation = useMutation({
    mutationFn: async (reportId: number) => {
      setIsDownloading(true);
      try {
        const res = await apiRequest('GET', `/api/reports/${reportId}/download`);
        const data = await res.json();
        
        // In a real app, this would trigger a file download
        // For now, we'll just show a success message
        if (data.success) {
          toast({
            title: "Download Started",
            description: `${report.name} is being downloaded.`,
          });
        }
      } finally {
        setIsDownloading(false);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsDownloading(false);
    }
  });

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
    downloadMutation.mutate(report.id);
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

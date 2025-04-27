import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, Calendar, FileBarChart, FilePieChart } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ReportCardProps {
  report: {
    id: number;
    name: string;
    type: string;
    period: string;
    createdAt: Date;
    icon: any;
  };
}

export function ReportCard({ report }: ReportCardProps) {
  const handleDownload = () => {
    // In a real app, this would download the report
    alert(`Downloading ${report.name}`);
  };

  const handleEmail = () => {
    // In a real app, this would email the report
    alert(`Emailing ${report.name}`);
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
        >
          Email
        </Button>
        <Button
          size="sm"
          className="bg-[#27AE60] hover:bg-[#219653]"
          onClick={handleDownload}
        >
          <ArrowDown className="h-4 w-4 mr-1" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}

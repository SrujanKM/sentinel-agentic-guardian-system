
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { FilePdf, FileSpreadsheet, Download } from "lucide-react";
import reportGenerator, { ReportOptions, defaultReportOptions } from "@/services/reportGenerator";
import { fetchLogs, fetchThreats } from "@/services/api";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportDialog = ({ open, onOpenChange }: ReportDialogProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<ReportOptions>({...defaultReportOptions});

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      toast({
        title: "Fetching data...",
        description: "Please wait while we gather data for your report."
      });
      
      // Fetch the required data
      const [threats, logs] = await Promise.all([
        fetchThreats(),
        fetchLogs({ limit: 500 })
      ]);
      
      await reportGenerator.generateReport(threats, logs, options);
      
      toast({
        title: "Report Generated",
        description: `Your ${options.type.toUpperCase()} report has been generated successfully.`
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Generate Security Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Tabs defaultValue="type" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="type">Report Type</TabsTrigger>
              <TabsTrigger value="content">Content & Filters</TabsTrigger>
            </TabsList>
            
            <TabsContent value="type" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Report Format</Label>
                <RadioGroup 
                  defaultValue={options.type}
                  onValueChange={(value) => setOptions({...options, type: value as "pdf" | "csv"})}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-3 hover:bg-gray-800">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                      <FilePdf className="mr-2 h-5 w-5 text-red-500" />
                      PDF Document
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-3 hover:bg-gray-800">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="flex items-center cursor-pointer">
                      <FileSpreadsheet className="mr-2 h-5 w-5 text-green-500" />
                      CSV Spreadsheet
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Report Content</Label>
                <RadioGroup 
                  defaultValue={options.content}
                  onValueChange={(value) => setOptions({...options, content: value as "threats" | "logs" | "all"})}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-3 hover:bg-gray-800">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">All data (threats and logs)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-3 hover:bg-gray-800">
                    <RadioGroupItem value="threats" id="threats" />
                    <Label htmlFor="threats" className="cursor-pointer">Threats only</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-3 hover:bg-gray-800">
                    <RadioGroupItem value="logs" id="logs" />
                    <Label htmlFor="logs" className="cursor-pointer">Logs only</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Time Range</Label>
                <RadioGroup 
                  defaultValue={options.timeRange}
                  onValueChange={(value) => setOptions({...options, timeRange: value as "24h" | "7d" | "30d" | "all"})}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-2 hover:bg-gray-800">
                    <RadioGroupItem value="24h" id="24h" />
                    <Label htmlFor="24h" className="cursor-pointer">Last 24 hours</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-2 hover:bg-gray-800">
                    <RadioGroupItem value="7d" id="7d" />
                    <Label htmlFor="7d" className="cursor-pointer">Last 7 days</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-2 hover:bg-gray-800">
                    <RadioGroupItem value="30d" id="30d" />
                    <Label htmlFor="30d" className="cursor-pointer">Last 30 days</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-2 hover:bg-gray-800">
                    <RadioGroupItem value="all" id="all-time" />
                    <Label htmlFor="all-time" className="cursor-pointer">All time</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="includeResolved" 
                  checked={options.includeResolvedThreats}
                  onCheckedChange={(checked) => 
                    setOptions({...options, includeResolvedThreats: checked as boolean})
                  }
                />
                <Label htmlFor="includeResolved" className="cursor-pointer">Include resolved threats</Label>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)} 
            variant="outline" 
            className="mr-2"
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate {options.type.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;

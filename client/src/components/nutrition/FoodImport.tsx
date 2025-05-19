import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, FileUp, Link, CheckCircle, XCircle } from 'lucide-react';

interface ImportSummary {
  valid: number;
  inserted: number;
  skipped: number;
  errors: number;
  duration: number;
}

interface JobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  summary?: ImportSummary;
  errorMessage?: string;
}

export function FoodImport() {
  const [fileUrl, setFileUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('url');
  const [jobId, setJobId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for job status once we have a jobId
  const { data: jobStatus, error, isLoading } = useQuery<JobStatus>({
    queryKey: jobId ? ['/api/nutrition/foods/import/status', jobId] : [],
    queryFn: async () => {
      if (!jobId) throw new Error('No job ID');
      const res = await fetch(`/api/nutrition/foods/import/status/${jobId}`);
      if (!res.ok) throw new Error('Failed to fetch job status');
      return res.json();
    },
    enabled: !!jobId,
    refetchInterval: (data) => 
      data && (data.status === 'completed' || data.status === 'failed') 
        ? false 
        : 1000
  });

  // Handle URL import
  const handleUrlImport = async () => {
    if (!fileUrl.trim()) {
      toast({
        title: 'URL required',
        description: 'Please enter a valid Excel file URL',
        variant: 'destructive'
      });
      return;
    }

    try {
      const res = await fetch('/api/nutrition/foods/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to start import');
      }

      const data = await res.json();
      setJobId(data.jobId);
    } catch (err) {
      toast({
        title: 'Import failed',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: 'File required',
        description: 'Please select an Excel file to upload',
        variant: 'destructive'
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/nutrition/foods/import/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to upload file');
      }

      const data = await res.json();
      setJobId(data.jobId);
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  };

  // Reset the form
  const handleReset = () => {
    setJobId(null);
    setFileUrl('');
    setFile(null);
  };

  // Refresh food data when import completes
  useEffect(() => {
    if (jobStatus?.status === 'completed') {
      // Invalidate food-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition/foods'] });
    }
  }, [jobStatus?.status, queryClient]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Import Foods</CardTitle>
        <CardDescription>
          Add foods to your library from an Excel file. The file should have columns for name, category, 
          calories, protein, carbs, fat, and other nutritional information.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!jobId ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">Import from URL</TabsTrigger>
              <TabsTrigger value="file">Upload File</TabsTrigger>
            </TabsList>
            
            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="https://example.com/food_data.xlsx"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
                <Button onClick={handleUrlImport} disabled={!fileUrl.trim()}>
                  <Link className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4 mt-4">
              <div className="flex flex-col space-y-4">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="flex justify-end">
                  <Button onClick={handleFileUpload} disabled={!file}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error instanceof Error ? error.message : 'Failed to load job status'}
                </AlertDescription>
              </Alert>
            ) : jobStatus ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status: {jobStatus.status}</span>
                  <Badge variant={
                    jobStatus.status === 'completed' ? 'success' : 
                    jobStatus.status === 'failed' ? 'destructive' : 
                    'secondary'
                  }>
                    {jobStatus.status}
                  </Badge>
                </div>
                
                <Progress value={jobStatus.progress} className="h-2" />
                
                {jobStatus.status === 'completed' && jobStatus.summary && (
                  <div className="mt-4 space-y-2 bg-muted p-4 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Import Complete
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Valid foods: {jobStatus.summary.valid}</div>
                      <div>Inserted: {jobStatus.summary.inserted}</div>
                      <div>Skipped: {jobStatus.summary.skipped}</div>
                      <div>Errors: {jobStatus.summary.errors}</div>
                      <div className="col-span-2">
                        Duration: {jobStatus.summary.duration.toFixed(2)}s
                      </div>
                    </div>
                  </div>
                )}
                
                {jobStatus.status === 'failed' && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Import Failed</AlertTitle>
                    <AlertDescription>
                      {jobStatus.errorMessage || 'An unknown error occurred during import'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        {jobId && (
          <Button onClick={handleReset} variant="outline">
            {(jobStatus?.status === 'completed' || jobStatus?.status === 'failed') 
              ? 'Start New Import' 
              : 'Cancel'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default FoodImport;
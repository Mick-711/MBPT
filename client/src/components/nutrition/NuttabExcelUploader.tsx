import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Check, X, FileSpreadsheet, File, LoaderCircle } from 'lucide-react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function NuttabExcelUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      const validTypes = ['.xlsx', '.xls', '.csv'];
      const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel (.xlsx, .xls) or CSV file.",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('/api/nuttab/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        }
      });
      
      setUploadResult(response.data);
      
      // Invalidate food cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/foods'] });
      
      toast({
        title: "Upload successful",
        description: `Successfully imported ${response.data.success} foods from NUTTAB.`,
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      setUploadResult({
        error: true,
        message: error.response?.data?.error || 'Failed to upload file'
      });
      
      toast({
        title: "Upload failed",
        description: error.response?.data?.error || "Failed to upload and process the file.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2 text-primary" />
          NUTTAB Excel Uploader
        </CardTitle>
        <CardDescription>
          Upload nutritional data from NUTTAB Excel spreadsheets directly to your database
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {!uploadResult && (
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              
              {!file ? (
                <div className="py-4">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium mb-1">Choose a file</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload an Excel file (.xlsx, .xls) or CSV containing NUTTAB nutrition data
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Select File
                  </Button>
                </div>
              ) : (
                <div className="py-2">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="p-2 rounded-md bg-muted">
                      <File className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetUpload}
                      disabled={isUploading}
                    >
                      Change File
                    </Button>
                    <Button 
                      onClick={handleUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          {uploadResult && !uploadResult.error && (
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <h3 className="font-medium">Upload Successful</h3>
                  <p className="text-sm text-muted-foreground">
                    Processed {uploadResult.totalProcessed} foods from the file
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-md bg-muted p-3">
                  <span className="block text-muted-foreground">Imported</span>
                  <span className="block text-xl font-medium mt-1">{uploadResult.success}</span>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <span className="block text-muted-foreground">Errors</span>
                  <span className="block text-xl font-medium mt-1">{uploadResult.errors}</span>
                </div>
              </div>
              
              {uploadResult.sampleFoods && uploadResult.sampleFoods.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Sample of imported foods:</h4>
                  <div className="text-xs rounded-md border overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] bg-muted p-2 gap-4 font-medium">
                      <div>Food Name</div>
                      <div>Protein</div>
                      <div>Carbs</div>
                      <div>Fat</div>
                    </div>
                    <div className="divide-y">
                      {uploadResult.sampleFoods.map((food: any) => (
                        <div key={food.id} className="grid grid-cols-[1fr_auto_auto_auto] p-2 gap-4">
                          <div>{food.name}</div>
                          <div>{food.protein}g</div>
                          <div>{food.carbs}g</div>
                          <div>{food.fat}g</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <Button variant="outline" size="sm" onClick={resetUpload}>
                Upload Another File
              </Button>
            </div>
          )}
          
          {uploadResult && uploadResult.error && (
            <div className="rounded-lg border border-destructive p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-900 rounded-full p-2">
                  <X className="h-5 w-5 text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <h3 className="font-medium">Upload Failed</h3>
                  <p className="text-sm text-muted-foreground">
                    {uploadResult.message}
                  </p>
                </div>
              </div>
              
              {uploadResult.errorDetails && (
                <div className="text-sm">
                  <Separator className="my-2" />
                  <p className="font-medium mb-1">Error details:</p>
                  <div className="rounded bg-muted p-2 text-xs max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{uploadResult.errorDetails}</pre>
                  </div>
                </div>
              )}
              
              <Button variant="outline" size="sm" onClick={resetUpload}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
        <p>
          Supported formats: Excel (.xlsx, .xls) and CSV files up to 10MB. 
          Make sure your spreadsheet has columns for food name, category, serving size,
          and nutritional values (calories, protein, carbs, fat, etc.).
        </p>
      </CardFooter>
    </Card>
  );
}
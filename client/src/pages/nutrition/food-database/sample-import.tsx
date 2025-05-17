import React from 'react';
import SampleFoodImporter from '@/components/nutrition/SampleFoodImporter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SampleImportPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Food Database Import</h1>
        <p className="text-muted-foreground">Import food data from external sources</p>
      </div>

      <Tabs defaultValue="sample">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="sample">Sample Import</TabsTrigger>
          <TabsTrigger value="standard">Standard Import</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sample" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample NUTTAB Import</CardTitle>
              <CardDescription>
                Import a small sample of foods from the Australian Food Composition Database (NUTTAB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SampleFoodImporter />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="standard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Import (Large Files)</CardTitle>
              <CardDescription>
                This import option can handle larger files but requires more server resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center bg-slate-50 rounded-md">
                <p className="text-muted-foreground mb-2">
                  For very large files like the full NUTTAB database, please use the Sample Import instead
                </p>
                <p className="text-sm">
                  The standard importer attempts to process the entire file at once, which can cause server timeouts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SampleImportPage;
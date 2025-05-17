import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Search, FileSpreadsheet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NuttabFoodImporter from '@/components/nutrition/NuttabFoodImporter';
import NuttabExcelUploader from '@/components/nutrition/NuttabExcelUploader';

export default function NuttabImportPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('search');
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/nutrition/food-database')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Food Database
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Foods from NUTTAB</h1>
          <p className="text-muted-foreground">
            Import foods from the Australian Food Composition Database (NUTTAB) using search or Excel upload
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Search & Import</span>
          </TabsTrigger>
          <TabsTrigger value="excel" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel Upload</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="mt-0">
          <NuttabFoodImporter />
        </TabsContent>
        
        <TabsContent value="excel" className="mt-0">
          <NuttabExcelUploader />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">About NUTTAB</h2>
        <div className="bg-muted p-4 rounded-lg">
          <p className="mb-2">
            NUTTAB (Nutrient Tables for Use in Australia) is the reference nutrient database containing data on the nutrient content of Australian foods.
          </p>
          <p className="mb-2">
            The data is sourced from laboratory analyses conducted by Food Standards Australia New Zealand (FSANZ) or from validated sources including research institutions and the food industry.
          </p>
          <p>
            This tool provides two ways to import NUTTAB data:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Search &amp; Import</strong>: Search for foods by name or category and selectively import them</li>
            <li><strong>Excel Upload</strong>: Bulk import foods from Excel spreadsheets or CSV files containing NUTTAB nutrition data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
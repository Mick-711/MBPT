import React from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import NuttabFoodImporter from '@/components/nutrition/NuttabFoodImporter';

export default function NuttabImportPage() {
  const [, navigate] = useLocation();
  
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
            Search and import foods from the Australian Food Composition Database (NUTTAB)
          </p>
        </div>
      </div>
      
      <NuttabFoodImporter />
      
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
            This tool uses the OpenAI API to provide access to NUTTAB data for easy import into your food database.
          </p>
        </div>
      </div>
    </div>
  );
}
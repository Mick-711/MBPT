import React from 'react';
import { FoodDatabase } from '@/components/nutrition/FoodDatabase';
import { PageHeader } from '@/components/ui/page-header';

export default function FoodDatabasePage() {
  return (
    <div className="container py-6 space-y-6">
      <PageHeader
        heading="Food Database"
        subheading="Browse our comprehensive nutrition database with detailed macro information"
      />
      
      <FoodDatabase />
    </div>
  );
}
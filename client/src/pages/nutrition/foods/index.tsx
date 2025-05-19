import React from 'react';
import { FoodDatabase } from '@/components/nutrition/FoodDatabase';

export default function FoodDatabasePage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Food Database</h1>
        <p className="text-muted-foreground">
          Browse our comprehensive nutrition database with detailed macro information
        </p>
      </div>
      
      <FoodDatabase />
    </div>
  );
}
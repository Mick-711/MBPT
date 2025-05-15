import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Camera, Plus } from 'lucide-react';

export default function ClientProgress() {
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['/api/client/progress'],
    staleTime: 1000 * 60, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const overview = progressData?.overview || {};
  const history = progressData?.history || [];

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Progress</h1>
        </div>
        <Link href="/progress/add">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">Weight</h3>
                {overview.weightChange !== undefined && (
                  <div className={`flex items-center text-xs ${
                    overview.weightChange > 0 
                      ? 'text-red-500' 
                      : overview.weightChange < 0 
                        ? 'text-green-500' 
                        : ''
                  }`}>
                    {overview.weightChange > 0 && <TrendingUp className="h-3 w-3 mr-1" />}
                    {overview.weightChange < 0 && <TrendingDown className="h-3 w-3 mr-1" />}
                    {overview.weightChange !== 0 && `${Math.abs(overview.weightChange)} kg`}
                  </div>
                )}
              </div>
              <p className="font-medium">{overview.currentWeight || '--'} kg</p>
              <p className="text-xs text-muted-foreground">Goal: {overview.goalWeight || '--'} kg</p>
            </div>
            <div className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">Body Fat</h3>
                {overview.bodyFatChange !== undefined && (
                  <div className={`flex items-center text-xs ${
                    overview.bodyFatChange > 0 
                      ? 'text-red-500' 
                      : overview.bodyFatChange < 0 
                        ? 'text-green-500' 
                        : ''
                  }`}>
                    {overview.bodyFatChange > 0 && <TrendingUp className="h-3 w-3 mr-1" />}
                    {overview.bodyFatChange < 0 && <TrendingDown className="h-3 w-3 mr-1" />}
                    {overview.bodyFatChange !== 0 && `${Math.abs(overview.bodyFatChange)}%`}
                  </div>
                )}
              </div>
              <p className="font-medium">{overview.currentBodyFat || '--'}%</p>
              <p className="text-xs text-muted-foreground">Goal: {overview.goalBodyFat || '--'}%</p>
            </div>
            <div className="border rounded-md p-3">
              <h3 className="text-sm font-medium mb-1">Muscle Mass</h3>
              <p className="font-medium">{overview.currentMuscleMass || '--'}%</p>
              <p className="text-xs text-muted-foreground">↑ Since last check-in</p>
            </div>
            <div className="border rounded-md p-3">
              <h3 className="text-sm font-medium mb-1">Measurements</h3>
              <Link href="/progress/measurements">
                <Button variant="ghost" size="sm" className="w-full mt-1 h-7">View Details</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Progress Charts</h2>
          <Link href="/progress/charts">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Weight Progress</h3>
              <div className="text-xs text-muted-foreground">Last 30 days</div>
            </div>
            {/* Weight chart would go here - showing a placeholder */}
            <div className="h-40 bg-muted rounded-md flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Progress History</h2>
        </div>
        
        {history.length === 0 ? (
          <div className="text-center p-8 bg-muted rounded-lg">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Progress Records</h3>
            <p className="text-muted-foreground mb-4">
              Add your first progress record to start tracking.
            </p>
            <Link href="/progress/add">
              <Button>Add First Record</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record: any, index: number) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{record.date}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="font-medium">{record.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Body Fat</p>
                      <p className="font-medium">{record.bodyFat || '--'}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Muscle</p>
                      <p className="font-medium">{record.muscleMass || '--'}%</p>
                    </div>
                  </div>
                  
                  {record.notes && (
                    <p className="text-sm text-muted-foreground mb-3">{record.notes}</p>
                  )}
                  
                  {record.hasPhotos && (
                    <div className="flex items-center">
                      <Camera className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{record.photoCount} photos</span>
                    </div>
                  )}
                  
                  <Link href={`/progress/${record.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-3">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import React from 'react';
import { ClientExerciseRecommendations } from '@/components/clients/client-exercise-recommendations';

export default function ClientExerciseTab({ clientId }: { clientId: number }) {
  return <ClientExerciseRecommendations clientId={clientId} />;
}
import { getExercisesFromStorage, ExerciseData } from './exerciseStorageHelpers';

// Client profile data structure
export interface ClientProfileData {
  id: number;
  userId: number;
  age?: number;
  height?: number;
  weight?: number;
  fitnessLevel?: string; // 'beginner', 'intermediate', 'advanced'
  goals?: string[];
  healthConditions?: string[];
  preferredTrainingDays?: string[];
  preferredExerciseTypes?: string[];
  equipmentAccess?: string[];
  trainerId?: number | null;
  trainingLocation?: string; // 'home', 'gym', 'outdoors'
  trainingFrequency?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Recommendation rules interface
interface RecommendationRule {
  name: string;
  description: string;
  filter: (exercise: ExerciseData, client: ClientProfileData) => boolean;
  score: (exercise: ExerciseData, client: ClientProfileData) => number;
}

// Exercise recommendation with score and reasoning
export interface ExerciseRecommendation {
  exercise: ExerciseData;
  score: number;
  matchReason: string[];
  tags: string[];
}

// Rules for recommending exercises
const recommendationRules: RecommendationRule[] = [
  {
    name: 'fitnessLevelMatch',
    description: 'Matches exercise difficulty with client fitness level',
    filter: (exercise, client) => {
      if (!client.fitnessLevel) return true;
      
      // Map fitness levels to difficulty
      const levelMap: Record<string, string[]> = {
        'beginner': ['Beginner', 'Easy', 'Novice'],
        'intermediate': ['Intermediate', 'Moderate'],
        'advanced': ['Advanced', 'Hard', 'Expert']
      };
      
      // If beginner, only return beginner exercises
      if (client.fitnessLevel === 'beginner') {
        return levelMap.beginner.includes(exercise.difficulty);
      }
      
      // If intermediate, return beginner and intermediate
      if (client.fitnessLevel === 'intermediate') {
        return levelMap.beginner.includes(exercise.difficulty) || 
               levelMap.intermediate.includes(exercise.difficulty);
      }
      
      // Advanced users can handle any difficulty
      return true;
    },
    score: (exercise, client) => {
      if (!client.fitnessLevel) return 0;
      
      // Perfect match
      const levelMap: Record<string, string[]> = {
        'beginner': ['Beginner', 'Easy', 'Novice'],
        'intermediate': ['Intermediate', 'Moderate'],
        'advanced': ['Advanced', 'Hard', 'Expert']
      };
      
      // Higher score for exercises matching the client's level
      if (levelMap[client.fitnessLevel]?.includes(exercise.difficulty)) {
        return 10;
      }
      
      // Lower score for exercises that are easier than client's level
      if (client.fitnessLevel === 'intermediate' && levelMap.beginner.includes(exercise.difficulty)) {
        return 5;
      }
      
      if (client.fitnessLevel === 'advanced') {
        if (levelMap.intermediate.includes(exercise.difficulty)) {
          return 5;
        }
        if (levelMap.beginner.includes(exercise.difficulty)) {
          return 2;
        }
      }
      
      return 0;
    }
  },
  {
    name: 'equipmentAvailability',
    description: 'Matches exercise equipment with client equipment access',
    filter: (exercise, client) => {
      if (!client.equipmentAccess || client.equipmentAccess.length === 0) return true;
      
      // Allow bodyweight or no equipment exercises regardless of equipment access
      if (
        exercise.equipment === 'None' || 
        exercise.equipment === 'Bodyweight' || 
        exercise.equipment.toLowerCase().includes('none') || 
        exercise.equipment.toLowerCase().includes('bodyweight')
      ) {
        return true;
      }
      
      // Check if client has access to the required equipment
      return client.equipmentAccess.some(equip => 
        exercise.equipment.toLowerCase().includes(equip.toLowerCase())
      );
    },
    score: (exercise, client) => {
      if (!client.equipmentAccess || client.equipmentAccess.length === 0) return 0;
      
      // Bodyweight exercises score well for everyone
      if (
        exercise.equipment === 'None' || 
        exercise.equipment === 'Bodyweight' || 
        exercise.equipment.toLowerCase().includes('none') || 
        exercise.equipment.toLowerCase().includes('bodyweight')
      ) {
        return 8;
      }
      
      // Perfect equipment match
      if (client.equipmentAccess.some(equip => 
        exercise.equipment.toLowerCase() === equip.toLowerCase()
      )) {
        return 10;
      }
      
      // Partial equipment match
      if (client.equipmentAccess.some(equip => 
        exercise.equipment.toLowerCase().includes(equip.toLowerCase())
      )) {
        return 7;
      }
      
      return 0;
    }
  },
  {
    name: 'goalMatch',
    description: 'Matches exercise category and muscle groups with client goals',
    filter: () => true, // Don't filter out, just score
    score: (exercise, client) => {
      if (!client.goals || client.goals.length === 0) return 0;
      
      let score = 0;
      
      // Map client goals to exercise attributes
      const goalMap: Record<string, string[]> = {
        'weight_loss': ['cardio', 'hiit', 'functional', 'plyometric'],
        'muscle_building': ['strength', 'hypertrophy'],
        'strength': ['strength', 'power'],
        'endurance': ['cardio', 'endurance'],
        'flexibility': ['flexibility', 'mobility'],
        'general_fitness': ['functional', 'cardio', 'strength', 'balance'],
        'rehabilitation': ['rehabilitation', 'flexibility', 'balance']
      };
      
      // Check if exercise category matches any client goals
      client.goals.forEach(goal => {
        const matchingCategories = goalMap[goal] || [];
        if (matchingCategories.includes(exercise.category.toLowerCase())) {
          score += 8;
        }
        
        // Additional checks for specific goals
        if (goal === 'muscle_building' || goal === 'strength') {
          score += 2; // Bonus for strength exercises for these goals
        }
        
        if (goal === 'weight_loss' && exercise.category.toLowerCase() === 'cardio') {
          score += 3; // Bonus for cardio exercises for weight loss
        }
      });
      
      return Math.min(score, 15); // Cap at 15 points
    }
  },
  {
    name: 'locationMatch',
    description: 'Matches exercise with client training location',
    filter: (exercise, client) => {
      if (!client.trainingLocation) return true;
      
      // Home training should focus on bodyweight or minimal equipment
      if (client.trainingLocation === 'home') {
        return (
          exercise.equipment === 'None' || 
          exercise.equipment === 'Bodyweight' ||
          exercise.equipment.toLowerCase().includes('dumbbell') ||
          exercise.equipment.toLowerCase().includes('resistance band') ||
          exercise.equipment.toLowerCase().includes('kettlebell')
        );
      }
      
      // Gym training can include any equipment
      if (client.trainingLocation === 'gym') {
        return true;
      }
      
      // Outdoor training should focus on bodyweight exercises
      if (client.trainingLocation === 'outdoors') {
        return (
          exercise.equipment === 'None' || 
          exercise.equipment === 'Bodyweight' ||
          exercise.equipment.toLowerCase().includes('bodyweight')
        );
      }
      
      return true;
    },
    score: (exercise, client) => {
      if (!client.trainingLocation) return 0;
      
      let score = 0;
      
      if (client.trainingLocation === 'home') {
        if (exercise.equipment === 'None' || exercise.equipment === 'Bodyweight') {
          score += 10;
        } else if (
          exercise.equipment.toLowerCase().includes('dumbbell') ||
          exercise.equipment.toLowerCase().includes('resistance band') ||
          exercise.equipment.toLowerCase().includes('kettlebell')
        ) {
          score += 8;
        }
      }
      
      if (client.trainingLocation === 'gym') {
        if (exercise.equipment.toLowerCase().includes('machine') || 
            exercise.equipment.toLowerCase().includes('barbell') ||
            exercise.equipment.toLowerCase().includes('cable')
        ) {
          score += 10;
        }
      }
      
      if (client.trainingLocation === 'outdoors') {
        if (exercise.equipment === 'None' || 
            exercise.equipment === 'Bodyweight' ||
            exercise.equipment.toLowerCase().includes('bodyweight')
        ) {
          score += 10;
        }
      }
      
      return score;
    }
  },
  {
    name: 'healthConditionsConsideration',
    description: 'Considers client health conditions when recommending exercises',
    filter: (exercise, client) => {
      if (!client.healthConditions || client.healthConditions.length === 0) return true;
      
      // Simple health condition rules
      // In a real app, these would be much more comprehensive and medically reviewed
      
      // If client has back problems, avoid exercises that load the spine
      if (client.healthConditions.includes('back_pain')) {
        if (
          exercise.muscleGroup === 'Lower Back' ||
          exercise.secondaryMuscleGroups.includes('Lower Back') ||
          exercise.name.toLowerCase().includes('deadlift') ||
          exercise.name.toLowerCase().includes('good morning') ||
          exercise.name.toLowerCase().includes('back extension')
        ) {
          return false;
        }
      }
      
      // If client has knee problems, avoid high-impact exercises
      if (client.healthConditions.includes('knee_pain')) {
        if (
          exercise.name.toLowerCase().includes('jump') ||
          exercise.name.toLowerCase().includes('lunge') ||
          exercise.name.toLowerCase().includes('squat') ||
          exercise.category === 'plyometric'
        ) {
          return false;
        }
      }
      
      // If client has shoulder problems, avoid overhead pressing movements
      if (client.healthConditions.includes('shoulder_pain')) {
        if (
          exercise.name.toLowerCase().includes('overhead press') ||
          exercise.name.toLowerCase().includes('shoulder press') ||
          exercise.name.toLowerCase().includes('military press') ||
          (exercise.muscleGroup === 'Shoulders' && exercise.instructions.toLowerCase().includes('overhead'))
        ) {
          return false;
        }
      }
      
      return true;
    },
    score: () => 0 // No scoring, just filtering
  },
  {
    name: 'preferredExerciseTypes',
    description: 'Matches exercise category with client preferred exercise types',
    filter: () => true, // Don't filter, just score
    score: (exercise, client) => {
      if (!client.preferredExerciseTypes || client.preferredExerciseTypes.length === 0) return 0;
      
      // Map client preferences to exercise categories
      const categoryMap: Record<string, string[]> = {
        'cardio': ['cardio', 'hiit'],
        'strength': ['strength', 'hypertrophy', 'power'],
        'flexibility': ['flexibility', 'mobility', 'yoga'],
        'functional': ['functional', 'balance', 'core'],
        'sport_specific': ['sport_specific', 'plyometric'],
        'group_classes': ['cardio', 'functional', 'hiit']
      };
      
      let score = 0;
      
      // Check for matches between preferred types and exercise category
      client.preferredExerciseTypes.forEach(type => {
        const categories = categoryMap[type] || [];
        if (categories.includes(exercise.category.toLowerCase())) {
          score += 8;
        }
      });
      
      return Math.min(score, 10); // Cap at 10 points
    }
  }
];

/**
 * Generate exercise recommendations for a client
 * @param client Client profile data
 * @param count Number of recommendations to generate (default: 8)
 * @returns Array of exercise recommendations
 */
export function generateExerciseRecommendations(
  client: ClientProfileData,
  count: number = 8
): ExerciseRecommendation[] {
  // Get all exercises from storage
  const allExercises = getExercisesFromStorage();
  
  // Filter exercises based on recommendation rules
  const filteredExercises = allExercises.filter(exercise => {
    return recommendationRules.every(rule => rule.filter(exercise, client));
  });
  
  if (filteredExercises.length === 0) {
    return []; // No matching exercises
  }
  
  // Score each exercise
  const scoredExercises = filteredExercises.map(exercise => {
    let totalScore = 0;
    const matchReasons: string[] = [];
    
    // Apply each rule to score the exercise
    recommendationRules.forEach(rule => {
      const ruleScore = rule.score(exercise, client);
      if (ruleScore > 0) {
        totalScore += ruleScore;
        matchReasons.push(rule.description);
      }
    });
    
    // Add tags based on score components
    const tags: string[] = [];
    
    // Fitness level tag
    if (client.fitnessLevel) {
      if (client.fitnessLevel === 'beginner' && exercise.difficulty === 'Beginner') {
        tags.push('Perfect for beginners');
      } else if (client.fitnessLevel === 'intermediate' && exercise.difficulty === 'Intermediate') {
        tags.push('Great for your level');
      } else if (client.fitnessLevel === 'advanced' && exercise.difficulty === 'Advanced') {
        tags.push('Challenge yourself');
      }
    }
    
    // Equipment tag
    if (client.equipmentAccess && client.equipmentAccess.length > 0) {
      if (exercise.equipment === 'None' || exercise.equipment === 'Bodyweight') {
        tags.push('No equipment needed');
      } else if (client.equipmentAccess.some(eq => exercise.equipment.toLowerCase().includes(eq.toLowerCase()))) {
        tags.push('Uses your available equipment');
      }
    }
    
    // Goal-based tag
    if (client.goals && client.goals.length > 0) {
      if (client.goals.includes('weight_loss') && exercise.category.toLowerCase() === 'cardio') {
        tags.push('Great for weight loss');
      } else if (client.goals.includes('muscle_building') && 
                (exercise.category.toLowerCase() === 'strength' || exercise.category.toLowerCase() === 'hypertrophy')) {
        tags.push('Builds muscle');
      } else if (client.goals.includes('strength') && exercise.category.toLowerCase() === 'strength') {
        tags.push('Increases strength');
      }
    }
    
    // Remove duplicate reasons
    const uniqueReasons = Array.from(new Set(matchReasons));
    
    return {
      exercise,
      score: totalScore,
      matchReason: uniqueReasons,
      tags: tags
    };
  });
  
  // Sort by score (highest first)
  const sortedRecommendations = scoredExercises.sort((a, b) => b.score - a.score);
  
  // Return top N recommendations
  return sortedRecommendations.slice(0, count);
}

/**
 * Generate daily workout recommendations for a client
 * @param client Client profile data
 * @param dayOfWeek Day of the week (0-6, 0 = Sunday)
 * @returns Object containing workout recommendations grouped by purpose
 */
export function generateDailyWorkout(
  client: ClientProfileData,
  dayOfWeek: number = new Date().getDay()
): {
  warmup: ExerciseRecommendation[];
  main: ExerciseRecommendation[];
  finisher: ExerciseRecommendation[];
  cooldown: ExerciseRecommendation[];
} {
  // Get all exercises from storage
  const allExercises = getExercisesFromStorage();
  
  // Filter to exercises suitable for this client
  const suitableExercises = allExercises.filter(exercise => {
    return recommendationRules.every(rule => rule.filter(exercise, client));
  });
  
  // Group exercises by category
  const groupedExercises: Record<string, ExerciseData[]> = {};
  
  suitableExercises.forEach(exercise => {
    const category = exercise.category.toLowerCase();
    if (!groupedExercises[category]) {
      groupedExercises[category] = [];
    }
    groupedExercises[category].push(exercise);
  });
  
  // Get various types of exercises for different parts of workout
  const warmupExercises = [
    ...(groupedExercises['flexibility'] || []),
    ...(groupedExercises['mobility'] || []),
    ...(groupedExercises['cardio'] || []).filter(e => e.difficulty === 'Beginner')
  ];
  
  const mainExercises = [
    ...(groupedExercises['strength'] || []),
    ...(groupedExercises['hypertrophy'] || []),
    ...(groupedExercises['functional'] || [])
  ];
  
  const finisherExercises = [
    ...(groupedExercises['cardio'] || []),
    ...(groupedExercises['hiit'] || []),
    ...(groupedExercises['plyometric'] || [])
  ];
  
  const cooldownExercises = [
    ...(groupedExercises['flexibility'] || []),
    ...(groupedExercises['mobility'] || [])
  ];
  
  // Helper to score and select exercises
  const scoreAndSelect = (exercises: ExerciseData[], count: number): ExerciseRecommendation[] => {
    if (exercises.length === 0) return [];
    
    const scored = exercises.map(exercise => {
      let totalScore = 0;
      const matchReasons: string[] = [];
      
      // Apply each rule to score the exercise
      recommendationRules.forEach(rule => {
        const ruleScore = rule.score(exercise, client);
        if (ruleScore > 0) {
          totalScore += ruleScore;
          matchReasons.push(rule.description);
        }
      });
      
      // Create tags based on exercise purpose
      const tags: string[] = [];
      
      return {
        exercise,
        score: totalScore,
        matchReason: Array.from(new Set(matchReasons)),
        tags
      };
    });
    
    // Sort by score
    const sorted = scored.sort((a, b) => b.score - a.score);
    
    // Take a semirandom selection from the top exercises
    // This ensures variety between different days of the week
    const dayOffset = dayOfWeek * 3; // Different starting point for each day
    const topExercises = sorted.slice(0, Math.min(count * 3, sorted.length));
    
    const selected: ExerciseRecommendation[] = [];
    for (let i = 0; i < count && i < topExercises.length; i++) {
      // Select in a pattern based on day of week to ensure variety
      const index = (i + dayOffset) % topExercises.length;
      selected.push(topExercises[index]);
    }
    
    return selected;
  };
  
  // Select exercises for each workout section
  const warmup = scoreAndSelect(warmupExercises, 2);
  const main = scoreAndSelect(mainExercises, 4);
  const finisher = scoreAndSelect(finisherExercises, 1);
  const cooldown = scoreAndSelect(cooldownExercises, 2);
  
  // Add descriptive tags for each section
  warmup.forEach(rec => {
    rec.tags.push('Warm-up');
    rec.tags.push('Prepare your body');
  });
  
  main.forEach((rec, i) => {
    rec.tags.push('Main workout');
    if (i === 0) rec.tags.push('Start with this');
    if (client.goals?.includes('strength')) rec.tags.push('Strength focus');
    if (client.goals?.includes('muscle_building')) rec.tags.push('Muscle builder');
  });
  
  finisher.forEach(rec => {
    rec.tags.push('Workout finisher');
    rec.tags.push('Push yourself');
  });
  
  cooldown.forEach(rec => {
    rec.tags.push('Cooldown');
    rec.tags.push('Recovery');
  });
  
  return {
    warmup,
    main,
    finisher,
    cooldown
  };
}

/**
 * Generate a full week workout plan for a client
 * @param client Client profile data
 * @returns Object containing workouts for each training day
 */
export function generateWeeklyWorkoutPlan(client: ClientProfileData): Record<number, any> {
  // Determine which days the client trains
  let trainingDays: number[] = [];
  
  if (client.preferredTrainingDays && client.preferredTrainingDays.length > 0) {
    // Convert day names to numbers (0 = Sunday, 1 = Monday, etc.)
    const dayMap: Record<string, number> = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    
    trainingDays = client.preferredTrainingDays
      .map(day => dayMap[day.toLowerCase()])
      .filter(day => day !== undefined);
  } else {
    // Default to 3 days per week (Mon, Wed, Fri)
    trainingDays = [1, 3, 5];
  }
  
  // Cap at client's preferred training frequency
  if (client.trainingFrequency && trainingDays.length > client.trainingFrequency) {
    trainingDays = trainingDays.slice(0, client.trainingFrequency);
  }
  
  // Generate workouts for each training day
  const weeklyPlan: Record<number, any> = {};
  
  trainingDays.forEach(day => {
    weeklyPlan[day] = generateDailyWorkout(client, day);
  });
  
  return weeklyPlan;
}
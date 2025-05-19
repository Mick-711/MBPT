import { pgTable, serial, text, integer, boolean, timestamp, pgEnum, foreignKey, uniqueIndex, doublePrecision } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// User roles enum
export const roleEnum = pgEnum('role', ['trainer', 'client', 'admin']);

// User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  role: roleEnum('role').notNull().default('client'),
  profileImage: text('profile_image'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Trainer profile
export const trainerProfiles = pgTable('trainer_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  specialty: text('specialty'),
  experience: integer('experience'),
  certifications: text('certifications').array(),
  hourlyRate: integer('hourly_rate'),
  availability: text('availability'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: uniqueIndex('trainer_profiles_user_id_idx').on(table.userId)
  };
});

// Client profile
export const clientProfiles = pgTable('client_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  trainerId: integer('trainer_id').references(() => users.id),
  height: integer('height'),
  weight: integer('weight'),
  goals: text('goals'),
  healthInfo: text('health_info'),
  notes: text('notes'),
  dateOfBirth: timestamp('date_of_birth'),
  joinedDate: timestamp('joined_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: uniqueIndex('client_profiles_user_id_idx').on(table.userId)
  };
});

// Subscription
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  trainerId: integer('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planName: text('plan_name').notNull(),
  price: integer('price').notNull(),
  interval: text('interval').notNull(),
  status: text('status').notNull().default('active'),
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workout Plan
export const workoutPlans = pgTable('workout_plans', {
  id: serial('id').primaryKey(),
  trainerId: integer('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: integer('client_id').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  isTemplate: boolean('is_template').default(false),
  duration: integer('duration'),
  frequency: integer('frequency'),
  goal: text('goal'),
  level: text('level'),
  status: text('status').default('active'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workout
export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').notNull().references(() => workoutPlans.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  day: integer('day'),
  duration: integer('duration'),
  calories: integer('calories'),
  notes: text('notes'),
  completed: boolean('completed').default(false),
  completedDate: timestamp('completed_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Exercise Categories enum
export const exerciseCategoryEnum = pgEnum('exercise_category', [
  'strength', 'cardio', 'flexibility', 'balance', 'plyometric', 'functional', 'sport_specific', 'rehabilitation', 'other'
]);

// Exercise
export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  trainerId: integer('trainer_id').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  instructions: text('instructions'),
  muscleGroup: text('muscle_group'),
  secondaryMuscleGroups: text('secondary_muscle_groups').array(),
  equipment: text('equipment'),
  difficulty: text('difficulty'),
  category: exerciseCategoryEnum('category').default('strength'),
  videoUrl: text('video_url'),
  imageUrl: text('image_url'),
  source: text('source'),
  isPublic: boolean('is_public').default(false), // Can be shared with other trainers
  isTemplate: boolean('is_template').default(false),
  tags: text('tags').array(),
  metaData: text('meta_data'), // For storing any additional data as JSON
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workout Exercise
export const workoutExercises = pgTable('workout_exercises', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  sets: integer('sets'),
  reps: integer('reps'),
  weight: integer('weight'),
  duration: integer('duration'),
  rest: integer('rest'),
  notes: text('notes'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Nutrition Plan
export const nutritionPlans = pgTable('nutrition_plans', {
  id: serial('id').primaryKey(),
  trainerId: integer('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: integer('client_id').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  dailyCalories: integer('daily_calories'),
  protein: integer('protein'),
  carbs: integer('carbs'),
  fat: integer('fat'),
  isTemplate: boolean('is_template').default(false),
  status: text('status').default('active'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Meal
export const meals = pgTable('meals', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').notNull().references(() => nutritionPlans.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  calories: integer('calories'),
  protein: integer('protein'),
  carbs: integer('carbs'),
  fat: integer('fat'),
  mealTime: text('meal_time'),
  recipes: text('recipes'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Progress Record
export const progressRecords = pgTable('progress_records', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp('date').defaultNow().notNull(),
  weight: doublePrecision('weight'),
  bodyFat: doublePrecision('body_fat'),
  muscleMass: doublePrecision('muscle_mass'),
  chestMeasurement: doublePrecision('chest_measurement'),
  waistMeasurement: doublePrecision('waist_measurement'),
  hipsMeasurement: doublePrecision('hips_measurement'),
  armsMeasurement: doublePrecision('arms_measurement'),
  thighsMeasurement: doublePrecision('thighs_measurement'),
  bloodPressure: text('blood_pressure'),
  restingHeartRate: integer('resting_heart_rate'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Progress Photo
export const progressPhotos = pgTable('progress_photos', {
  id: serial('id').primaryKey(),
  progressId: integer('progress_id').notNull().references(() => progressRecords.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  type: text('type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Message
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipientId: integer('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  read: boolean('read').default(false),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Client Activity
export const clientActivities = pgTable('client_activities', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Food categories enum
export const foodCategoryEnum = pgEnum('food_category', [
  'protein', 'carbs', 'fat', 'vegetable', 'fruit', 'dairy', 'beverage', 'snack', 'supplement', 'other'
]);

// Food table
export const foods = pgTable('foods', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: foodCategoryEnum('category').default('other'),
  servingSize: doublePrecision('serving_size').notNull().default(100),
  servingUnit: text('serving_unit').notNull().default('g'),
  calories: integer('calories').notNull(),
  protein: doublePrecision('protein').notNull().default(0),
  carbs: doublePrecision('carbs').notNull().default(0),
  fat: doublePrecision('fat').notNull().default(0),
  fiber: doublePrecision('fiber').default(0),
  sugar: doublePrecision('sugar').default(0),
  sodium: doublePrecision('sodium').default(0),
  cholesterol: doublePrecision('cholesterol').default(0),
  isPublic: boolean('is_public').default(true),
  trainerId: integer('trainer_id').references(() => users.id),
  brand: text('brand'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Task
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  trainerId: integer('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: integer('client_id').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  completed: boolean('completed').default(false),
  completedDate: timestamp('completed_date'),
  priority: text('priority').default('medium'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTrainerProfileSchema = createInsertSchema(trainerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClientProfileSchema = createInsertSchema(clientProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkoutSchema = createInsertSchema(workouts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNutritionPlanSchema = createInsertSchema(nutritionPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMealSchema = createInsertSchema(meals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgressRecordSchema = createInsertSchema(progressRecords).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgressPhotoSchema = createInsertSchema(progressPhotos).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertClientActivitySchema = createInsertSchema(clientActivities).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFoodSchema = createInsertSchema(foods).omit({ id: true, createdAt: true, updatedAt: true });

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTrainerProfile = z.infer<typeof insertTrainerProfileSchema>;
export type InsertClientProfile = z.infer<typeof insertClientProfileSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;
export type InsertNutritionPlan = z.infer<typeof insertNutritionPlanSchema>;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type InsertProgressRecord = z.infer<typeof insertProgressRecordSchema>;
export type InsertProgressPhoto = z.infer<typeof insertProgressPhotoSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertClientActivity = z.infer<typeof insertClientActivitySchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertFood = z.infer<typeof insertFoodSchema>;

// Select types
export type User = typeof users.$inferSelect;
export type TrainerProfile = typeof trainerProfiles.$inferSelect;
export type ClientProfile = typeof clientProfiles.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type ProgressRecord = typeof progressRecords.$inferSelect;
export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ClientActivity = typeof clientActivities.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Food = typeof foods.$inferSelect;
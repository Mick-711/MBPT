import { pgTable, text, serial, integer, boolean, jsonb, timestamp, pgEnum, uniqueIndex, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum('user_role', ['trainer', 'client']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'inactive', 'pending', 'cancelled']);
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read']);
export const workoutStatusEnum = pgEnum('workout_status', ['scheduled', 'completed', 'missed']);
export const activityTypeEnum = pgEnum('activity_type', ['workout_completed', 'progress_update', 'nutrition_started', 'message_sent']);
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default('client'),
  profileImage: text("profile_image"),
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  clients: many(clientProfiles),
  trainer: one(trainerProfiles, {
    fields: [users.id],
    references: [trainerProfiles.userId]
  }),
  client: one(clientProfiles, {
    fields: [users.id],
    references: [clientProfiles.userId]
  }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "recipient" }),
}));

// Trainer profiles
export const trainerProfiles = pgTable("trainer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  specialization: text("specialization"),
  bio: text("bio"),
  experience: integer("experience"),
});

export const trainerProfilesRelations = relations(trainerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [trainerProfiles.userId],
    references: [users.id]
  }),
  clients: many(clientProfiles)
}));

// Client profiles
export const clientProfiles = pgTable("client_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  trainerId: integer("trainer_id").references(() => trainerProfiles.id),
  height: integer("height"), // in cm
  weight: integer("weight"), // in kg
  goals: text("goals"),
  healthInfo: text("health_info"),
  notes: text("notes"),
});

export const clientProfilesRelations = relations(clientProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [clientProfiles.userId],
    references: [users.id]
  }),
  trainer: one(trainerProfiles, {
    fields: [clientProfiles.trainerId],
    references: [trainerProfiles.id]
  }),
  progress: many(progressRecords),
  workouts: many(workoutPlans),
  nutritionPlans: many(nutritionPlans)
}));

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clientProfiles.id, { onDelete: 'cascade' }),
  trainerId: integer("trainer_id").notNull().references(() => trainerProfiles.id),
  planName: text("plan_name").notNull(),
  status: subscriptionStatusEnum("status").notNull().default('inactive'),
  price: integer("price").notNull(), // in cents
  billingCycle: text("billing_cycle").notNull(), // monthly, annually
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  features: jsonb("features"),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  client: one(clientProfiles, {
    fields: [subscriptions.clientId],
    references: [clientProfiles.id]
  }),
  trainer: one(trainerProfiles, {
    fields: [subscriptions.trainerId],
    references: [trainerProfiles.id]
  })
}));

// Workout Plans
export const workoutPlans = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  trainerId: integer("trainer_id").notNull().references(() => trainerProfiles.id),
  clientId: integer("client_id").references(() => clientProfiles.id),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isTemplate: boolean("is_template").default(false),
});

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
  trainer: one(trainerProfiles, {
    fields: [workoutPlans.trainerId],
    references: [trainerProfiles.id]
  }),
  client: one(clientProfiles, {
    fields: [workoutPlans.clientId],
    references: [clientProfiles.id]
  }),
  workouts: many(workouts)
}));

// Workouts
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => workoutPlans.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  day: integer("day").notNull(), // Day number in the plan
  scheduledDate: timestamp("scheduled_date"),
  status: workoutStatusEnum("status").default('scheduled'),
  completedDate: timestamp("completed_date"),
  caloriesBurned: integer("calories_burned"),
  duration: integer("duration"), // in minutes
  notes: text("notes"),
});

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  plan: one(workoutPlans, {
    fields: [workouts.planId],
    references: [workoutPlans.id]
  }),
  exercises: many(workoutExercises)
}));

// Exercise Library
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  trainerId: integer("trainer_id").references(() => trainerProfiles.id),
  name: text("name").notNull(),
  description: text("description"),
  muscleGroup: text("muscle_group").notNull(),
  instructions: text("instructions"),
  videoUrl: text("video_url"),
  isPublic: boolean("is_public").default(true),
});

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  trainer: one(trainerProfiles, {
    fields: [exercises.trainerId],
    references: [trainerProfiles.id]
  }),
  workoutExercises: many(workoutExercises)
}));

// Workout Exercises (junction table)
export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
  sets: integer("sets"),
  reps: integer("reps"),
  weight: integer("weight"),
  duration: integer("duration"), // in seconds, for timed exercises
  rest: integer("rest"), // in seconds
  notes: text("notes"),
  order: integer("order").notNull(),
});

export const workoutExercisesRelations = relations(workoutExercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id]
  }),
  exercise: one(exercises, {
    fields: [workoutExercises.exerciseId],
    references: [exercises.id]
  })
}));

// Nutrition Plans
export const nutritionPlans = pgTable("nutrition_plans", {
  id: serial("id").primaryKey(),
  trainerId: integer("trainer_id").notNull().references(() => trainerProfiles.id),
  clientId: integer("client_id").references(() => clientProfiles.id),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  dailyCalories: integer("daily_calories"),
  proteinPercentage: integer("protein_percentage"),
  carbsPercentage: integer("carbs_percentage"),
  fatPercentage: integer("fat_percentage"),
  notes: text("notes"),
  isTemplate: boolean("is_template").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nutritionPlansRelations = relations(nutritionPlans, ({ one, many }) => ({
  trainer: one(trainerProfiles, {
    fields: [nutritionPlans.trainerId],
    references: [trainerProfiles.id]
  }),
  client: one(clientProfiles, {
    fields: [nutritionPlans.clientId],
    references: [clientProfiles.id]
  }),
  meals: many(meals)
}));

// Meals
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => nutritionPlans.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  day: integer("day").notNull(),
  time: text("time").notNull(), // e.g., "breakfast", "lunch", etc.
  calories: integer("calories"),
  protein: integer("protein"), // in grams
  carbs: integer("carbs"), // in grams
  fat: integer("fat"), // in grams
  description: text("description"),
  recipes: jsonb("recipes"), // Can store recipe details or links
});

export const mealsRelations = relations(meals, ({ one }) => ({
  plan: one(nutritionPlans, {
    fields: [meals.planId],
    references: [nutritionPlans.id]
  })
}));

// Progress Records
export const progressRecords = pgTable("progress_records", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clientProfiles.id, { onDelete: 'cascade' }),
  date: timestamp("date").defaultNow().notNull(),
  weight: integer("weight"), // in kg
  bodyFat: integer("body_fat"), // percentage
  muscleMass: integer("muscle_mass"), // percentage
  steps: integer("steps"), // daily step count
  waterIntake: integer("water_intake"), // in ml
  notes: text("notes"),
  measurements: jsonb("measurements"), // JSON object with various body measurements
});

export const progressRecordsRelations = relations(progressRecords, ({ one, many }) => ({
  client: one(clientProfiles, {
    fields: [progressRecords.clientId],
    references: [clientProfiles.id]
  }),
  photos: many(progressPhotos)
}));

// Progress Photos
export const progressPhotos = pgTable("progress_photos", {
  id: serial("id").primaryKey(),
  progressId: integer("progress_id").notNull().references(() => progressRecords.id, { onDelete: 'cascade' }),
  photoUrl: text("photo_url").notNull(),
  photoType: text("photo_type").notNull(), // e.g., "front", "side", "back"
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Daily Habits
export const habitTypes = pgTable("habit_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  defaultTarget: integer("default_target"), // Default target value
  unit: text("unit"), // Unit of measurement (steps, glasses, etc.)
  category: text("category"), // Exercise, Nutrition, Wellness, etc.
});

export const clientHabits = pgTable("client_habits", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clientProfiles.id, { onDelete: 'cascade' }),
  habitTypeId: integer("habit_type_id").notNull().references(() => habitTypes.id),
  target: integer("target").notNull(), // Target value
  active: boolean("active").default(true),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  clientHabitId: integer("client_habit_id").notNull().references(() => clientHabits.id, { onDelete: 'cascade' }),
  date: timestamp("date").defaultNow().notNull(),
  value: integer("value").notNull(), // Actual value achieved
  completed: boolean("completed").default(false),
  notes: text("notes"),
});

// Exercise Performance Tracking
export const exercisePerformance = pgTable("exercise_performance", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clientProfiles.id, { onDelete: 'cascade' }),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
  workoutId: integer("workout_id").references(() => workouts.id),
  date: timestamp("date").defaultNow().notNull(),
  weight: integer("weight"), // in kg
  reps: integer("reps"),
  sets: integer("sets"),
  rpe: integer("rpe"), // Rate of Perceived Exertion (1-10)
  notes: text("notes"),
});

// One Rep Max (and other rep maxes)
export const repMaxes = pgTable("rep_maxes", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clientProfiles.id, { onDelete: 'cascade' }),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
  date: timestamp("date").defaultNow().notNull(),
  reps: integer("reps").notNull(), // 1 for 1RM, 5 for 5RM, etc.
  weight: integer("weight").notNull(), // in kg
  estimated: boolean("estimated").default(false), // Whether this is an actual lift or calculated estimate
});

export const progressPhotosRelations = relations(progressPhotos, ({ one }) => ({
  progressRecord: one(progressRecords, {
    fields: [progressPhotos.progressId],
    references: [progressRecords.id]
  })
}));

export const habitTypesRelations = relations(habitTypes, ({ many }) => ({
  clientHabits: many(clientHabits)
}));

export const clientHabitsRelations = relations(clientHabits, ({ one, many }) => ({
  client: one(clientProfiles, {
    fields: [clientHabits.clientId],
    references: [clientProfiles.id]
  }),
  habitType: one(habitTypes, {
    fields: [clientHabits.habitTypeId],
    references: [habitTypes.id]
  }),
  logs: many(habitLogs)
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  clientHabit: one(clientHabits, {
    fields: [habitLogs.clientHabitId],
    references: [clientHabits.id]
  })
}));

export const exercisePerformanceRelations = relations(exercisePerformance, ({ one }) => ({
  client: one(clientProfiles, {
    fields: [exercisePerformance.clientId],
    references: [clientProfiles.id]
  }),
  exercise: one(exercises, {
    fields: [exercisePerformance.exerciseId],
    references: [exercises.id]
  }),
  workout: one(workouts, {
    fields: [exercisePerformance.workoutId],
    references: [workouts.id]
  })
}));

export const repMaxesRelations = relations(repMaxes, ({ one }) => ({
  client: one(clientProfiles, {
    fields: [repMaxes.clientId],
    references: [clientProfiles.id]
  }),
  exercise: one(exercises, {
    fields: [repMaxes.exerciseId],
    references: [exercises.id]
  })
}));

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: messageStatusEnum("status").default('sent'),
  readAt: timestamp("read_at"),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender"
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "recipient"
  })
}));

// Client Activities (for activity feed)
export const clientActivities = pgTable("client_activities", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clientProfiles.id, { onDelete: 'cascade' }),
  activityType: activityTypeEnum("activity_type").notNull(),
  activityDate: timestamp("activity_date").defaultNow().notNull(),
  details: jsonb("details"), // JSON with details specific to the activity type
  relatedEntityId: integer("related_entity_id"), // ID of related workout, progress record, etc.
  relatedEntityType: text("related_entity_type"), // Type of related entity ("workout", "progress", etc.)
});

export const clientActivitiesRelations = relations(clientActivities, ({ one }) => ({
  client: one(clientProfiles, {
    fields: [clientActivities.clientId],
    references: [clientProfiles.id]
  })
}));

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  trainerId: integer("trainer_id").notNull().references(() => trainerProfiles.id),
  clientId: integer("client_id").references(() => clientProfiles.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  priority: priorityEnum("priority").default('medium'),
  relatedEntityId: integer("related_entity_id"),
  relatedEntityType: text("related_entity_type"),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  trainer: one(trainerProfiles, {
    fields: [tasks.trainerId],
    references: [trainerProfiles.id]
  }),
  client: one(clientProfiles, {
    fields: [tasks.clientId],
    references: [clientProfiles.id]
  })
}));

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTrainerProfileSchema = createInsertSchema(trainerProfiles).omit({ id: true });
export const insertClientProfileSchema = createInsertSchema(clientProfiles).omit({ id: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true });
export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({ id: true, createdAt: true });
export const insertWorkoutSchema = createInsertSchema(workouts).omit({ id: true });
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true });
export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({ id: true });
export const insertNutritionPlanSchema = createInsertSchema(nutritionPlans).omit({ id: true, createdAt: true });
export const insertMealSchema = createInsertSchema(meals).omit({ id: true });
export const insertProgressRecordSchema = createInsertSchema(progressRecords).omit({ id: true, date: true });
export const insertProgressPhotoSchema = createInsertSchema(progressPhotos).omit({ id: true, uploadedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, sentAt: true, status: true, readAt: true });
export const insertClientActivitySchema = createInsertSchema(clientActivities).omit({ id: true, activityDate: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, completed: true, completedAt: true });
export const insertHabitTypeSchema = createInsertSchema(habitTypes).omit({ id: true });
export const insertClientHabitSchema = createInsertSchema(clientHabits).omit({ id: true, startDate: true });
export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({ id: true, date: true });
export const insertExercisePerformanceSchema = createInsertSchema(exercisePerformance).omit({ id: true, date: true });
export const insertRepMaxSchema = createInsertSchema(repMaxes).omit({ id: true, date: true });

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TrainerProfile = typeof trainerProfiles.$inferSelect;
export type InsertTrainerProfile = z.infer<typeof insertTrainerProfileSchema>;

export type ClientProfile = typeof clientProfiles.$inferSelect;
export type InsertClientProfile = z.infer<typeof insertClientProfileSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;

export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type InsertNutritionPlan = z.infer<typeof insertNutritionPlanSchema>;

export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;

export type ProgressRecord = typeof progressRecords.$inferSelect;
export type InsertProgressRecord = z.infer<typeof insertProgressRecordSchema>;

export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type InsertProgressPhoto = z.infer<typeof insertProgressPhotoSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type ClientActivity = typeof clientActivities.$inferSelect;
export type InsertClientActivity = z.infer<typeof insertClientActivitySchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// New types for progress tracking
export type HabitType = typeof habitTypes.$inferSelect;
export type InsertHabitType = z.infer<typeof insertHabitTypeSchema>;

export type ClientHabit = typeof clientHabits.$inferSelect;
export type InsertClientHabit = z.infer<typeof insertClientHabitSchema>;

export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;

export type ExercisePerformance = typeof exercisePerformance.$inferSelect;
export type InsertExercisePerformance = z.infer<typeof insertExercisePerformanceSchema>;

export type RepMax = typeof repMaxes.$inferSelect;
export type InsertRepMax = z.infer<typeof insertRepMaxSchema>;

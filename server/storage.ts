import {
  User, InsertUser, TrainerProfile, InsertTrainerProfile, ClientProfile, 
  InsertClientProfile, WorkoutPlan, InsertWorkoutPlan, Workout, InsertWorkout,
  Exercise, InsertExercise, WorkoutExercise, InsertWorkoutExercise,
  NutritionPlan, InsertNutritionPlan, Meal, InsertMeal, ProgressRecord,
  InsertProgressRecord, ProgressPhoto, InsertProgressPhoto, Message,
  InsertMessage, ClientActivity, InsertClientActivity, Task, InsertTask,
  Subscription, InsertSubscription
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull, ne, asc, inArray } from "drizzle-orm";
import * as schema from "@shared/schema";
import { z } from "zod";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateUserStripeInfo(id: number, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User>;
  
  // Trainer operations
  getTrainerProfile(userId: number): Promise<TrainerProfile | undefined>;
  createTrainerProfile(profile: InsertTrainerProfile): Promise<TrainerProfile>;
  updateTrainerProfile(userId: number, data: Partial<TrainerProfile>): Promise<TrainerProfile>;
  getTrainerClients(trainerId: number): Promise<ClientProfile[]>;
  
  // Client operations
  getClientProfile(userId: number): Promise<ClientProfile | undefined>;
  createClientProfile(profile: InsertClientProfile): Promise<ClientProfile>;
  updateClientProfile(userId: number, data: Partial<ClientProfile>): Promise<ClientProfile>;
  assignClientToTrainer(clientId: number, trainerId: number): Promise<ClientProfile>;
  
  // Subscription operations
  getClientSubscriptions(clientId: number): Promise<Subscription[]>;
  getTrainerSubscriptions(trainerId: number): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription>;
  
  // Workout operations
  getWorkoutPlans(trainerId: number): Promise<WorkoutPlan[]>;
  getWorkoutPlanTemplates(trainerId: number): Promise<WorkoutPlan[]>;
  getClientWorkoutPlans(clientId: number): Promise<WorkoutPlan[]>;
  getWorkoutPlan(id: number): Promise<WorkoutPlan | undefined>;
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  updateWorkoutPlan(id: number, data: Partial<WorkoutPlan>): Promise<WorkoutPlan>;
  deleteWorkoutPlan(id: number): Promise<void>;
  
  // Workout details operations
  getWorkouts(planId: number): Promise<Workout[]>;
  getWorkout(id: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, data: Partial<Workout>): Promise<Workout>;
  deleteWorkout(id: number): Promise<void>;
  
  // Exercise operations
  getExercises(trainerId: number | null): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: number, data: Partial<Exercise>): Promise<Exercise>;
  deleteExercise(id: number): Promise<void>;
  
  // Workout Exercise operations
  getWorkoutExercises(workoutId: number): Promise<(WorkoutExercise & { exercise: Exercise })[]>;
  createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise>;
  updateWorkoutExercise(id: number, data: Partial<WorkoutExercise>): Promise<WorkoutExercise>;
  deleteWorkoutExercise(id: number): Promise<void>;
  
  // Nutrition operations
  getNutritionPlans(trainerId: number): Promise<NutritionPlan[]>;
  getNutritionPlanTemplates(trainerId: number): Promise<NutritionPlan[]>;
  getClientNutritionPlans(clientId: number): Promise<NutritionPlan[]>;
  getNutritionPlan(id: number): Promise<NutritionPlan | undefined>;
  createNutritionPlan(plan: InsertNutritionPlan): Promise<NutritionPlan>;
  updateNutritionPlan(id: number, data: Partial<NutritionPlan>): Promise<NutritionPlan>;
  deleteNutritionPlan(id: number): Promise<void>;
  
  // Meal operations
  getMeals(planId: number): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: number, data: Partial<Meal>): Promise<Meal>;
  deleteMeal(id: number): Promise<void>;
  
  // Progress operations
  getClientProgressRecords(clientId: number): Promise<ProgressRecord[]>;
  getProgressRecord(id: number): Promise<(ProgressRecord & { photos: ProgressPhoto[] }) | undefined>;
  createProgressRecord(record: InsertProgressRecord): Promise<ProgressRecord>;
  updateProgressRecord(id: number, data: Partial<ProgressRecord>): Promise<ProgressRecord>;
  deleteProgressRecord(id: number): Promise<void>;
  
  // Progress Photo operations
  getProgressPhotos(progressId: number): Promise<ProgressPhoto[]>;
  createProgressPhoto(photo: InsertProgressPhoto): Promise<ProgressPhoto>;
  deleteProgressPhoto(id: number): Promise<void>;
  
  // Message operations
  getUserMessages(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(recipientId: number, senderId: number): Promise<void>;
  
  // Activity operations
  getClientActivities(clientId: number, limit?: number): Promise<ClientActivity[]>;
  createClientActivity(activity: InsertClientActivity): Promise<ClientActivity>;
  
  // Task operations
  getTrainerTasks(trainerId: number): Promise<Task[]>;
  getClientTasks(clientId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<Task>): Promise<Task>;
  completeTask(id: number): Promise<Task>;
  deleteTask(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(schema.users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserStripeInfo(id: number, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId
      })
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  }

  // Trainer operations
  async getTrainerProfile(userId: number): Promise<TrainerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(schema.trainerProfiles)
      .where(eq(schema.trainerProfiles.userId, userId));
    return profile;
  }

  async createTrainerProfile(profile: InsertTrainerProfile): Promise<TrainerProfile> {
    const [createdProfile] = await db
      .insert(schema.trainerProfiles)
      .values(profile)
      .returning();
    return createdProfile;
  }

  async updateTrainerProfile(userId: number, data: Partial<TrainerProfile>): Promise<TrainerProfile> {
    const [updatedProfile] = await db
      .update(schema.trainerProfiles)
      .set(data)
      .where(eq(schema.trainerProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async getTrainerClients(trainerId: number): Promise<ClientProfile[]> {
    return db
      .select()
      .from(schema.clientProfiles)
      .where(eq(schema.clientProfiles.trainerId, trainerId));
  }

  // Client operations
  async getClientProfile(userId: number): Promise<ClientProfile | undefined> {
    const [profile] = await db
      .select()
      .from(schema.clientProfiles)
      .where(eq(schema.clientProfiles.userId, userId));
    return profile;
  }

  async createClientProfile(profile: InsertClientProfile): Promise<ClientProfile> {
    const [createdProfile] = await db
      .insert(schema.clientProfiles)
      .values(profile)
      .returning();
    return createdProfile;
  }

  async updateClientProfile(userId: number, data: Partial<ClientProfile>): Promise<ClientProfile> {
    const [profile] = await db
      .select()
      .from(schema.clientProfiles)
      .where(eq(schema.clientProfiles.userId, userId));
    
    if (!profile) {
      throw new Error("Client profile not found");
    }
    
    const [updatedProfile] = await db
      .update(schema.clientProfiles)
      .set(data)
      .where(eq(schema.clientProfiles.id, profile.id))
      .returning();
    return updatedProfile;
  }

  async assignClientToTrainer(clientId: number, trainerId: number): Promise<ClientProfile> {
    const [updatedProfile] = await db
      .update(schema.clientProfiles)
      .set({ trainerId })
      .where(eq(schema.clientProfiles.id, clientId))
      .returning();
    return updatedProfile;
  }

  // Subscription operations
  async getClientSubscriptions(clientId: number): Promise<Subscription[]> {
    return db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.clientId, clientId));
  }

  async getTrainerSubscriptions(trainerId: number): Promise<Subscription[]> {
    return db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.trainerId, trainerId));
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [createdSubscription] = await db
      .insert(schema.subscriptions)
      .values(subscription)
      .returning();
    return createdSubscription;
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(schema.subscriptions)
      .set(data)
      .where(eq(schema.subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  // Workout operations
  async getWorkoutPlans(trainerId: number): Promise<WorkoutPlan[]> {
    return db
      .select()
      .from(schema.workoutPlans)
      .where(eq(schema.workoutPlans.trainerId, trainerId));
  }

  async getWorkoutPlanTemplates(trainerId: number): Promise<WorkoutPlan[]> {
    return db
      .select()
      .from(schema.workoutPlans)
      .where(and(
        eq(schema.workoutPlans.trainerId, trainerId),
        eq(schema.workoutPlans.isTemplate, true)
      ));
  }

  async getClientWorkoutPlans(clientId: number): Promise<WorkoutPlan[]> {
    return db
      .select()
      .from(schema.workoutPlans)
      .where(eq(schema.workoutPlans.clientId, clientId));
  }

  async getWorkoutPlan(id: number): Promise<WorkoutPlan | undefined> {
    const [plan] = await db
      .select()
      .from(schema.workoutPlans)
      .where(eq(schema.workoutPlans.id, id));
    return plan;
  }

  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [createdPlan] = await db
      .insert(schema.workoutPlans)
      .values(plan)
      .returning();
    return createdPlan;
  }

  async updateWorkoutPlan(id: number, data: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const [updatedPlan] = await db
      .update(schema.workoutPlans)
      .set(data)
      .where(eq(schema.workoutPlans.id, id))
      .returning();
    return updatedPlan;
  }

  async deleteWorkoutPlan(id: number): Promise<void> {
    await db
      .delete(schema.workoutPlans)
      .where(eq(schema.workoutPlans.id, id));
  }

  // Workout details operations
  async getWorkouts(planId: number): Promise<Workout[]> {
    return db
      .select()
      .from(schema.workouts)
      .where(eq(schema.workouts.planId, planId))
      .orderBy(asc(schema.workouts.day));
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    const [workout] = await db
      .select()
      .from(schema.workouts)
      .where(eq(schema.workouts.id, id));
    return workout;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [createdWorkout] = await db
      .insert(schema.workouts)
      .values(workout)
      .returning();
    return createdWorkout;
  }

  async updateWorkout(id: number, data: Partial<Workout>): Promise<Workout> {
    const [updatedWorkout] = await db
      .update(schema.workouts)
      .set(data)
      .where(eq(schema.workouts.id, id))
      .returning();
    return updatedWorkout;
  }

  async deleteWorkout(id: number): Promise<void> {
    await db
      .delete(schema.workouts)
      .where(eq(schema.workouts.id, id));
  }

  // Exercise operations
  async getExercises(trainerId: number | null): Promise<Exercise[]> {
    if (trainerId === null) {
      return db
        .select()
        .from(schema.exercises)
        .where(eq(schema.exercises.isPublic, true));
    }
    
    return db
      .select()
      .from(schema.exercises)
      .where(
        or(
          eq(schema.exercises.isPublic, true),
          eq(schema.exercises.trainerId, trainerId)
        )
      );
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    const [exercise] = await db
      .select()
      .from(schema.exercises)
      .where(eq(schema.exercises.id, id));
    return exercise;
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const [createdExercise] = await db
      .insert(schema.exercises)
      .values(exercise)
      .returning();
    return createdExercise;
  }

  async updateExercise(id: number, data: Partial<Exercise>): Promise<Exercise> {
    const [updatedExercise] = await db
      .update(schema.exercises)
      .set(data)
      .where(eq(schema.exercises.id, id))
      .returning();
    return updatedExercise;
  }

  async deleteExercise(id: number): Promise<void> {
    await db
      .delete(schema.exercises)
      .where(eq(schema.exercises.id, id));
  }

  // Workout Exercise operations
  async getWorkoutExercises(workoutId: number): Promise<(WorkoutExercise & { exercise: Exercise })[]> {
    return db
      .select({
        ...schema.workoutExercises,
        exercise: schema.exercises
      })
      .from(schema.workoutExercises)
      .innerJoin(
        schema.exercises,
        eq(schema.workoutExercises.exerciseId, schema.exercises.id)
      )
      .where(eq(schema.workoutExercises.workoutId, workoutId))
      .orderBy(asc(schema.workoutExercises.order));
  }

  async createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const [createdWorkoutExercise] = await db
      .insert(schema.workoutExercises)
      .values(workoutExercise)
      .returning();
    return createdWorkoutExercise;
  }

  async updateWorkoutExercise(id: number, data: Partial<WorkoutExercise>): Promise<WorkoutExercise> {
    const [updatedWorkoutExercise] = await db
      .update(schema.workoutExercises)
      .set(data)
      .where(eq(schema.workoutExercises.id, id))
      .returning();
    return updatedWorkoutExercise;
  }

  async deleteWorkoutExercise(id: number): Promise<void> {
    await db
      .delete(schema.workoutExercises)
      .where(eq(schema.workoutExercises.id, id));
  }

  // Nutrition operations
  async getNutritionPlans(trainerId: number): Promise<NutritionPlan[]> {
    return db
      .select()
      .from(schema.nutritionPlans)
      .where(eq(schema.nutritionPlans.trainerId, trainerId));
  }

  async getNutritionPlanTemplates(trainerId: number): Promise<NutritionPlan[]> {
    return db
      .select()
      .from(schema.nutritionPlans)
      .where(and(
        eq(schema.nutritionPlans.trainerId, trainerId),
        eq(schema.nutritionPlans.isTemplate, true)
      ));
  }

  async getClientNutritionPlans(clientId: number): Promise<NutritionPlan[]> {
    return db
      .select()
      .from(schema.nutritionPlans)
      .where(eq(schema.nutritionPlans.clientId, clientId));
  }

  async getNutritionPlan(id: number): Promise<NutritionPlan | undefined> {
    const [plan] = await db
      .select()
      .from(schema.nutritionPlans)
      .where(eq(schema.nutritionPlans.id, id));
    return plan;
  }

  async createNutritionPlan(plan: InsertNutritionPlan): Promise<NutritionPlan> {
    const [createdPlan] = await db
      .insert(schema.nutritionPlans)
      .values(plan)
      .returning();
    return createdPlan;
  }

  async updateNutritionPlan(id: number, data: Partial<NutritionPlan>): Promise<NutritionPlan> {
    const [updatedPlan] = await db
      .update(schema.nutritionPlans)
      .set(data)
      .where(eq(schema.nutritionPlans.id, id))
      .returning();
    return updatedPlan;
  }

  async deleteNutritionPlan(id: number): Promise<void> {
    await db
      .delete(schema.nutritionPlans)
      .where(eq(schema.nutritionPlans.id, id));
  }

  // Meal operations
  async getMeals(planId: number): Promise<Meal[]> {
    return db
      .select()
      .from(schema.meals)
      .where(eq(schema.meals.planId, planId))
      .orderBy(asc(schema.meals.day), asc(schema.meals.time));
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const [createdMeal] = await db
      .insert(schema.meals)
      .values(meal)
      .returning();
    return createdMeal;
  }

  async updateMeal(id: number, data: Partial<Meal>): Promise<Meal> {
    const [updatedMeal] = await db
      .update(schema.meals)
      .set(data)
      .where(eq(schema.meals.id, id))
      .returning();
    return updatedMeal;
  }

  async deleteMeal(id: number): Promise<void> {
    await db
      .delete(schema.meals)
      .where(eq(schema.meals.id, id));
  }

  // Progress operations
  async getClientProgressRecords(clientId: number): Promise<ProgressRecord[]> {
    return db
      .select()
      .from(schema.progressRecords)
      .where(eq(schema.progressRecords.clientId, clientId))
      .orderBy(desc(schema.progressRecords.date));
  }

  async getProgressRecord(id: number): Promise<(ProgressRecord & { photos: ProgressPhoto[] }) | undefined> {
    const [record] = await db
      .select()
      .from(schema.progressRecords)
      .where(eq(schema.progressRecords.id, id));

    if (!record) return undefined;

    const photos = await db
      .select()
      .from(schema.progressPhotos)
      .where(eq(schema.progressPhotos.progressId, id));

    return { ...record, photos };
  }

  async createProgressRecord(record: InsertProgressRecord): Promise<ProgressRecord> {
    const [createdRecord] = await db
      .insert(schema.progressRecords)
      .values(record)
      .returning();
    return createdRecord;
  }

  async updateProgressRecord(id: number, data: Partial<ProgressRecord>): Promise<ProgressRecord> {
    const [updatedRecord] = await db
      .update(schema.progressRecords)
      .set(data)
      .where(eq(schema.progressRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteProgressRecord(id: number): Promise<void> {
    await db
      .delete(schema.progressRecords)
      .where(eq(schema.progressRecords.id, id));
  }

  // Progress Photo operations
  async getProgressPhotos(progressId: number): Promise<ProgressPhoto[]> {
    return db
      .select()
      .from(schema.progressPhotos)
      .where(eq(schema.progressPhotos.progressId, progressId));
  }

  async createProgressPhoto(photo: InsertProgressPhoto): Promise<ProgressPhoto> {
    const [createdPhoto] = await db
      .insert(schema.progressPhotos)
      .values(photo)
      .returning();
    return createdPhoto;
  }

  async deleteProgressPhoto(id: number): Promise<void> {
    await db
      .delete(schema.progressPhotos)
      .where(eq(schema.progressPhotos.id, id));
  }

  // Message operations
  async getUserMessages(userId: number): Promise<Message[]> {
    return db
      .select()
      .from(schema.messages)
      .where(
        or(
          eq(schema.messages.senderId, userId),
          eq(schema.messages.recipientId, userId)
        )
      )
      .orderBy(desc(schema.messages.sentAt));
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return db
      .select()
      .from(schema.messages)
      .where(
        or(
          and(
            eq(schema.messages.senderId, user1Id),
            eq(schema.messages.recipientId, user2Id)
          ),
          and(
            eq(schema.messages.senderId, user2Id),
            eq(schema.messages.recipientId, user1Id)
          )
        )
      )
      .orderBy(asc(schema.messages.sentAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [createdMessage] = await db
      .insert(schema.messages)
      .values(message)
      .returning();
    return createdMessage;
  }

  async markMessagesAsRead(recipientId: number, senderId: number): Promise<void> {
    await db
      .update(schema.messages)
      .set({
        status: 'read',
        readAt: new Date()
      })
      .where(
        and(
          eq(schema.messages.recipientId, recipientId),
          eq(schema.messages.senderId, senderId),
          ne(schema.messages.status, 'read')
        )
      );
  }

  // Activity operations
  async getClientActivities(clientId: number, limit: number = 10): Promise<ClientActivity[]> {
    return db
      .select()
      .from(schema.clientActivities)
      .where(eq(schema.clientActivities.clientId, clientId))
      .orderBy(desc(schema.clientActivities.activityDate))
      .limit(limit);
  }

  async createClientActivity(activity: InsertClientActivity): Promise<ClientActivity> {
    const [createdActivity] = await db
      .insert(schema.clientActivities)
      .values(activity)
      .returning();
    return createdActivity;
  }

  // Task operations
  async getTrainerTasks(trainerId: number): Promise<Task[]> {
    return db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.trainerId, trainerId))
      .orderBy(asc(schema.tasks.dueDate));
  }

  async getClientTasks(clientId: number): Promise<Task[]> {
    return db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.clientId, clientId))
      .orderBy(asc(schema.tasks.dueDate));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [createdTask] = await db
      .insert(schema.tasks)
      .values(task)
      .returning();
    return createdTask;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const [updatedTask] = await db
      .update(schema.tasks)
      .set(data)
      .where(eq(schema.tasks.id, id))
      .returning();
    return updatedTask;
  }

  async completeTask(id: number): Promise<Task> {
    const [completedTask] = await db
      .update(schema.tasks)
      .set({
        completed: true,
        completedAt: new Date()
      })
      .where(eq(schema.tasks.id, id))
      .returning();
    return completedTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db
      .delete(schema.tasks)
      .where(eq(schema.tasks.id, id));
  }
}

export const storage = new DatabaseStorage();

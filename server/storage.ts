import {
  users,
  bookings,
  contactMessages,
  galleryImages,
  services,
  frames,
  settings,
  type User,
  type InsertUser,
  type UpdateUser,
  type Booking,
  type InsertBooking,
  type UpdateBooking,
  type ContactMessage,
  type InsertContactMessage,
  type GalleryImage,
  type InsertGalleryImage,
  type UpdateGalleryImage,
  type Service,
  type InsertService,
  type UpdateService,
  type Frame,
  type InsertFrame,
  type UpdateFrame,
  type Setting,
  type InsertSetting,
  type UpdateSetting,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, asc, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpdateUser): Promise<User | undefined>;
  validateUser(username: string, password: string): Promise<User | undefined>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(limit?: number, offset?: number): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  updateBooking(id: number, booking: UpdateBooking): Promise<Booking | undefined>;
  getBookingsByStatus(status: string): Promise<Booking[]>;
  
  // Contact message operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(limit?: number, offset?: number): Promise<ContactMessage[]>;
  markMessageAsRead(id: number): Promise<void>;
  getUnreadMessagesCount(): Promise<number>;
  
  // Gallery operations
  getGalleryImages(category?: string): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: number, image: UpdateGalleryImage): Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: number): Promise<void>;
  
  // Service operations
  getServices(): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: UpdateService): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;
  
  // Frame operations
  getFrames(): Promise<Frame[]>;
  getFrameById(id: number): Promise<Frame | undefined>;
  createFrame(frame: InsertFrame): Promise<Frame>;
  updateFrame(id: number, frame: UpdateFrame): Promise<Frame | undefined>;
  deleteFrame(id: number): Promise<void>;
  
  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(key: string, value: string): Promise<Setting | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    const userWithHashedPassword = { ...insertUser, password: hashedPassword };
    
    const [user] = await db
      .insert(users)
      .values(userWithHashedPassword)
      .returning();
    return user;
  }

  async updateUser(id: number, updateUser: UpdateUser): Promise<User | undefined> {
    if (updateUser.password) {
      updateUser.password = await bcrypt.hash(updateUser.password, 12);
    }
    
    const [user] = await db
      .update(users)
      .set({ ...updateUser, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.isActive, true)));
    
    if (!user) return undefined;
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    return isValidPassword ? user : undefined;
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async getBookings(limit = 50, offset = 0): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async updateBooking(id: number, booking: UpdateBooking): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.status, status))
      .orderBy(desc(bookings.createdAt));
  }

  // Contact message operations
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getContactMessages(limit = 50, offset = 0): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async markMessageAsRead(id: number): Promise<void> {
    await db
      .update(contactMessages)
      .set({ isRead: true })
      .where(eq(contactMessages.id, id));
  }

  async getUnreadMessagesCount(): Promise<number> {
    const result = await db
      .select({ count: contactMessages.id })
      .from(contactMessages)
      .where(eq(contactMessages.isRead, false));
    return result.length;
  }

  // Gallery operations
  async getGalleryImages(category?: string): Promise<GalleryImage[]> {
    const query = db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.isActive, true))
      .orderBy(asc(galleryImages.sortOrder), desc(galleryImages.createdAt));
    
    if (category) {
      return await query.where(eq(galleryImages.category, category));
    }
    
    return await query;
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db
      .insert(galleryImages)
      .values(image)
      .returning();
    return newImage;
  }

  async updateGalleryImage(id: number, image: UpdateGalleryImage): Promise<GalleryImage | undefined> {
    const [updatedImage] = await db
      .update(galleryImages)
      .set({ ...image, updatedAt: new Date() })
      .where(eq(galleryImages.id, id))
      .returning();
    return updatedImage || undefined;
  }

  async deleteGalleryImage(id: number): Promise<void> {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.sortOrder), asc(services.name));
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values(service)
      .returning();
    return newService;
  }

  async updateService(id: number, service: UpdateService): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set({ ...service, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return updatedService || undefined;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Frame operations
  async getFrames(): Promise<Frame[]> {
    return await db
      .select()
      .from(frames)
      .where(eq(frames.isActive, true))
      .orderBy(asc(frames.name));
  }

  async getFrameById(id: number): Promise<Frame | undefined> {
    const [frame] = await db.select().from(frames).where(eq(frames.id, id));
    return frame || undefined;
  }

  async createFrame(frame: InsertFrame): Promise<Frame> {
    const [newFrame] = await db
      .insert(frames)
      .values(frame)
      .returning();
    return newFrame;
  }

  async updateFrame(id: number, frame: UpdateFrame): Promise<Frame | undefined> {
    const [updatedFrame] = await db
      .update(frames)
      .set({ ...frame, updatedAt: new Date() })
      .where(eq(frames.id, id))
      .returning();
    return updatedFrame || undefined;
  }

  async deleteFrame(id: number): Promise<void> {
    await db.delete(frames).where(eq(frames.id, id));
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async setSetting(setting: InsertSetting): Promise<Setting> {
    const [newSetting] = await db
      .insert(settings)
      .values(setting)
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: setting.value, updatedAt: new Date() }
      })
      .returning();
    return newSetting;
  }

  async updateSetting(key: string, value: string): Promise<Setting | undefined> {
    const [updatedSetting] = await db
      .update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key))
      .returning();
    return updatedSetting || undefined;
  }
}

export const storage = new DatabaseStorage();
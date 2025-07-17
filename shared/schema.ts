import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  serial
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Session storage table for express-session
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).default("user").notNull(), // 'admin' or 'user'
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  location: varchar("location", { length: 200 }),
  serviceType: varchar("service_type", { length: 50 }).notNull(),
  preferredDate: timestamp("preferred_date").notNull(),
  duration: varchar("duration", { length: 30 }),
  guests: integer("guests"),
  message: text("message"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'confirmed', 'completed', 'cancelled'
  newsletter: boolean("newsletter").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gallery images table
export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // 'wedding', 'pre-wedding', 'baby', 'freelance', 'frames'
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  features: jsonb("features"), // JSON array of features
  basePrice: integer("base_price"), // Price in rupees
  imageUrl: varchar("image_url", { length: 500 }),
  category: varchar("category", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Frame products table
export const frames = pgTable("frames", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  material: varchar("material", { length: 50 }), // 'wood', 'metal', 'plastic', etc.
  size: varchar("size", { length: 30 }), // '8x10', '16x20', etc.
  price: integer("price").notNull(), // Price in rupees
  imageUrl: varchar("image_url", { length: 500 }),
  stock: integer("stock").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Website settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: text("value"),
  type: varchar("type", { length: 20 }).default("text"), // 'text', 'number', 'boolean', 'json'
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  galleryImages: many(galleryImages),
}));

export const galleryImageRelations = relations(galleryImages, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [galleryImages.uploadedBy],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UpdateUser = Partial<InsertUser>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type UpdateBooking = Partial<InsertBooking>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;
export type UpdateGalleryImage = Partial<InsertGalleryImage>;

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;
export type UpdateService = Partial<InsertService>;

export type Frame = typeof frames.$inferSelect;
export type InsertFrame = typeof frames.$inferInsert;
export type UpdateFrame = Partial<InsertFrame>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
export type UpdateSetting = Partial<InsertSetting>;
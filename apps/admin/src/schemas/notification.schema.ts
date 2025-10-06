import { z } from 'zod';

// Notification types enum
export const NotificationTypeSchema = z.enum([
  'TRANSACTION_STATUS',
  'BALANCE_UPDATE', 
  'SYSTEM',
  'PAYMENT_PROCESSED'
]);

// Navigation data structure for notifications
export const NotificationDataSchema = z.object({
  transactionId: z.string().uuid(),
  transactionType: z.enum(['EARN', 'REDEEM']),
  navigationPath: z.string(),
  rejectionReason: z.string().optional(),
  adminNotes: z.string().optional(),
  paymentAmount: z.number().optional(),
  brandName: z.string().optional(),
  amount: z.number().optional(),
  status: z.string().optional(),
});

// Create notification request schema
export const CreateNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  type: NotificationTypeSchema,
  data: NotificationDataSchema.optional(),
  isRead: z.boolean().optional().default(false),
});

// Payment processed notification data
export const PaymentProcessedNotificationDataSchema = z.object({
  transactionId: z.string().uuid(),
  transactionType: z.literal('REDEEM'),
  navigationPath: z.string(),
  paymentAmount: z.number().positive(),
  brandName: z.string(),
  amount: z.number().positive(),
  status: z.literal('PAID'),
});

// Transaction rejected notification data
export const TransactionRejectedNotificationDataSchema = z.object({
  transactionId: z.string().uuid(),
  transactionType: z.enum(['EARN', 'REDEEM']),
  navigationPath: z.string(),
  rejectionReason: z.string().min(1),
  adminNotes: z.string().optional(),
  brandName: z.string().optional(),
  amount: z.number().optional(),
  status: z.literal('REJECTED'),
});

// Notification response schema
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
  isRead: z.boolean(),
  readAt: z.date().optional(),
  isPushed: z.boolean(),
  pushedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Get notifications query schema
export const GetNotificationsQuerySchema = z.object({
  unreadOnly: z.boolean().optional().default(false),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  type: NotificationTypeSchema.optional(),
});

// Notifications response schema
export const NotificationsResponseSchema = z.object({
  notifications: z.array(NotificationSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

// Mark notification as read schema
export const MarkAsReadSchema = z.object({
  notificationId: z.string().uuid(),
  userId: z.string().uuid(),
});

// WebSocket notification event schema
export const WebSocketNotificationEventSchema = z.object({
  event: z.literal('notification_received'),
  data: NotificationSchema,
  userId: z.string().uuid(),
});

// Export types
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type NotificationData = z.infer<typeof NotificationDataSchema>;
export type CreateNotificationRequest = z.infer<typeof CreateNotificationSchema>;
export type PaymentProcessedNotificationData = z.infer<typeof PaymentProcessedNotificationDataSchema>;
export type TransactionRejectedNotificationData = z.infer<typeof TransactionRejectedNotificationDataSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type GetNotificationsQuery = z.infer<typeof GetNotificationsQuerySchema>;
export type NotificationsResponse = z.infer<typeof NotificationsResponseSchema>;
export type MarkAsReadRequest = z.infer<typeof MarkAsReadSchema>;
export type WebSocketNotificationEvent = z.infer<typeof WebSocketNotificationEventSchema>;


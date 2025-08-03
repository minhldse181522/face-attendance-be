export interface NotificationProps {
  id?: bigint;
  // Add properties here
  title: string;
  message: string;
  type: string;
  isRead: boolean;

  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;
}
export interface CreateNotificationProps {
  // Add properties here
  title: string;
  message: string;
  type: string;
  isRead: boolean;

  createdBy: string;
}

export interface UpdateNotificationProps {
  // Add properties here
  title?: string | null;
  message?: string | null;
  type?: string | null;
  isRead?: boolean | null;

  updatedBy: string | null;
}

export interface NotificationProps {
  id?: bigint;
  // Add properties here
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  userCode?: string;

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
  userCode?: string;

  createdBy: string;
}

export interface UpdateNotificationProps {
  // Add properties here
  title?: string | null;
  message?: string | null;
  type?: string | null;
  isRead?: boolean | null;
  userCode?: string | null;

  updatedBy: string | null;
}

export interface AACButtonData {
  id: string;
  row: number;
  col: number;
  label: string;
  iconName?: string;
  icon?: string;
  color?: string;
  action?: string;
}

export interface ChildProfileData {
  id: string;
  name: string;
  image?: string | null;
  ownerId: string;
  createdAt: Date;
}

export interface ActivityData {
  id: string;
  profileId: string;
  date: string; // ISO date string
  icon: string;
  label: string;
  position: number; // 1-4
}

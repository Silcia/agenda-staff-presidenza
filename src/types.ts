export type StaffMemberId = string;

export type StatusType = 
  | 'libero_disponibile'
  | 'in_presidenza'
  | 'in_classe'
  | 'in_riunione'
  | 'ricevimento'
  | 'altra_sede'
  | 'succursale' // kept for backwards-compatibility
  | 'fuori_sede'
  | 'smart_working'
  | 'assente_permesso';

export interface SchoolLocation {
  id: string;
  name: string;
  description?: string;
  type: 'sede' | 'ufficio' | 'aula' | 'laboratorio' | 'esterno';
  isDefault?: boolean;
}

export interface StatusConfig {
  key: StatusType;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  borderColor: string;
  isBusy: boolean;
  iconName: string;
}

export interface StaffMember {
  id: StaffMemberId;
  name: string;
  role: string;
  shortRole: string;
  discipline?: string;
  delegatedTasks?: string; // Compiti delegati / Funzioni assegnate
  email: string;
  phoneExt: string;
  avatarInitials: string;
  colorTheme: string; // Tailwind color token
  currentStatus: StatusType;
  statusNote: string;
  locationRoom: string;
  lastUpdated: string;
}

export type EventCategory = 
  | 'staff_meeting'
  | 'consiglio_classe'
  | 'collegio'
  | 'colloquio'
  | 'presidenza'
  | 'didattica'
  | 'istituzionale'
  | 'formazione'
  | 'commissione'
  | 'altro';

export interface EventCategoryConfig {
  key: EventCategory;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  attendeeIds: StaffMemberId[];
  createdBy: StaffMemberId;
  isUrgent?: boolean;
  notes?: string;
}

export interface StaffNote {
  id: string;
  authorId: StaffMemberId;
  text: string;
  createdAt: string;
  isPinned?: boolean;
  priority?: 'normal' | 'important';
}

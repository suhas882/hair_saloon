export type UserRole = 'admin' | 'customer';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  approval_status: ApprovalStatus;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  category?: string;
  image_url?: string;
  is_active: number;
  created_at?: string;
}

export type ChairStatus = 'available' | 'booked' | 'occupied' | 'blocked' | 'no_show';

export interface Chair {
  id: number;
  chair_number: number;
  name: string;
  status: ChairStatus;
  is_blocked: number;
  block_reason?: string | null;
  updated_at: string;
  current_booking?: {
    booking_id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    booking_status: BookingStatus;
    customer_id?: number;
    customer_name: string;
    customer_phone?: string;
    service_id?: number;
    service_name: string;
    duration_minutes?: number;
    price?: number;
    notes?: string;
  } | null;
  today_bookings_count?: number;
  free_in_minutes?: number;
  timeout_minutes_left?: number | null;
}

export type BookingStatus = 
  | 'confirmed'
  | 'customer_arrived'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type NoShowResolution = 'keep_blocked' | 'released' | null;

export interface Booking {
  id: number;
  customer_id: number;
  service_id: number;
  chair_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  no_show_resolution?: NoShowResolution;
  notes?: string;
  total_price: number;
  created_at: string;
  updated_at?: string;
  // Joined fields
  service_name?: string;
  duration_minutes?: number;
  service_image?: string;
  chair_name?: string;
  chair_number?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface SalonNotification {
  id: number;
  user_id?: number | null;
  type: string;
  title: string;
  message: string;
  is_read: number;
  link?: string;
  created_at: string;
}

export interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  available: boolean;
  available_chairs: {
    id: number;
    chair_number: number;
    name: string;
  }[];
  available_chairs_count: number;
}

export interface AdminDashboardStats {
  total_chairs: number;
  available_chairs: number;
  booked_chairs: number;
  occupied_chairs: number;
  blocked_chairs: number;
  today_appointments: number;
  today_revenue: number;
  pending_approvals: number;
  no_shows: number;
}

export interface SalonSettings {
  id?: number;
  salon_name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  hours_mon_fri: string;
  hours_sat: string;
  hours_sun: string;
  badge_text: string;
  guarantee_text: string;
  updated_at?: string;
}

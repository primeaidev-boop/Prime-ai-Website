// Bookings API calls

import api from './axios';
import type { CreateBookingDto } from '@/types';

export const createBooking = (data: CreateBookingDto) =>
  api.post('/bookings', data);

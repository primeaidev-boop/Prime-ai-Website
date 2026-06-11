// Enquiries API calls

import api from './axios';
import type { CreateEnquiryDto } from '@/types';

export const createEnquiry = (data: CreateEnquiryDto) =>
  api.post('/enquiries', data);

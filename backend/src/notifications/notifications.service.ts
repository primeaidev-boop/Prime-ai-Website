// Notifications service — sends WhatsApp alerts via MSG91 with console fallback

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DemoBooking, Enquiry } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  constructor(private config: ConfigService) {}

  async sendBookingAlert(booking: DemoBooking) {
    const frontendUrl = this.config.get('FRONTEND_URL');
    const message = [
      '🔔 New Demo Booking!',
      `Name: ${booking.name}`,
      `Phone: ${booking.phone}`,
      `Profile: ${booking.profile}`,
      `Course: ${booking.courseInterest}`,
      `Time: ${booking.createdAt.toISOString()}`,
      `Dashboard: ${frontendUrl}/admin/bookings`,
    ].join('\n');

    await this.sendMsg91WhatsApp(
      this.config.get('ADMIN_WHATSAPP') || '',
      message,
    );
  }

  async sendEnquiryAlert(enquiry: Enquiry) {
    const frontendUrl = this.config.get('FRONTEND_URL');
    const message = [
      '📩 New Enquiry!',
      `Name: ${enquiry.name}`,
      `Phone: ${enquiry.phone}`,
      `Email: ${enquiry.email ?? 'N/A'}`,
      `Profile: ${enquiry.profile}`,
      `Course: ${enquiry.courseInterest}`,
      `Message: ${enquiry.message}`,
      `Time: ${enquiry.createdAt.toISOString()}`,
      `Dashboard: ${frontendUrl}/admin/enquiries`,
    ].join('\n');

    await this.sendMsg91WhatsApp(
      this.config.get('ADMIN_WHATSAPP') || '',
      message,
    );
  }

  private async sendMsg91WhatsApp(to: string, message: string) {
    const authKey = this.config.get<string>('MSG91_AUTH_KEY');

    if (!authKey || this.config.get('NODE_ENV') === 'development') {
      console.log('--- Notification (dev) ---');
      console.log(message);
      console.log('--------------------------');
      return;
    }

    try {
      await axios.post(
        'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
        {
          integrated_number: this.config.get('MSG91_SENDER_ID'),
          content_type: 'template',
          payload: {
            to,
            type: 'text',
            text: { body: message },
          },
        },
        {
          headers: {
            authkey: authKey,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (err) {
      console.error('MSG91 notification failed:', (err as Error).message);
    }
  }
}

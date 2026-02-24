import axios from 'axios';
import { config } from '@config/environment';

interface PaystackCustomer {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export class PaystackService {
  private client: any;

  constructor() {
    if (!config.paystack.secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }
    this.client = axios.create({
      baseURL: config.paystack.apiUrl,
      headers: {
        Authorization: `Bearer ${config.paystack.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Initialize a Paystack transaction
   * @param amount Amount in kobo (smallest unit, NGN only)
   * @param email Customer email
   * @param planName Plan name
   * @param metadata Additional metadata
   * @returns Authorization URL and reference
   */
  async initializeTransaction(
    amount: number,
    email: string,
    planName: string,
    metadata: Record<string, any> = {},
    callbackUrl?: string
  ): Promise<{
    authorizationUrl: string;
    accessCode: string;
    reference: string;
  }> {
    try {
      const requestBody: any = {
        email,
        amount,
        metadata: {
          planName,
          initializationTime: new Date().toISOString(),
          ...metadata,
        },
      };

      // Add callback URL if provided - Paystack will redirect here after payment
      if (callbackUrl) {
        requestBody.callback_url = callbackUrl;
      }

      const response = await this.client.post('/transaction/initialize', requestBody);

      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to initialize transaction');
      }

      return {
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: response.data.data.reference,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Paystack initialization failed';
      throw new Error(`Paystack: ${message}`);
    }
  }

  /**
   * Verify a Paystack transaction
   * @param reference Paystack transaction reference
   * @returns Transaction details
   */
  async verifyTransaction(
    reference: string
  ): Promise<{
    status: string;
    amount: number;
    paidAt: string;
    customerEmail: string;
    authorizationCode: string;
  }> {
    try {
      const response = await this.client.get(`/transaction/verify/${reference}`);

      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to verify transaction');
      }

      const data = response.data.data;
      return {
        status: data.status,
        amount: data.amount,
        paidAt: data.paid_at,
        customerEmail: data.customer.email,
        authorizationCode: data.authorization.authorization_code,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Transaction verification failed';
      throw new Error(`Paystack: ${message}`);
    }
  }

  /**
   * Create or update a customer
   * @param customer Customer details
   * @returns Customer data
   */
  async createCustomer(
    customer: PaystackCustomer
  ): Promise<{
    customerId: number;
    customerCode: string;
    email: string;
  }> {
    try {
      const response = await this.client.post('/customer', {
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        metadata: customer.metadata,
      });

      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to create customer');
      }

      return {
        customerId: response.data.data.id,
        customerCode: response.data.data.customer_code,
        email: response.data.data.email,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Customer creation failed';
      throw new Error(`Paystack: ${message}`);
    }
  }

  /**
   * Verify webhook signature from Paystack
   * @param payload Webhook payload
   * @param signature X-Paystack-Signature header value
   * @returns true if signature is valid
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', config.paystack.secretKey)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }

  /**
   * Get public key for frontend integration
   * @returns Paystack public key
   */
  getPublicKey(): string {
    if (!config.paystack.publicKey) {
      throw new Error('PAYSTACK_PUBLIC_KEY is not configured');
    }
    return config.paystack.publicKey;
  }
}

export const paystackService = new PaystackService();

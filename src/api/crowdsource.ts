import axios, { AxiosError } from 'axios';
import type { CrowdsourcePayload } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.couponhub.local/v1';
const TIMEOUT_MS = 5000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function sendCrowdsourcedCode(payload: CrowdsourcePayload): Promise<void> {
  try {
    const sanitizedPayload: CrowdsourcePayload = {
      domain: payload.domain.toLowerCase().trim(),
      code: payload.code.toUpperCase().trim(),
      success: payload.success,
    };

    const response = await apiClient.post('/coupons/feedback', sanitizedPayload);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Unexpected response status: ${response.status}`);
    }

    console.log('[API] Crowdsource feedback sent successfully');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('[API] Crowdsource request failed:', {
        status: axiosError.response?.status,
        message: axiosError.message,
      });
    } else {
      console.error('[API] Crowdsource request failed:', error);
    }
  }
}

export async function fetchRemoteCouponList(source: string): Promise<object> {
  try {
    const response = await apiClient.get(`/coupons/lists/${source}`);
    return response.data;
  } catch (error) {
    console.error('[API] Failed to fetch remote coupon list:', error);
    throw error;
  }
}

export async function getCrowdsourcingStats(): Promise<{ submitted: number; active: number }> {
  try {
    const response = await apiClient.get('/coupons/stats');
    return response.data;
  } catch (error) {
    console.error('[API] Failed to fetch stats:', error);
    return { submitted: 0, active: 0 };
  }
}

export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch {
    return false;
  }
}
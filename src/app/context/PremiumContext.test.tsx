import { renderHook, act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { PremiumProvider, usePremium } from './PremiumContext';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { RevenueCatUI } from '@revenuecat/purchases-capacitor-ui';
import { Capacitor } from '@capacitor/core';

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: vi.fn(() => 'ios'),
  }
}));

// Mock RevenueCat Purchases SDK
vi.mock('@revenuecat/purchases-capacitor', () => {
  return {
    Purchases: {
      setLogLevel: vi.fn(),
      configure: vi.fn(),
      getCustomerInfo: vi.fn(),
      addCustomerInfoUpdateListener: vi.fn(),
      restorePurchases: vi.fn(),
    },
    LOG_LEVEL: { DEBUG: 'DEBUG' }
  };
});

// Mock RevenueCat UI SDK
vi.mock('@revenuecat/purchases-capacitor-ui', () => {
  return {
    RevenueCatUI: {
      presentPaywall: vi.fn(),
      presentCustomerCenter: vi.fn(),
    }
  };
});

describe('PremiumContext', () => {
  const originalEnv = import.meta.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_REVENUECAT_API_KEY', 'test_SylHIqcYlnrhIHIRpFwOoUuCWti');
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PremiumProvider>{children}</PremiumProvider>
  );

  it('initializes as non-pro if user does not have Premium entitlement', async () => {
    const mockCustomerInfo = {
      entitlements: {
        active: {}
      }
    };
    (Purchases.getCustomerInfo as any).mockResolvedValue({ customerInfo: mockCustomerInfo });

    const { result } = renderHook(() => usePremium(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the initialization to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(Purchases.configure).toHaveBeenCalledWith({ apiKey: 'test_SylHIqcYlnrhIHIRpFwOoUuCWti' });
    expect(result.current.isPro).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('initializes as pro if user has Premium entitlement', async () => {
    const mockCustomerInfo = {
      entitlements: {
        active: {
          'Premium': {}
        }
      }
    };
    (Purchases.getCustomerInfo as any).mockResolvedValue({ customerInfo: mockCustomerInfo });

    const { result } = renderHook(() => usePremium(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.isPro).toBe(true);
  });

  it('calls RevenueCatUI presentPaywall', async () => {
    const mockCustomerInfo = { entitlements: { active: {} } };
    (Purchases.getCustomerInfo as any).mockResolvedValue({ customerInfo: mockCustomerInfo });
    (RevenueCatUI.presentPaywall as any).mockResolvedValue({});

    const { result } = renderHook(() => usePremium(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    await act(async () => {
      await result.current.presentPaywall();
    });

    expect(RevenueCatUI.presentPaywall).toHaveBeenCalled();
  });
});

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Purchases, CustomerInfo, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { RevenueCatUI } from '@revenuecat/purchases-capacitor-ui';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// The entitlement identifier we configured in RevenueCat
const ENTITLEMENT_ID = 'Premium';

interface PremiumContextType {
  isPro: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  presentPaywall: () => Promise<void>;
  presentCustomerCenter: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        setIsLoading(true);
        // Only initialize on native platforms, RevenueCat capacitor doesn't support web
        if (Capacitor.getPlatform() === 'web') {
          console.warn('RevenueCat is not supported on web. Mocking premium state for development.');
          // Mock data for web dev
          setIsPro(true);
          setIsLoading(false);
          return;
        }

        // Set Log Level for debugging
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

        const apiKey = import.meta.env.VITE_REVENUECAT_API_KEY;
        if (!apiKey) {
          console.error('VITE_REVENUECAT_API_KEY is missing from environment variables');
          setIsLoading(false);
          return;
        }

        await Purchases.configure({ apiKey });

        // Fetch initial customer info
        const info = await Purchases.getCustomerInfo();
        updateCustomerState(info.customerInfo);

        // Listen for changes
        Purchases.addCustomerInfoUpdateListener((info) => {
          updateCustomerState(info);
        });

      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initRevenueCat();
  }, []);

  const updateCustomerState = (info: CustomerInfo) => {
    setCustomerInfo(info);
    const hasPro = typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    setIsPro(hasPro);
  };

  const presentPaywall = async () => {
    if (Capacitor.getPlatform() === 'web') {
      alert('Paywall presentation mocked on web.');
      return;
    }

    if (isPro) {
      toast.info('You are already Premium!');
      return;
    }

    try {
      setIsLoading(true);
      const paywallResult = await RevenueCatUI.presentPaywall();

      if (paywallResult.result === 'PURCHASED' || paywallResult.result === 'RESTORED') {
        const info = await Purchases.getCustomerInfo();
        updateCustomerState(info.customerInfo);
        toast.success('Premium Activated!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const presentCustomerCenter = async () => {
    if (Capacitor.getPlatform() === 'web') {
      alert('Customer Center mocked on web.');
      return;
    }
    try {
      setIsLoading(true);
      await RevenueCatUI.presentCustomerCenter();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    if (Capacitor.getPlatform() === 'web') {
      alert('Restore purchases mocked on web.');
      return;
    }
    try {
      setIsLoading(true);
      const info = await Purchases.restorePurchases();
      updateCustomerState(info.customerInfo);
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      alert('Failed to restore purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PremiumContext.Provider value={{
      isPro,
      isLoading,
      customerInfo,
      presentPaywall,
      presentCustomerCenter,
      restorePurchases,
    }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

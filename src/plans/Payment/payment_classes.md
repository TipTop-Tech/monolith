I would like to create a feature to implement a pay for premium service into my app. Given that Monolith is a React/Capacitor application, we are using RevenueCat to abstract away the backend validation and payment gateway logic. 

Here is the updated React-based architecture for managing payments and subscriptions:

## React State Management

### `PremiumContext` & `usePremium` Hook (The Gatekeeper / Director)
Replaces the traditional Premium Gatekeeper and PurchaseUseCase classes. This Context initializes the RevenueCat SDK, holds the current user's subscription state, and exposes methods for purchasing and restoring products to the rest of the app.

**State Attributes:**
- `isPro: boolean`: Checks if the user has the active "pro" entitlement (or equivalent identifier). Unlocks all premium features.
- `offerings: PurchasesOfferings | null`: The available products/subscriptions fetched from the App Store or Google Play.
- `isLoading: boolean`: Indicates if a network request (like purchasing or restoring) is currently in progress.

**Methods:**
- `purchasePackage(package: PurchasesPackage) -> Promise<void>`: Coordinates with RevenueCat to show the native purchase sheet. If successful, updates the local `isPro` state.
- `restorePurchases() -> Promise<void>`: Pings RevenueCat to check for existing historical receipts (e.g., if a user switched devices) and restores access if valid, updating `isPro`.

## UI Components

### `Paywall` Component
Replaces the traditional PaywallViewModel. This is a standard React Component that handles the subscription UI screen.

**Responsibilities:**
- Consumes the `usePremium()` hook to access `offerings` and `isLoading`.
- Renders the subscription options and pricing dynamically formatted by RevenueCat (e.g., "$4.99/mo").
- Calls `purchasePackage()` when a user clicks a "Buy" button.
- Calls `restorePurchases()` when the user clicks "Restore Purchases".
- Handles errors gracefully, converting technical system/network errors from RevenueCat into human-readable toast notifications (e.g., "Payment Cancelled" or "Network Error").

## Payment Infrastructure (RevenueCat SDK)

The following traditional backend and gateway services are entirely handled by the `@revenuecat/purchases-capacitor` SDK:

- **PaymentGatewayService**: Handled by RevenueCat's SDK (`getOfferings` and `purchasePackage`).
- **ReceiptValidator**: Handled by RevenueCat's backend servers automatically.
- **SecureSubscriptionStorage**: Handled by RevenueCat's secure local caching of `CustomerInfo`.
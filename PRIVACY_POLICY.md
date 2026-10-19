# Privacy Policy for Monolith

**Effective Date:** October 19, 2026  
**Last Updated:** October 19, 2026  

Monolith ("the App", "we", "us", or "our") is owned and operated by **TipTop Technologies**, located in Sunnyvale, California, United States.

We are committed to protecting your privacy and maintaining the security of any personal information you share with us. This Privacy Policy describes how TipTop Technologies collects, uses, stores, shares, and protects your information when you use the Monolith mobile application (available on iOS and other platforms), website, and associated services (collectively, the "Services").

Please read this Privacy Policy carefully. By creating an account or using Monolith, you acknowledge that you have read and understood the practices described in this Privacy Policy. If you do not agree with this policy, please do not use the Services.

---

## 1. Summary of Key Principles

* **No Data Brokerage or Sale:** We do not sell, rent, or trade your personal information to third parties, data brokers, or advertisers under any circumstances.
* **No Cross-App Tracking:** We do not track you across apps and websites owned by other companies for targeted or behavioral advertising. We do not use the Apple Identifier for Advertisers (IDFA) or third-party ad networks.
* **No Location Services or HealthKit Access:** Monolith does not access or collect your device's GPS location data and does not connect to Apple HealthKit.
* **Offline-First Storage:** Your workout routines, logged sets, repetitions, weights, and history are stored locally on your device in an isolated SQLite database and securely synchronized to our cloud backend (PowerSync and Supabase) when an internet connection is available.
* **User Control & In-App Deletion:** You maintain full control over your workout data, and you may permanently delete your account and all associated records directly within the App at any time.

---

## 2. Information We Collect

### A. Information You Provide Directly to Us
* **Account and Authentication Credentials:** When you register for an account, we collect your email address, username, and password credentials. If you choose to authenticate via **Sign in with Apple** or **Google Sign-In**, we receive authentication tokens and the basic profile information you authorize (such as your name and Apple relay or Google email address).
* **Workout and Fitness Records:** We collect the fitness information you voluntarily log in the App, including custom workout routines, exercise names, muscle group targets, completed sets, repetitions, weights lifted, workout dates and timestamps, rest timer intervals, and routine/exercise notes.
* **User Settings & Preferences:** We store your app preferences, such as preferred weight units (pounds or kilograms), default rest timer durations, visual themes/skins, sound and haptic feedback toggles, and Live Activity widget preferences.
* **Customer Support Communications:** If you contact us for assistance, we collect your email address, device details (such as OS version and app version), and the message contents necessary to resolve your request.

### B. Information Collected Automatically
* **Device and Technical Data:** When you access Monolith, we may collect technical information including your device model, operating system name and version, unique application installation identifier, IP address, and network connection status.
* **Performance and Diagnostics:** We collect minimal performance indicators and crash diagnostics to diagnose technical faults, optimize app responsiveness, and maintain system stability. When using web components, basic page view and performance metrics may be collected via Vercel Web Analytics.
* **Local Storage:** Monolith utilizes local device storage (`localStorage` and SQLite via Capacitor) to maintain your session state, cached routines, active workout timers, and offline logs locally on your device.

### C. In-App Purchases and Subscriptions
* If you subscribe to Monolith Premium or purchase features within the App, all financial transactions are processed directly by Apple via **Apple In-App Purchases (StoreKit)**.
* **TipTop Technologies does NOT collect, process, or store your credit card numbers, debit card numbers, bank account numbers, or billing addresses.** All financial billing is handled strictly by Apple in accordance with Apple's Privacy Policy.
* We receive an anonymized transaction identifier, subscription expiration date, and entitlement status via **RevenueCat** to grant you access to premium features and enable purchase restoration across your devices.

---

## 3. How We Use Your Information

We use the collected information solely for the following purposes:
1. **Core App Functionality:** To record and display your workout history, calculate set volumes, manage your custom fitness routines, and provide exercise guides.
2. **Cloud Synchronization & Offline Continuity:** To synchronize your workout data seamlessly between your local device database and cloud storage so your data is backed up and accessible across your devices.
3. **Live Activities & iOS Widgets:** To present your active workout status, current exercise, and rest countdown timers on the iOS Lock Screen and Dynamic Island.
4. **Subscription Management:** To verify premium entitlements, facilitate purchase restoration, and provide subscription support via RevenueCat.
5. **Account Management & Security:** To authenticate users, prevent fraudulent access, deliver password reset emails, and secure your account.
6. **Product Improvement & Stability:** To monitor app performance, troubleshoot crashes, and optimize workout logging speed.
7. **Legal Compliance:** To comply with applicable statutory requirements and protect legal rights.

---

## 4. Legal Bases for Processing (GDPR / International)

If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we process your personal data under the following legal bases:
* **Performance of a Contract:** Processing is necessary to provide the Services agreed upon when you register an account (e.g., maintaining your workout history and syncing your data).
* **Legitimate Interests:** Processing is necessary for our legitimate interests in protecting our systems, diagnosing bugs, and improving our application, provided those interests are not overridden by your fundamental privacy rights.
* **Consent:** When you explicitly grant consent (e.g., enabling optional device features like iOS Live Activities).
* **Legal Obligation:** Processing is required to comply with statutory and regulatory obligations.

---

## 5. Third-Party Service Providers and Data Sharing

We do not sell your personal data. We disclose information only to service providers that help us operate our Services under strict confidentiality agreements and data protection standards:

| Service Provider | Purpose | Privacy Policy / Terms |
| :--- | :--- | :--- |
| **Supabase** | Cloud PostgreSQL database hosting and user authentication infrastructure | [Supabase Privacy Policy](https://supabase.com/privacy) |
| **PowerSync (JourneyApps)** | Real-time offline-to-cloud database replication and syncing engine | [PowerSync Privacy Policy](https://www.powersync.com/privacy-policy) |
| **RevenueCat** | Subscription infrastructure and in-app purchase validation | [RevenueCat Privacy Policy](https://www.revenuecat.com/privacy) |
| **Apple Inc.** | App distribution, In-App Purchases (StoreKit), Sign in with Apple, Live Activities / WidgetKit | [Apple Privacy Policy](https://www.apple.com/legal/privacy/) |
| **Google LLC** | Google Sign-In authentication | [Google Privacy Policy](https://policies.google.com/privacy) |
| **Vercel** | Web deployment and performance monitoring | [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy) |

We may also disclose information:
* If required by law, court order, subpoena, or government authority;
* To protect the rights, property, or safety of TipTop Technologies, our users, or the public;
* In connection with a corporate sale, merger, reorganization, or acquisition of TipTop Technologies assets, where the successor entity will remain bound by this Privacy Policy.

---

## 6. Data Storage, Security, and Transfers

* **Security Measures:** We implement industry-standard administrative, physical, and technical security measures to safeguard your personal data. Network communications between Monolith and our servers are encrypted using modern Transport Layer Security (TLS/HTTPS).
* **Local Device Security:** Local workout records are maintained in SQLite databases protected by your device's operating system sandboxing and hardware encryption.
* **Cloud Storage:** Remote database infrastructure is hosted in secured data centers with strict access control lists and encryption at rest.
* **International Transfers:** Your data may be transferred to and processed in the United States and other jurisdictions where our cloud infrastructure providers operate. We ensure appropriate safeguards are in place to protect your data in accordance with this policy.

---

## 7. Data Retention and Account Deletion

* **Retention Period:** We retain your account and workout records for as long as your account remains active or as needed to provide you with the Services.
* **In-App Account Deletion:** In accordance with Apple App Store Guideline 5.1.1(v), you can delete your account and all associated personal data directly within the App:
  1. Open Monolith and navigate to **Account**.
  2. Tap **Delete Account**.
  3. Confirm your choice in the confirmation dialog.
  4. Your local workout records will be wiped from your device, your authentication session will be revoked, and your cloud profile and workout history will be permanently deleted from our servers.
* **Email Deletion Request:** You may also request deletion by emailing us at **ishaankumarb65@gmail.com** with the subject line *"Account Deletion Request"* from the email address registered to your Monolith account. Upon verification, all your profile data and workout records will be permanently erased from our cloud systems within 30 days.

---

## 8. Minimum Age and Children's Privacy

Monolith is strictly intended for individuals **16 years of age and older**. We do not knowingly collect or solicit personal information from anyone under the age of 16. If we become aware that we have inadvertently collected personal information from an individual under 16, we will immediately delete that information from our servers. If you are a parent or guardian and believe that your child under 16 has registered an account, please contact us immediately at **ishaankumarb65@gmail.com**.

---

## 9. California Consumer Privacy Rights (CCPA / CPRA)

If you are a California resident, the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), grants you the following rights regarding your personal information:

1. **Right to Know / Access:** You have the right to request disclosure of the categories and specific pieces of personal information we have collected about you over the past 12 months, the sources of collection, and the third parties with whom it was shared.
2. **Right to Delete:** You have the right to request the deletion of personal information we have collected from you, subject to certain statutory exceptions.
3. **Right to Correct:** You have the right to request correction of inaccurate personal information we maintain about you.
4. **Right to Opt-Out of Sale or Sharing:** We **do not sell** your personal information, and we **do not share** your personal information for cross-context behavioral advertising.
5. **Right to Non-Discrimination:** We will not discriminate against you (e.g., deny services, offer inferior service, or charge different prices) for exercising any of your privacy rights.
6. **Shine the Light:** Under California Civil Code Section 1798.83, California residents may request information regarding disclosure of personal information to third parties for direct marketing. TipTop Technologies does not disclose personal information to third parties for direct marketing.

To exercise your California privacy rights, please email us at **ishaankumarb65@gmail.com** with your name and registered account email address.

---

## 10. European Union (GDPR) and UK Privacy Rights

If you reside in the European Economic Area (EEA), United Kingdom (UK), or Switzerland, you are entitled to the following rights under the GDPR / UK GDPR:
* **Right of Access:** Request a copy of the personal data we hold about you.
* **Right to Rectification:** Request correction of inaccurate or incomplete personal data.
* **Right to Erasure ("Right to be Forgotten"):** Request deletion of your personal data.
* **Right to Restriction of Processing:** Request temporary restriction of data processing under certain statutory conditions.
* **Right to Data Portability:** Request an export of your workout data in a structured, commonly used, machine-readable format.
* **Right to Object:** Object to processing based on our legitimate interests.
* **Right to Withdraw Consent:** Where processing is based on your consent, withdraw consent at any time without affecting past processing legality.
* **Right to Lodge a Complaint:** You have the right to lodge a complaint with your local Data Protection Authority (DPA) in the EEA or the Information Commissioner’s Office (ICO) in the UK.

---

## 11. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, or legal obligations. When we make updates, we will revise the "Last Updated" date at the top of this document. If we introduce material changes, we will provide noticeable notice within the App or via email prior to the changes taking effect. We encourage you to review this Privacy Policy periodically.

---

## 12. Contact Information

If you have questions, comments, or requests regarding this Privacy Policy or our data protection practices, please contact us:

**TipTop Technologies**  
Sunnyvale, California, United States  
Email: **ishaankumarb65@gmail.com**  
Website: [https://mind360.ai/](https://mind360.ai/)  
Privacy Policy URL: [https://mind360.ai/privacy](https://mind360.ai/privacy)

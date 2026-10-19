import { useNavigate } from "react-router";
import { ArrowLeft, ShieldCheck, Lock, Smartphone, RefreshCw, Mail, MapPin, Globe } from "lucide-react";

export const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col p-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit flex-shrink-0"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="label-font text-sm">Settings</span>
      </button>

      <div className="flex-1 overflow-y-auto pr-2 pb-12 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Effective Date: October 19, 2026 &bull; Monolith by TipTop Technologies
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 rounded-lg border bg-card p-3 text-card-foreground">
            <ShieldCheck className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">No Data Selling</p>
              <p className="text-muted-foreground mt-0.5">We never sell, rent, or trade your personal data.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border bg-card p-3 text-card-foreground">
            <Lock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">No Third-Party Tracking</p>
              <p className="text-muted-foreground mt-0.5">No advertising trackers, ad networks, or cross-app surveillance.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border bg-card p-3 text-card-foreground">
            <Smartphone className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">No HealthKit / Location</p>
              <p className="text-muted-foreground mt-0.5">Monolith does not access GPS location or Apple HealthKit.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border bg-card p-3 text-card-foreground">
            <RefreshCw className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">Offline-First Sync</p>
              <p className="text-muted-foreground mt-0.5">Local SQLite database synced securely with Supabase &amp; PowerSync.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-2">
            <p>
              <strong>Monolith</strong> is developed and operated by <strong>TipTop Technologies</strong>, located in Sunnyvale, California, United States (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, and protect your information when you use the Monolith application and services. We are dedicated to respecting your privacy and ensuring transparency regarding your data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold border-b pb-1">1. Information We Collect</h2>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">A. Information You Provide Directly</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Account Details:</strong> When creating an account, we collect your email address, username, and authentication credentials. If you register via <em>Sign in with Apple</em> or <em>Google Sign-In</em>, we receive standard authorization tokens and the basic profile information you authorize (e.g., Apple relay email or Google account name/email).
                </li>
                <li>
                  <strong>Workout &amp; Fitness Data:</strong> Custom workout routines, logged exercises, completed sets, reps, weights, workout dates, rest durations, and routine notes.
                </li>
                <li>
                  <strong>Preferences:</strong> Weight units (lbs or kg), theme skins, haptics, sound effects, and Live Activity toggles.
                </li>
                <li>
                  <strong>Support Communications:</strong> Inquiries sent to our support team.
                </li>
              </ul>
            </div>

            <div className="space-y-2 mt-4">
              <h3 className="font-medium text-foreground">B. Information Collected Automatically</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Technical &amp; Device Information:</strong> Device model, OS version, app version, IP address, and system language.
                </li>
                <li>
                  <strong>Performance &amp; Diagnostics:</strong> Anonymous crash diagnostics and basic web performance metrics (via Vercel Analytics) to ensure app reliability.
                </li>
                <li>
                  <strong>Local Storage:</strong> Fast local SQLite database and preferences saved securely in device storage.
                </li>
              </ul>
            </div>

            <div className="space-y-2 mt-4">
              <h3 className="font-medium text-foreground">C. Purchases and Subscriptions</h3>
              <p>
                In-app purchases and subscriptions are processed directly through <strong>Apple App Store (StoreKit)</strong>. TipTop Technologies <strong>never</strong> collects, processes, or stores your credit card numbers or financial account details. We receive an anonymized transaction receipt and entitlement status via <strong>RevenueCat</strong> to unlock premium features.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold border-b pb-1">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide workout logging, set tracking, exercise guidance, and routine planning.</li>
              <li>To synchronize workouts seamlessly across offline storage and cloud backup.</li>
              <li>To power Lock Screen and Dynamic Island widgets via iOS Live Activities.</li>
              <li>To manage your account, sign-in sessions, and password recovery.</li>
              <li>To verify subscription status and restore purchases.</li>
              <li>To debug errors, prevent technical issues, and improve app stability.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold border-b pb-1">3. Third-Party Service Providers</h2>
            <p>
              We only share information with reputable infrastructure partners necessary to deliver Monolith. These providers maintain high industry security standards:
            </p>
            <div className="rounded-lg border bg-secondary/20 p-3 space-y-2 text-xs">
              <p><strong>Supabase:</strong> Cloud database storage and authentication backend.</p>
              <p><strong>PowerSync:</strong> Real-time synchronization between on-device SQLite and cloud.</p>
              <p><strong>RevenueCat:</strong> In-app subscription infrastructure and receipt validation.</p>
              <p><strong>Apple Inc.:</strong> App distribution, In-App Purchase billing, Apple Sign-In, and Live Activities.</p>
              <p><strong>Google LLC:</strong> Google Sign-In authentication.</p>
              <p><strong>Vercel:</strong> Web hosting and performance monitoring.</p>
            </div>
            <p>
              We do <strong>not</strong> sell your data to any data brokers, ad networks, or marketers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold border-b pb-1">4. Data Storage &amp; Security</h2>
            <p>
              All data transmissions between Monolith and our backend services are encrypted using modern Transport Layer Security (HTTPS/TLS). On your device, your workout history is kept in isolated application storage protected by iOS sandboxing and hardware encryption.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold border-b pb-1">5. Data Retention &amp; Account Deletion</h2>
            <p>
              We retain your information as long as your account is active. In compliance with Apple App Store Guideline 5.1.1(v), you may delete your account and all associated workout data directly within the app at any time:
            </p>
            <div className="rounded-lg border bg-secondary/30 p-3 text-xs space-y-2">
              <p className="font-semibold text-foreground">In-App Account Deletion:</p>
              <p>
                Navigate to <strong>Account</strong> in the app navigation and select <strong>Delete Account</strong>. Confirming deletion permanently wipes your local data, revokes your session, and deletes your account records from our cloud database.
              </p>
              <p className="font-semibold text-foreground pt-1">Email Request:</p>
              <p>
                You may also email us at <a href="mailto:ishaankumarb65@gmail.com" className="text-primary underline">ishaankumarb65@gmail.com</a> with the subject <em>&quot;Account Deletion Request&quot;</em> from your registered email address.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold border-b pb-1">6. Minimum Age Policy</h2>
            <p>
              Monolith is strictly intended for individuals <strong>16 years of age and older</strong>. We do not knowingly collect personal data from anyone under 16. If we become aware that an individual under 16 has registered an account, we will immediately delete their information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold border-b pb-1">7. Your Rights (CCPA &amp; GDPR)</h2>
            <p>
              Depending on your location, you may have statutory rights under the <strong>California Consumer Privacy Act (CCPA/CPRA)</strong> or the <strong>EU/UK General Data Protection Regulation (GDPR)</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Right to Know / Access:</strong> Request details on the personal data we hold about you.</li>
              <li><strong>Right to Deletion:</strong> Request that we erase your personal data.</li>
              <li><strong>Right to Correction:</strong> Request correction of inaccurate information.</li>
              <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices.</li>
              <li><strong>Right to Data Portability:</strong> Obtain an export of your logged workouts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold border-b pb-1">8. Contact Us</h2>
            <div className="rounded-lg border bg-card p-4 space-y-2 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">TipTop Technologies</p>
              <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Sunnyvale, California, USA</p>
              <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> <a href="mailto:ishaankumarb65@gmail.com" className="text-primary hover:underline">ishaankumarb65@gmail.com</a></p>
              <p className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Website: <a href="https://mind360.ai/" target="_blank" rel="noreferrer" className="text-primary hover:underline">https://mind360.ai/</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

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

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-sm text-foreground/90">
          <p>
            This document describes how reference.legal, including reference.legal affiliates ("we", "us", "our"), processes the personal information we collect about our users, whether they are an individual or an organization ("user", "you", "your") of our products and services (collectively, "Services").
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            
            <h3 className="text-lg font-medium mt-4">1.1. Categories of Personal Information Processed</h3>
            <p>
              Depending on your use of our Services, we may have processed the following categories of personal information (as defined in the California Consumer Privacy Act "CCPA" and other applicable privacy regulations) in the last twelve months:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Personal Identifiers:</strong> full name, alias, email, device identifier, IP address, mailing address, social security number, etc.</li>
              <li><strong>Customer Records Information:</strong> name, signature, social security number, physical characteristics or description, address, telephone number, passport number, driver's license or state identification card number, insurance policy number, education, employment, employment history, bank account number, credit card number, debit card number, or any other financial information, medical information, health insurance information, etc.</li>
              <li><strong>Characteristics of Protected Classifications under state or federal law:</strong> ethnicity, religion, sexual orientation, gender identity, gender expression, age, etc.</li>
              <li><strong>Commercial Information:</strong> products or services interaction, purchase history, etc.</li>
              <li><strong>Biometric Information:</strong> fingerprints, height, retina scans, facial recognition, voice, etc.</li>
              <li><strong>Internet or Electronic Network Activity information:</strong> browsing history, search history, etc.</li>
              <li><strong>Geolocation Data:</strong> location data derived from IP address or device settings</li>
              <li><strong>Audio, Electronic, Visual, Thermal, Olfactory, or Similar Information:</strong> audio recordings, video recordings, profile pictures, etc.</li>
              <li><strong>Professional or Employment-related Information:</strong> employment history, employment records, job titles, etc.</li>
              <li><strong>Education Information:</strong> admissions history, test scores, etc.</li>
              <li><strong>Inferences:</strong> predictions about consumer preferences, characteristics, or behaviors</li>
            </ul>
            <p>
              In special cases and with your consent, we may collect additional personal information that is not described in this document.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. How We Collect Information</h2>
            
            <h3 className="text-lg font-medium mt-4">2.1. Information You Give Us Directly</h3>
            <p>We collect information that you give us directly, such as:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Profile information, such as your full name, alias, email, date of birth, and password</li>
              <li>Information you provide to us while using our Services</li>
              <li>Information you provide when seeking help from us, such as your name, telephone number, and records of the issues you experience</li>
              <li>Billing information, such as your name, payment card number, payment account details, and shipping address</li>
            </ul>

            <h3 className="text-lg font-medium mt-4">2.2. Information We Collect When You Use Our Services</h3>
            <p>We may collect other information automatically when you use our Services, such as:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Information about your device, hardware, and software, such as your IP address, hardware identifiers, mobile device identifiers (like Apple Identifier for Advertising [IDFA], or Android Advertising ID [AAID]), platform type, settings, and component</li>
              <li>Geolocation data derived from your IP or device</li>
              <li>Browser information, including history and interactions with web content</li>
              <li>Device event information such as crash reports, requests, system activity</li>
            </ul>
            <p>
              Our Services use cookies and similar technologies to collect your personal information and other information. You can learn more about cookies in the link below.
            </p>
            
            <div className="bg-secondary/30 p-4 rounded-lg my-4 space-y-4">
              <h4 className="text-lg font-semibold">Cookies</h4>
              <p>
                <strong>Cookies</strong> are small files that many websites and online services store on a user's computer or device through an internet browser to identify the device and associate activity with it. Cookies allow these websites and online services to navigate between pages efficiently, storing your preferences, improving your experience of a website, and also to ensure the effectiveness of advertisements. Some cookies are shared between third parties for a seamless transition between websites and online services operated by different businesses.
              </p>
              <h5 className="font-medium mt-3">Retention</h5>
              <p>
                Cookies can either be session cookies or persistent cookies. Session cookies are stored temporarily during a single session. Persistent cookies are saved on your device, often for a fixed period of time beyond a single session.
              </p>
              <h5 className="font-medium mt-3">Cookie Categories</h5>
              <p>Cookies are also commonly categorized into the following categories:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Necessary</li>
                <li>Performance</li>
                <li>Functionality</li>
                <li>Social Media</li>
                <li>Advertising</li>
              </ol>
              <h5 className="font-medium mt-3">Similar Technologies</h5>
              <p>
                Tracking pixels, clear GIFs, and web beacons are some examples of analytics technologies similar to cookies. While the mechanism may be different, they serve the same purposes.
              </p>
            </div>

            <p>
              We currently do not respond to Do Not Track (DNT) signals. You may opt out of certain types of tracking on the web, including certain analytics and tailored advertising by changing the cookie settings in your browser or via our consent tools, as applicable.
            </p>

            <h3 className="text-lg font-medium mt-4">2.3. Information Provided to Us by Third Parties</h3>
            <p>
              We may receive information about you from third parties. You will have consented to the transfer of your information either through the third party or through our Services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
            <p>We use your personal information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide, improve, and develop the Services</li>
              <li>Provide support for the Services</li>
              <li>Operate our business</li>
              <li>Measure the health of the Services, the effectiveness of our advertisements</li>
              <li>Detect security incidents</li>
              <li>Personalize our communications with you</li>
              <li>Other purposes you consent to in special cases</li>
            </ul>
            <p>
              We retain the information we collect for as long as necessary to provide the Services, and we may retain that information beyond that period if necessary for legal, operational, or other legitimate reasons.
            </p>
            <p>
              We may also de-identify, anonymize, or aggregate the information we collect, or collect it in a way that does not directly identify you. We may use and share such information as necessary for our business purposes and as permitted by applicable law.
            </p>

            <h3 className="text-lg font-medium mt-4">3.1. Legal Basis for Processing</h3>
            <p>
              Our legal basis for processing your personal information depends on the type and context around the information we collected and the applicable privacy regulation. We typically rely on at least one of several different legal bases to process your personal information, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>your consent to process the information</li>
              <li>necessity for the performance of the Services or another agreement with you</li>
              <li>a legal obligation to process your information</li>
              <li>a legitimate interest in processing the information</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Information We Share with Third Parties</h2>
            <p>
              Except as described below, we do not share, sell, or otherwise disclose personal information to third parties.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Service Providers:</strong> We may use other third parties to help support or provide the Services, and these third parties may collect and process your personal information on our behalf.</li>
              <li><strong>Affiliates and Subsidiaries:</strong> We may share personal information with our companies in which we have an ownership interest as is necessary for the purposes outlined in this notice.</li>
              <li><strong>Advertising Partners:</strong> We may allow third-party advertising partners to utilize technologies and other tracking tools to collect information regarding your use of the Services.</li>
            </ul>
            <p>
              In special cases and with your consent, we may share personal information with other third parties that is not described in this document.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Where We Hold Your Information</h2>
            <p>
              Personal information we collect may be stored and processed for the purposes set out in this document in Canada and the United States. You consent to the transfer of your personal data outside of your country of residence, you acknowledge that your personal information may be transferred to recipients in countries that may not offer the same level of privacy protection as the laws in your country of residence or citizenship.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. How We Protect Your Information</h2>
            <p>
              We use both technical and organizational measures to help protect your personal information. However, we do not always guarantee the security of your information. You play a role in the protection of your personal information as well.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Children</h2>
            <p>
              The Services are not designed for anyone under the age of 13. We do not knowingly collect personal information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete their information. If you are a parent or guardian and are aware that your child has provided us with personal information without your consent, please contact us immediately.
            </p>
            <p>
              For certain Services, we may not allow children under the age of 13 to participate at all. When users identify themselves as being children we will:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Disable features in certain Services that could allow a child to share information that directly identifies them unless a parent has provided relevant consent.</li>
              <li>Obtain consent from parents or guardians for the use of their children's personal information when required by applicable law.</li>
              <li>Limit the processing of personal information to allowable purposes only.</li>
              <li>Not discriminate against a child purely on the choice of not disclosing more personal information than is reasonably necessary.</li>
            </ul>
            <p>
              If you are a parent or guardian, you may revoke your consent at any time and exercise your child's rights on their behalf by contacting us. In the case we discover that a child under 13 has provided us with personal information, we immediately delete their information. If you are a parent or guardian and are aware that your child has provided us with personal information without your consent, please contact us immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Your Rights</h2>
            <p>
              You have certain rights over your personal information. You may exercise the following rights by contacting us directly and making a request. Prior to exercising the rights, we may require you to verify your identity (and in certain cases, the authority to exercise your rights), and we may also charge a small fee to fulfil the request.
            </p>
            <p>
              Depending on where you are using our Services, you may be entitled to the rights provided by the California Consumer Privacy Act, or the EU General Data Protection Regulation as described below.
            </p>

            <div className="bg-secondary/30 p-4 rounded-lg my-4 space-y-4">
              <h4 className="text-lg font-semibold">California Consumer Privacy Act (CCPA) Rights</h4>
              <p>Under the California Consumer Privacy Act (CCPA), you may have the following rights as a consumer:</p>
              
              <h5 className="font-medium mt-3">Know</h5>
              <p>You can request for access to the personal information we hold about you and information relating to our processing of your personal information.</p>
              
              <h5 className="font-medium mt-3">Deletion</h5>
              <p>You can request for deletion of your personal information. However, under certain conditions, we may be obligated to retain backups or copies.</p>
              
              <h5 className="font-medium mt-3">Opt-Out of Sale (or Opt-In)</h5>
              <p>You can opt-out of the sale of your personal information, where applicable. If you are under the age of 16, we do not sell your personal information unless you have specifically opted-in.</p>
              
              <h5 className="font-medium mt-3">Non-discrimination</h5>
              <p>You may not be discriminated against based purely on your decision to exercise your rights.</p>
              
              <h5 className="font-medium mt-3">Correction</h5>
              <p>You can request for correction of your personal information where it is inaccurate or incomplete.</p>
              
              <h5 className="font-medium mt-3">Limit Use and Disclosure of Sensitive Personal Information</h5>
              <p>Sensitive personal information is any personal information that reveals an individual's government ID, finances, geolocation, ethnicity, religion, sexual orientation, union membership, private communications, genetics, biometrics, health, and other categories. You can request that we limit the use and disclosure of your sensitive personal information. When you've opted out, we are limited to processing your sensitive personal information only for a handful of statutory allowable purposes, such as ensuring data security and integrity, non-personalized advertising, performing the services, or verifying and maintaining the services.</p>
            </div>

            <div className="bg-secondary/30 p-4 rounded-lg my-4 space-y-4">
              <h4 className="text-lg font-semibold">EU General Data Protection Regulation (GDPR) Rights</h4>
              <p>Under the EU General Data Protection Regulation, you may have the following rights:</p>

              <h5 className="font-medium mt-3">Access</h5>
              <p>You can request for access to the personal information we hold about you and information relating to our processing of your personal information.</p>

              <h5 className="font-medium mt-3">Correction</h5>
              <p>You can request for correction of your personal information where it is inaccurate or incomplete.</p>

              <h5 className="font-medium mt-3">Erasure</h5>
              <p>You can request for erasure of your personal information. However, under certain conditions, we may be obligated to retain backups or copies.</p>

              <h5 className="font-medium mt-3">Restrict processing</h5>
              <p>You can request for the deletion of processing of your personal information under certain conditions. For example, if you want us to establish the accuracy of the data, or you have objected to our use of data.</p>

              <h5 className="font-medium mt-3">Object to processing</h5>
              <p>You can object to some processing of your personal information, where such requests are permitted by law. We will no longer process your personal information unless we can demonstrate compelling legitimate grounds which override your privacy rights.</p>

              <h5 className="font-medium mt-3">Data portability</h5>
              <p>You can request for a copy of your personal data or request the transfer of your personal data to another company or business. This right only applies to automated data which you initially provided consent for us to use or where we used the data to perform a contract with you.</p>

              <h5 className="font-medium mt-3">Avoid Automated Decision-Making</h5>
              <p>You can request for human intervention where we are carrying out automated decision-making when processing your personal data.</p>

              <h5 className="font-medium mt-3">Non-discrimination</h5>
              <p>You may not be discriminated against based purely on your decision to exercise your rights.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Third-Party Services</h2>
            <p>
              Our Services may contain connections to other third-party services. If you visit a third-party website or use a third-party service, you should consult that service's or website's privacy policy as your use would be governed by their practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Changes to This Document</h2>
            <p>
              We will occasionally update this document by publishing the changes on the web. We encourage you to check our website periodically to ensure that you are aware of the current version of this document.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">11. Contact Us</h2>
            <p>
              If you have questions about this document, please contact us on our homepage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">12. Right to Contact a Data Protection Authority</h2>
            <p>
              If you have a concern about how we collect and use information, please contact us. In certain jurisdictions, you may also have the right to contact your local Data Protection Authority instead. Please reach out to the applicable Data Protection Authority:
            </p>

            <div className="bg-secondary/30 p-4 rounded-lg my-4 space-y-4">
              <ul className="list-disc pl-5 space-y-1">
                <li>United States at <a href="https://www.fcc.gov/consumers/guides/filing-informal-complaint" target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">https://www.fcc.gov/consumers/guides/filing-informal-complaint</a></li>
                <li>Canada at <a href="https://www.priv.gc.ca/en/report-a-concern/" target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">https://www.priv.gc.ca/en/report-a-concern/</a></li>
                <li>EEA at <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">https://edpb.europa.eu/about-edpb/about-edpb/members_en</a></li>
                <li>Switzerland at <a href="https://www.edoeb.admin.ch/edoeb/en/home/the-fdpic/contact.html" target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">https://www.edoeb.admin.ch/edoeb/en/home/the-fdpic/contact.html</a></li>
                <li>UK at <a href="https://ico.org.uk/global/contact-us/" target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">https://ico.org.uk/global/contact-us/</a></li>
                <li>Australia at <a href="https://www.oaic.gov.au/privacy/privacy-complaints" target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">https://www.oaic.gov.au/privacy/privacy-complaints</a></li>
              </ul>
              <p>
                Where appropriate, your local data protection authority may also forward the matter to the Department of Commerce or FTC for consideration.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

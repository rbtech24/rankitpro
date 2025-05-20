import React from 'react';
import { InfoPageLayout } from '../components/layouts/InfoPageLayout';

export default function PrivacyPolicy() {
  return (
    <InfoPageLayout 
      title="Privacy Policy" 
      description="How we collect, use, and protect your information"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <p className="text-sm text-slate-500 mb-8">Last Updated: May 15, 2025</p>
            
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
              <p>
                Rank It Pro ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
              </p>
              <p>
                By using our services, you agree to the collection and use of information in accordance with this policy. 
                We will not use or share your information except as described in this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">2. Information We Collect</h2>
              <h3 className="text-lg font-semibold mb-2">2.1 Personal Information</h3>
              <p>We may collect the following types of personal information:</p>
              <ul className="list-disc pl-5 mb-4">
                <li>Contact information (name, email address, phone number, business address)</li>
                <li>Account credentials (username, password)</li>
                <li>Business information (company name, role, industry)</li>
                <li>Payment information (stored securely through our payment processor)</li>
                <li>Profile information (profile photo, job title)</li>
                <li>Content you provide (check-in data, notes, photos)</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">2.2 Usage Information</h3>
              <p>We automatically collect certain information about your use of our services:</p>
              <ul className="list-disc pl-5 mb-4">
                <li>Log data (IP address, browser type, pages visited, time spent)</li>
                <li>Device information (device type, operating system)</li>
                <li>Location data (when permitted by your device settings)</li>
                <li>Usage patterns and preferences</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">2.3 Information from Third Parties</h3>
              <p>We may receive information about you from third parties, including:</p>
              <ul className="list-disc pl-5">
                <li>Business partners</li>
                <li>Service providers</li>
                <li>Social media platforms (if you connect these to our service)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">3. How We Use Your Information</h2>
              <p>We use the information we collect for various purposes, including to:</p>
              <ul className="list-disc pl-5">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Respond to comments, questions, and requests</li>
                <li>Send technical notices, updates, security alerts, and administrative messages</li>
                <li>Generate content using our AI features based on your check-in data</li>
                <li>Personalize your experience and provide content recommendations</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">4. How We Share Your Information</h2>
              <p>We may share your personal information in the following situations:</p>
              <ul className="list-disc pl-5">
                <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</li>
                <li><strong>With Your Consent:</strong> We may share your information when you direct us to do so.</li>
                <li><strong>For Legal Reasons:</strong> We may disclose your information if we believe it is necessary to comply with applicable laws, regulations, legal processes, or governmental requests.</li>
                <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with a merger, acquisition, reorganization, sale of assets, or bankruptcy.</li>
                <li><strong>Aggregated or Anonymized Data:</strong> We may share aggregated or anonymized information that cannot reasonably be used to identify you.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures designed to protect your personal information from unauthorized access, disclosure, alteration, and destruction. These measures include encryption, access controls, and regular security assessments.
              </p>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">6. Your Rights and Choices</h2>
              <p>Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul className="list-disc pl-5">
                <li><strong>Access:</strong> You can request access to the personal information we hold about you.</li>
                <li><strong>Correction:</strong> You can request that we correct inaccurate or incomplete information.</li>
                <li><strong>Deletion:</strong> You can request that we delete your personal information in certain circumstances.</li>
                <li><strong>Restriction:</strong> You can request that we restrict the processing of your information.</li>
                <li><strong>Data Portability:</strong> You can request a copy of your data in a structured, commonly used, and machine-readable format.</li>
                <li><strong>Objection:</strong> You can object to our processing of your personal information.</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at privacy@rankitpro.com. We will respond to your request within the timeframe required by applicable law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">7. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When determining how long to keep your information, we consider the amount, nature, and sensitivity of the information, the potential risk of harm from unauthorized use or disclosure, and the purposes for which we process the information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">8. Children's Privacy</h2>
              <p>
                Our services are not directed to children under the age of 16. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us, and we will delete such information from our systems.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">9. International Data Transfers</h2>
              <p>
                Your information may be transferred to, and maintained on, computers located outside your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction. If you are located outside the United States and choose to provide information to us, please note that we transfer the information to the United States and process it there.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">10. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4">
                <p><strong>Email:</strong> privacy@rankitpro.com</p>
                <p><strong>Address:</strong> 1234 Tech Way, Suite 500, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> (555) 123-4567</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}
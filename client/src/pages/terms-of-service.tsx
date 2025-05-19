import React from 'react';
import { InfoPageLayout } from '../components/layouts/InfoPageLayout';

export default function TermsOfService() {
  return (
    <InfoPageLayout 
      title="Terms of Service" 
      description="Legal terms governing the use of our platform"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <p className="text-sm text-slate-500 mb-8">Last Updated: May 15, 2025</p>
            
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
              <p>
                Welcome to CheckIn Pro. These Terms of Service ("Terms") govern your access to and use of the CheckIn Pro platform, 
                including our website, mobile applications, and related services (collectively, the "Service"). By using our Service, 
                you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
              </p>
              <p>
                CheckIn Pro is a platform that helps home service businesses manage technician check-ins, generate content, 
                and request reviews. Our Service is provided by CheckIn Pro, Inc. ("we," "us," or "our"), a Delaware corporation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">2. Account Registration</h2>
              <p>
                To use certain features of our Service, you must register for an account. When you register, you agree to provide 
                accurate, current, and complete information about yourself and your business as prompted by our registration form. 
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur 
                under your account.
              </p>
              <p>
                You agree to immediately notify us of any unauthorized use of your account or any other breach of security. We will 
                not be liable for any losses or damages arising from your failure to maintain the security of your account credentials.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">3. Subscription and Payment</h2>
              <p>
                CheckIn Pro offers various subscription plans with different features and pricing. By subscribing to our Service, 
                you agree to pay the applicable subscription fees as described on our pricing page or as otherwise communicated to you.
              </p>
              <p>
                Subscription fees are billed in advance on a monthly or annual basis, depending on the subscription plan you select. 
                Unless otherwise stated, all fees are quoted in U.S. dollars and are non-refundable.
              </p>
              <p>
                You authorize us to charge your designated payment method for all fees incurred in connection with your account. 
                If your payment cannot be completed for any reason, we may suspend or terminate your access to the Service.
              </p>
              <p>
                We reserve the right to change our subscription fees at any time. If we change our fees, we will provide notice 
                of the change on our website or by email at least 30 days before the change takes effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">4. Use of the Service</h2>
              <h3 className="text-lg font-semibold mb-2">4.1 License</h3>
              <p>
                Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, and revocable license to access 
                and use the Service for your internal business purposes.
              </p>

              <h3 className="text-lg font-semibold mb-2 mt-4">4.2 Restrictions</h3>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 mb-4">
                <li>Use the Service in any way that violates any applicable law or regulation</li>
                <li>Attempt to gain unauthorized access to any portion of the Service or any systems or networks connected to the Service</li>
                <li>Reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service without our express written permission</li>
                <li>Use the Service to store or transmit malicious code, viruses, or other harmful data</li>
                <li>Interfere with or disrupt the integrity or performance of the Service</li>
                <li>Attempt to decipher, decompile, disassemble, or reverse engineer any of the software used to provide the Service</li>
                <li>Remove any copyright, trademark, or other proprietary notices from any portion of the Service</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-4">4.3 Content and Data</h3>
              <p>
                You retain all rights in the content and data that you upload, post, or otherwise make available through the Service 
                ("Your Content"). By uploading Your Content, you grant us a worldwide, non-exclusive, royalty-free license to use, 
                copy, modify, and display Your Content solely for the purpose of providing and improving the Service.
              </p>
              <p>
                You represent and warrant that you own or have the necessary rights to Your Content and that Your Content does not 
                infringe or violate the rights of any third party.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">5. AI-Generated Content</h2>
              <p>
                Our Service includes features that use artificial intelligence ("AI") to generate content based on the data you provide. 
                You understand and agree that:
              </p>
              <ul className="list-disc pl-5 mb-4">
                <li>AI-generated content is created programmatically and may require review and editing before use</li>
                <li>We do not guarantee the accuracy, quality, or appropriateness of AI-generated content</li>
                <li>You are responsible for reviewing and editing AI-generated content before publishing it</li>
                <li>You retain ownership of the AI-generated content created using your data</li>
                <li>We may use anonymized data from your use of the AI features to improve our algorithms and Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">6. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by CheckIn Pro and are protected by 
                copyright, trademark, and other intellectual property laws. The CheckIn Pro name and logo are trademarks of 
                CheckIn Pro, Inc.
              </p>
              <p>
                Except as expressly provided in these Terms, nothing in these Terms shall be deemed to grant, by implication, 
                estoppel, or otherwise, any license or right to use any of our intellectual property without our prior written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">7. Third-Party Services</h2>
              <p>
                The Service may integrate with or allow access to third-party services, applications, or websites ("Third-Party Services"). 
                These Third-Party Services are not under our control, and we are not responsible for their content, privacy policies, or practices.
              </p>
              <p>
                Your use of any Third-Party Services is subject to the terms and conditions and privacy policies of those services. 
                We encourage you to review the terms and privacy policies of any Third-Party Services you access through our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">8. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. 
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT ANY DEFECTS 
                IN THE SERVICE WILL BE CORRECTED. WE DO NOT MAKE ANY WARRANTIES OR REPRESENTATIONS REGARDING THE ACCURACY OR 
                COMPLETENESS OF THE CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO THE SERVICE.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">9. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL CHECKIN PRO, ITS AFFILIATES, OFFICERS, DIRECTORS, 
                EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE 
                DAMAGES, INCLUDING, BUT NOT LIMITED TO, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, 
                RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONDUCT OR 
                CONTENT OF ANY THIRD PARTY ON THE SERVICE; (III) ANY CONTENT OBTAINED FROM THE SERVICE; AND (IV) UNAUTHORIZED 
                ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT 
                (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY 
                OF SUCH DAMAGE.
              </p>
              <p>
                IN ANY EVENT, OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE 
                OF THE SERVICE SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO CHECKIN PRO DURING THE TWELVE (12) MONTH PERIOD 
                PRECEDING THE EVENT GIVING RISE TO THE LIABILITY.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">10. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless CheckIn Pro, its affiliates, officers, directors, employees, 
                agents, and licensors from and against all claims, liabilities, damages, judgments, awards, losses, costs, expenses, 
                or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your 
                use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">11. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, 
                for any reason, including, but not limited to, if you breach these Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, 
                you may simply discontinue using the Service or contact us to request account deletion.
              </p>
              <p>
                All provisions of these Terms that by their nature should survive termination shall survive termination, including, 
                but not limited to, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">12. Changes to the Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, 
                we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change 
                will be determined at our sole discretion.
              </p>
              <p>
                By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. 
                If you do not agree to the new terms, you are no longer authorized to use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">13. Governing Law and Dispute Resolution</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without 
                regard to its conflict of law principles.
              </p>
              <p>
                Any dispute arising from or relating to these Terms or your use of the Service shall be resolved exclusively 
                through final and binding arbitration in Delaware. The arbitration shall be conducted by a single arbitrator 
                in accordance with the rules of the American Arbitration Association.
              </p>
              <p>
                You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a 
                class, consolidated, or representative action. If for any reason a claim proceeds in court rather than in arbitration, 
                you waive any right to a jury trial.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">14. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4">
                <p><strong>Email:</strong> legal@checkinpro.com</p>
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
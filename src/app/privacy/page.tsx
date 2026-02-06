"use client";

import { Separator } from "@/components/ui/separator";
import { Shield, Eye, Database, Users, Cookie, Lock, Clock, Globe, Mail } from "lucide-react";

export default function PrivacyPage() {
  const lastUpdated = "February 4, 2026";

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-400/20">
              <Shield className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-10">
          <p className="text-muted-foreground leading-relaxed">
            At Bermy Banana, we take your privacy seriously. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our AI-powered UGC generation platform. This policy is designed to comply with the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and other applicable privacy laws.
          </p>
        </section>

        <Separator className="my-8" />

        {/* Section 1: Information We Collect */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
              <Database className="h-4 w-4 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Personal Information</h3>
              <p className="mb-2">We collect the following personal information when you create an account or use our Service:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Name and email address</li>
                <li>Account credentials (encrypted passwords)</li>
                <li>Billing and payment information (processed securely via third-party providers)</li>
                <li>Profile information and preferences</li>
                <li>Communication history with our support team</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Content and Usage Data</h3>
              <p className="mb-2">We collect data related to your use of the Service:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Images, videos, and other content you upload for processing</li>
                <li>AI-generated content created through our platform</li>
                <li>Prompts and inputs provided to AI systems</li>
                <li>Usage patterns, features accessed, and time spent on the platform</li>
                <li>Device information (browser type, operating system, IP address)</li>
                <li>Log data and analytics information</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: How We Use Your Information */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10">
              <Eye className="h-4 w-4 text-purple-500" />
            </div>
            <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>We use your information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-foreground">Service Provision:</strong> To provide, maintain, and improve our AI-powered UGC generation services</li>
              <li><strong className="text-foreground">Account Management:</strong> To create and manage your account, process payments, and provide customer support</li>
              <li><strong className="text-foreground">AI Processing:</strong> To process your uploaded content and generate AI outputs using third-party AI providers</li>
              <li><strong className="text-foreground">Communication:</strong> To send service notifications, updates, and marketing communications (with your consent)</li>
              <li><strong className="text-foreground">Security:</strong> To detect fraud, abuse, and security threats; to verify your identity</li>
              <li><strong className="text-foreground">Analytics:</strong> To analyze usage patterns and improve our Service</li>
              <li><strong className="text-foreground">Legal Compliance:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Legal Basis for Processing (GDPR) */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10">
              <span className="text-lg font-bold text-orange-500">3</span>
            </div>
            <h2 className="text-2xl font-semibold">3. Legal Basis for Processing (GDPR)</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>Under GDPR, we process your personal data based on the following legal grounds:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-foreground">Contractual Necessity:</strong> Processing necessary to provide the Service you requested</li>
              <li><strong className="text-foreground">Legitimate Interests:</strong> Improving our services, ensuring security, and preventing fraud</li>
              <li><strong className="text-foreground">Consent:</strong> Marketing communications and certain types of data processing</li>
              <li><strong className="text-foreground">Legal Obligation:</strong> Compliance with tax, accounting, and other legal requirements</li>
            </ul>
          </div>
        </section>

        {/* Section 4: Data Sharing and Third Parties */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10">
              <Users className="h-4 w-4 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-semibold">4. Data Sharing and Third Parties</h2>
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>We may share your information with the following categories of third parties:</p>
            
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h3 className="font-medium text-foreground">AI Service Providers</h3>
              <p className="text-sm">
                We use third-party AI providers (such as OpenAI, Stability AI, and other model providers) to process your content and generate outputs. Your prompts and uploaded content may be transmitted to these providers subject to their privacy policies.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h3 className="font-medium text-foreground">Cloud Infrastructure</h3>
              <p className="text-sm">
                We use cloud service providers (such as AWS, Google Cloud, or Azure) to host our platform and store your data securely.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h3 className="font-medium text-foreground">Payment Processors</h3>
              <p className="text-sm">
                Payment information is processed by secure third-party payment processors (such as Stripe). We do not store your full credit card details.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h3 className="font-medium text-foreground">Analytics and Support</h3>
              <p className="text-sm">
                We use analytics providers (such as Google Analytics) and customer support tools to improve our Service and assist you.
              </p>
            </div>

            <p className="text-sm italic mt-4">
              We do not sell your personal information to third parties for monetary consideration. We may share anonymized, aggregated data that does not identify you personally.
            </p>
          </div>
        </section>

        {/* Section 5: Cookies and Tracking */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10">
              <Cookie className="h-4 w-4 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-semibold">5. Cookies and Tracking Technologies</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>We use cookies and similar tracking technologies to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintain your session and authentication status</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze usage patterns and improve our Service</li>
              <li>Provide essential functionality of the platform</li>
            </ul>
            <p className="mt-4">
              <strong className="text-foreground">Types of cookies we use:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-foreground">Essential Cookies:</strong> Required for the Service to function properly</li>
              <li><strong className="text-foreground">Functional Cookies:</strong> Enable enhanced features and personalization</li>
              <li><strong className="text-foreground">Analytics Cookies:</strong> Help us understand how users interact with our Service</li>
            </ul>
            <p className="mt-4">
              You can manage cookie preferences through your browser settings or our cookie consent banner. Note that disabling certain cookies may affect the functionality of the Service.
            </p>
          </div>
        </section>

        {/* Section 6: Data Security */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10">
              <Lock className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold">6. Data Security</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Access controls and authentication requirements</li>
              <li>Employee training on data protection practices</li>
              <li>Incident response procedures</li>
            </ul>
            <p className="mt-4">
              While we strive to protect your data, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </div>
        </section>

        {/* Section 7: Data Retention */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/10">
              <Clock className="h-4 w-4 text-teal-500" />
            </div>
            <h2 className="text-2xl font-semibold">7. Data Retention</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>We retain your personal information for as long as necessary to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide the Service you requested</li>
              <li>Comply with legal obligations (tax, accounting, etc.)</li>
              <li>Resolve disputes and enforce our agreements</li>
              <li>Protect against fraudulent or abusive activity</li>
            </ul>
            <p className="mt-4">
              <strong className="text-foreground">Retention Periods:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account information: Retained while your account is active; deleted within 30 days of account closure (unless legally required to retain)</li>
              <li>Uploaded content: Retained based on your subscription plan and storage limits; deleted upon account closure</li>
              <li>Payment records: Retained for 7 years for tax and accounting purposes</li>
              <li>Log data: Retained for up to 12 months for security and analytics purposes</li>
            </ul>
          </div>
        </section>

        {/* Section 8: Your Privacy Rights */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10">
              <Globe className="h-4 w-4 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-semibold">8. Your Privacy Rights</h2>
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>Depending on your location, you may have the following rights:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">GDPR Rights (EU/EEA)</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Right to access your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure ("right to be forgotten")</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                  <li>Rights related to automated decision-making</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">CCPA Rights (California)</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to know if personal information is sold/shared</li>
                  <li>Right to opt-out of sale of personal information</li>
                  <li>Right to access your personal information</li>
                  <li>Right to deletion of personal information</li>
                  <li>Right to non-discrimination for exercising rights</li>
                </ul>
              </div>
            </div>

            <p>
              To exercise your rights, please contact us using the information in Section 11. We will respond to your request within the timeframe required by applicable law.
            </p>
          </div>
        </section>

        {/* Section 9: Children's Privacy */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-500/10">
              <span className="text-lg font-bold text-pink-500">9</span>
            </div>
            <h2 className="text-2xl font-semibold">9. Children's Privacy</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Our Service is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we discover we have collected personal information from a child under 16, we will delete that information promptly.
            </p>
          </div>
        </section>

        {/* Section 10: International Transfers */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-500/10">
              <span className="text-lg font-bold text-gray-500">10</span>
            </div>
            <h2 className="text-2xl font-semibold">10. International Data Transfers</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Your information may be transferred to and processed in countries other than your country of residence, including the United States. These countries may have data protection laws different from those in your jurisdiction. We ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) for transfers outside the EEA, to protect your personal information.
            </p>
          </div>
        </section>

        {/* Section 11: Contact Us */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10">
              <Mail className="h-4 w-4 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold">11. Contact Us and Data Protection Officer</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
            </p>
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium text-foreground">Bermy Banana</p>
              <p>Email: privacy@bermybanana.com</p>
              <p>Address: 123 Innovation Drive, Suite 100, Wilmington, DE 19801</p>
              <p className="mt-2">Data Protection Officer: dpo@bermybanana.com</p>
            </div>
            <p className="text-sm mt-4">
              For EU residents, you also have the right to lodge a complaint with your local data protection authority if you believe we have violated applicable data protection laws.
            </p>
          </div>
        </section>

        {/* Section 12: Changes to Policy */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
              <span className="text-lg font-bold text-blue-500">12</span>
            </div>
            <h2 className="text-2xl font-semibold">12. Changes to This Privacy Policy</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Footer Note */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By using Bermy Banana, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}

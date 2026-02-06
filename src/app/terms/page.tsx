"use client";

import { Separator } from "@/components/ui/separator";
import { ScrollText, Shield, AlertTriangle, XCircle, Scale } from "lucide-react";

export default function TermsPage() {
  const lastUpdated = "February 4, 2026";

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400/20">
              <ScrollText className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-10">
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Bermy Banana. These Terms of Service ("Terms") govern your access to and use of the Bermy Banana platform, including our website, applications, and AI-powered UGC generation services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Service.
          </p>
        </section>

        <Separator className="my-8" />

        {/* Section 1: Service Description */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
              <Shield className="h-4 w-4 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold">1. Service Description</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Bermy Banana provides AI-powered user-generated content (UGC) generation services, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>AI-generated talking head videos for marketing and advertising purposes</li>
              <li>Influencer-style photo generation for social media content</li>
              <li>Product demonstration videos featuring AI avatars</li>
              <li>Multi-scene workflow tools for content creation</li>
            </ul>
            <p>
              The Service utilizes artificial intelligence and machine learning technologies to generate content based on user inputs, prompts, and uploaded materials. We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.
            </p>
          </div>
        </section>

        {/* Section 2: User Accounts */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10">
              <span className="text-lg font-bold text-green-500">2</span>
            </div>
            <h2 className="text-2xl font-semibold">2. User Accounts and Registration</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              To access certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly notify us of any unauthorized access or security breach</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Be at least 18 years of age or have parental consent if under 18</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or contain false information.
            </p>
          </div>
        </section>

        {/* Section 3: User Obligations */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10">
              <span className="text-lg font-bold text-purple-500">3</span>
            </div>
            <h2 className="text-2xl font-semibold">3. User Obligations</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              As a user of Bermy Banana, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
              <li>Ensure you have all necessary rights to any content you upload or use</li>
              <li>Not interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Not attempt to gain unauthorized access to any portion of the Service</li>
              <li>Comply with all applicable laws, regulations, and third-party rights</li>
              <li>Clearly disclose AI-generated content when required by law or platform policies</li>
              <li>Not use the Service to create content that infringes on intellectual property rights</li>
            </ul>
          </div>
        </section>

        {/* Section 4: Prohibited Uses */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold">4. Prohibited Uses</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              You may not use the Service to create, generate, or distribute content that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Is illegal, fraudulent, or promotes illegal activities</li>
              <li>Infringes upon intellectual property rights of any third party</li>
              <li>Contains defamatory, libelous, or harassing material</li>
              <li>Depicts explicit sexual content or nudity</li>
              <li>Promotes violence, terrorism, or hate speech</li>
              <li>Is deceptive, misleading, or constitutes impersonation without disclosure</li>
              <li>Contains malware, viruses, or other harmful code</li>
              <li>Involves the unauthorized collection of personal data</li>
              <li>Creates deepfakes intended to deceive or harm individuals</li>
              <li>Violates the rights of publicity or privacy of any person</li>
            </ul>
            <p className="text-sm italic mt-4">
              Violation of these prohibitions may result in immediate account termination and potential legal action.
            </p>
          </div>
        </section>

        {/* Section 4.5: Content Disclaimer and User Liability */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10">
              <Scale className="h-4 w-4 text-amber-500" />
            </div>
            <h2 className="text-2xl font-semibold">Content Disclaimer and User Liability</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground">
              YOU ARE SOLELY RESPONSIBLE FOR ALL CONTENT YOU CREATE, UPLOAD, GENERATE, OR DISTRIBUTE USING THE SERVICE.
            </p>
            <p>
              Bermy Banana is a technology platform that provides AI-powered tools. We do not create, control, endorse, or review user-generated content. You acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You are entirely responsible for any legal consequences arising from your use of the Service</li>
              <li>You are responsible for ensuring all content complies with applicable laws and regulations</li>
              <li>You are responsible for obtaining all necessary rights, licenses, and permissions for any content you use</li>
              <li>You are responsible for any claims of defamation, invasion of privacy, copyright infringement, or other legal violations</li>
              <li>Bermy Banana has no obligation to monitor, review, or approve content before it is generated</li>
              <li>Bermy Banana may remove content or terminate accounts that violate these Terms, but is not obligated to do so</li>
            </ul>
            <p className="mt-4">
              You expressly agree to defend, indemnify, and hold harmless Bermy Banana from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from or relating to your content or your use of the Service.
            </p>
          </div>
        </section>

        {/* Section 5: Intellectual Property */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10">
              <span className="text-lg font-bold text-orange-500">5</span>
            </div>
            <h2 className="text-2xl font-semibold">5. Intellectual Property Rights</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <h3 className="text-lg font-medium text-foreground">Your Content</h3>
            <p>
              You retain all ownership rights to the content you upload to the Service. By uploading content, you grant Bermy Banana a limited license to process and use such content solely for the purpose of providing the Service to you.
            </p>
            <h3 className="text-lg font-medium text-foreground mt-4">Generated Content</h3>
            <p>
              Subject to your compliance with these Terms and applicable law, you are granted a worldwide, royalty-free license to use the AI-generated content produced through the Service for your personal or commercial purposes. This license does not transfer ownership of any underlying AI models or technology.
            </p>
            <h3 className="text-lg font-medium text-foreground mt-4">Our Intellectual Property</h3>
            <p>
              Bermy Banana retains all rights, title, and interest in and to the Service, including all software, algorithms, trademarks, logos, and proprietary technology. You may not copy, modify, distribute, or create derivative works based on our Service without explicit written permission.
            </p>
            <h3 className="text-lg font-medium text-foreground mt-4">Likeness Rights and Impersonation</h3>
            <p>
              You are solely responsible for ensuring you have all necessary rights, permissions, and consents to use any person's likeness, image, or identity in connection with the Service. This includes but is not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Celebrities, public figures, and influencers</li>
              <li>Private individuals and their likenesses</li>
              <li>Trademarked characters or personas</li>
              <li>Any person identifiable through generated content</li>
            </ul>
            <p className="mt-4 font-medium text-foreground">
              YOU ASSUME FULL LEGAL RESPONSIBILITY for any claims, damages, or liabilities arising from your use of another person's likeness or identity. Bermy Banana is a neutral technology platform and disclaims all liability for user-generated content that infringes on publicity rights, privacy rights, or constitutes unauthorized impersonation.
            </p>
          </div>
        </section>

        {/* Section 6: Payment and Billing */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10">
              <span className="text-lg font-bold text-cyan-500">6</span>
            </div>
            <h2 className="text-2xl font-semibold">6. Payment and Billing</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Certain features of the Service require payment. By subscribing to paid features:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You agree to pay all fees associated with your selected plan</li>
              <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
              <li>Refunds are provided in accordance with our refund policy</li>
              <li>Prices are subject to change with 30 days notice</li>
              <li>You are responsible for all taxes applicable to your use of the Service</li>
            </ul>
          </div>
        </section>

        {/* Section 7: Termination */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold">7. Termination</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              You may terminate your account at any time by contacting support or using the account deletion feature in your settings. Upon termination:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your access to the Service will be immediately revoked</li>
              <li>Any pending generations may be cancelled</li>
              <li>Pro-rated refunds may be issued at our discretion</li>
              <li>We may retain certain data as required by law or for legitimate business purposes</li>
            </ul>
            <p className="mt-4">
              We reserve the right to suspend or terminate your account without prior notice if you violate these Terms or engage in prohibited activities.
            </p>
          </div>
        </section>

        {/* Section 8: Limitation of Liability */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10">
              <Scale className="h-4 w-4 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-semibold">8. Limitation of Liability</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              To the maximum extent permitted by applicable law:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The Service is provided "as is" and "as available" without warranties of any kind</li>
              <li>We do not guarantee uninterrupted, timely, secure, or error-free service</li>
              <li>We are not responsible for content generated by users or AI systems</li>
              <li>Our total liability shall not exceed the amount you paid to us in the 12 months preceding the claim</li>
              <li>We are not liable for indirect, incidental, special, consequential, or punitive damages</li>
              <li>We are not responsible for the accuracy or appropriateness of AI-generated content</li>
            </ul>
          </div>
        </section>

        {/* Section 9: Indemnification */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10">
              <span className="text-lg font-bold text-indigo-500">9</span>
            </div>
            <h2 className="text-2xl font-semibold">9. Indemnification</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              You agree to indemnify, defend, and hold harmless Bermy Banana and its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, or expenses arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your use of and access to the Service</li>
              <li>Your violation of any term of these Terms</li>
              <li>Your violation of any third-party right, including intellectual property rights</li>
              <li>Any content you generate, upload, or distribute through the Service</li>
              <li>Any claim that your use of the Service caused damage to a third party</li>
            </ul>
          </div>
        </section>

        {/* Section 10: Governing Law */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-500/10">
              <span className="text-lg font-bold text-pink-500">10</span>
            </div>
            <h2 className="text-2xl font-semibold">10. Governing Law and Dispute Resolution</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any dispute arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
            </p>
          </div>
        </section>

        {/* Section 11: Changes to Terms */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/10">
              <span className="text-lg font-bold text-teal-500">11</span>
            </div>
            <h2 className="text-2xl font-semibold">11. Changes to These Terms</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on our website and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
            </p>
          </div>
        </section>

        {/* Section 12: Contact */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-500/10">
              <span className="text-lg font-bold text-gray-500">12</span>
            </div>
            <h2 className="text-2xl font-semibold">12. Contact Information</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="p-4 bg-muted rounded-lg mt-4">
              <p className="font-medium text-foreground">Bermy Banana</p>
              <p>Email: legal@bermybanana.com</p>
              <p>Address: 123 Innovation Drive, Suite 100, Wilmington, DE 19801</p>
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Footer Note */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By using Bermy Banana, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </main>
  );
}

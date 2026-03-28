import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[72px]">
        <div className="container mx-auto px-6 py-16 max-w-3xl prose prose-slate">
          <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: March 18, 2026</p>

          <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">SnapLoad does not require user registration. We may collect anonymous usage data such as page visits and download counts to improve our service. We do not collect personal information.</p>

          <h2 className="text-xl font-semibold mt-8 mb-3">2. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">We use essential cookies for site functionality and analytics cookies to understand usage patterns. Third-party advertising partners may also use cookies.</p>

          <h2 className="text-xl font-semibold mt-8 mb-3">3. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">We use Google reCAPTCHA to prevent abuse. Google's privacy policy applies to data collected by reCAPTCHA. We also display third-party advertisements.</p>

          <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">We implement appropriate security measures to protect any data we process. Downloaded files are processed in real-time and are not stored on our servers.</p>

          <h2 className="text-xl font-semibold mt-8 mb-3">5. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">For privacy concerns, contact us at support@snapload.com.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[72px]">
        <div className="container mx-auto px-6 py-16 max-w-3xl prose prose-slate">
          <h1 className="text-4xl font-extrabold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: March 18, 2026</p>

          <h2 className="text-xl font-semibold mt-8 mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">By using SnapLoad, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>

          <h2 className="text-xl font-semibold mt-8 mb-3">2. Service Description</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">SnapLoad provides a free video downloading service. We do not host any video content. We merely facilitate downloading from publicly available sources.</p>

          <h2 className="text-xl font-semibold mt-8 mb-3">3. User Responsibilities</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">You are responsible for ensuring that your use of SnapLoad complies with applicable laws and the terms of service of the platforms from which you download content.</p>

          <h2 className="text-xl font-semibold mt-8 mb-3">4. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">SnapLoad respects intellectual property rights. Downloaded content remains the property of its original creators. Do not use downloaded content for commercial purposes without permission.</p>

          <h2 className="text-xl font-semibold mt-8 mb-3">5. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">SnapLoad is provided "as is" without warranties. We are not liable for any damages arising from the use of our service.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

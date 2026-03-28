import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Is SnapLoad really free?", a: "Yes, 100% free. No hidden fees, no premium tiers, no credit card required. We support our service through non-intrusive advertisements." },
  { q: "Do I need to create an account?", a: "No. SnapLoad requires no registration or login. Just paste a link and download." },
  { q: "What video quality can I download?", a: "We support up to 4K (2160p) resolution depending on the source video. You can choose your preferred quality before downloading." },
  { q: "Is it legal to download videos?", a: "Downloading videos for personal use is generally acceptable. However, you should respect copyright laws and the terms of service of the platforms you download from." },
  { q: "Which platforms are supported?", a: "We officially support downloading high-quality videos/audio directly from YouTube and Instagram." },
  { q: "Can I download audio only?", a: "Yes! We support MP3 and M4A audio extraction from any video. Just select the Audio tab on the download page." },
];

export function HomeFaq() {
  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-4">Frequently Asked Questions</h2>
        <p className="text-center text-muted-foreground mb-12">
          Everything you need to know about SnapLoad.
        </p>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-background rounded-xl border border-border px-6"
            >
              <AccordionTrigger className="text-left font-medium py-5 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

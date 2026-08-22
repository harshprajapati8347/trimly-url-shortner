import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageContainer } from "@/components/layout/page-container";
import { ShortenHero } from "@/components/marketing/shorten-hero";
import { getCurrentUser } from "@/lib/auth";

const faqs = [
  {
    question: "How does the Trimly URL shortener work?",
    answer:
      "When you enter a long URL, our system generates a shorter version of that URL. This shortened URL redirects to the original long URL when accessed, instantly capturing analytics.",
  },
  {
    question: "Do I need an account to use the app?",
    answer:
      "No! We offer a Guest Session allowing you to create basic short links. However, creating a free account ensures your links and analytics are securely saved across devices.",
  },
  {
    question: "What analytics are available for my shortened URLs?",
    answer:
      "You can track total clicks, view geographic click sources, and filter engagement by device types (mobile vs. desktop) right from your dashboard.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <PageContainer className="flex flex-col items-center pt-20 pb-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
          Smart URL Shortening with{" "}
          <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
            Built-in Analytics
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
          Trimly replaces long, bulky links with short, trackable URLs. Optimize
          your reach, view location data, and scale your brand effortlessly.
        </p>
      </div>

      <ShortenHero isAuthed={!!user} />

      <div className="relative mx-auto mt-28 mb-20 max-w-6xl px-4">
        <div className="rounded-2xl border bg-background shadow-xl overflow-hidden">
          <div className="text-center px-6 pt-10 pb-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              How Trimly Works
            </h2>
            <p className="mt-3 text-muted-foreground text-sm md:text-base">
              Shorten links instantly and track performance with built-in
              analytics.
            </p>
          </div>
          <div className="px-4 pb-6">
            <Image
              src="/banner.png"
              alt="Trimly analytics dashboard preview"
              width={1200}
              height={700}
              className="w-full rounded-lg border object-cover shadow-md"
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </PageContainer>
  );
}

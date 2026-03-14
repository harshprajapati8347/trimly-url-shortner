import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/page-container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UrlState } from "@/context";
import { LinkIcon } from "lucide-react";

const LandingPage = () => {
  const [longUrl, setLongUrl] = useState("");
  const navigate = useNavigate();
  const { isGuest, isAuthenticated } = UrlState();

  const handleShorten = (e) => {
    e.preventDefault();
    if (longUrl) {
      if (isAuthenticated || isGuest) {
        navigate(`/dashboard?createNew=${longUrl}`);
      } else {
        navigate(`/auth?createNew=${longUrl}`);
      }
    }
  };

  const faqsData = [
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

      <form
        onSubmit={handleShorten}
        className="mt-10 flex flex-col items-center w-full gap-2"
      >
        <div className="sm:h-14 flex flex-col sm:flex-row w-full md:w-2/3 lg:w-1/2 gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="url"
              required
              placeholder="Enter your long URL here..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              className="h-full w-full pl-10 py-4 text-base rounded-full border-muted-foreground/30 focus-visible:ring-primary/50"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-10 sm:h-full rounded-full shrink-0 text-base"
            variant="default"
          >
            Shorten Now!
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          By creating a short link you agree to our{" "}
          <a href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/terms" className="underline hover:text-primary">
            Terms
          </a>
          .
        </p>
      </form>

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
            <img
              src="/banner.png"
              alt="Trimly analytics dashboard preview"
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
          {faqsData.map((faq, index) => (
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
};

export default LandingPage;

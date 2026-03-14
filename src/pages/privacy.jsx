import { PageContainer } from "@/components/layout/page-container";

const PrivacyPage = () => {
  return (
    <PageContainer className="py-16 max-w-4xl">
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight">
        Privacy Policy
      </h1>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Analytics Data Collection
          </h2>
          <p>
            Trimly is designed to provide insightful link analytics. When users
            click on shortened URLs, we collect limited data to generate these
            analytics. This information includes approximate location (derived
            from IP addresses), device and browser types, and click timestamps.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Data Storage & Usage
          </h2>
          <p>
            The limited analytics data collected is securely stored through our
            Supabase backend. It is purely used to display link performance
            metrics to the creator of the shortened URL. We do not sell, rent,
            or distribute this data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Cookies & Local Storage
          </h2>
          <p>
            We use local storage and essential cookies to manage your
            preferences (like theme selection and cookie consent) and to handle
            "Guest" session capabilities smoothly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Your Rights
          </h2>
          <p>
            You have the right to request deletion of your account and its
            associated links. You can delete your shortened links anytime
            directly from your dashboard, which also purges the associated click
            analytic data.
          </p>
        </section>
      </div>
    </PageContainer>
  );
};

export default PrivacyPage;

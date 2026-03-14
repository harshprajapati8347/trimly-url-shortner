import { PageContainer } from "@/components/layout/page-container";

const TermsPage = () => {
  return (
    <PageContainer className="py-16 max-w-4xl">
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight">
        Terms of Service
      </h1>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Acceptable Use
          </h2>
          <p>
            You agree to use Trimly solely for creating functional shortened
            URLs. Do not shorten URLs that point to malware, phishing attempts,
            spam, or explicit illegal content. Doing so will result in immediate
            link or account termination.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Service Reliability
          </h2>
          <p>
            Trimly is an open-source tool and is provided &quot;as-is&quot;
            without any warranties or guarantees of 100% uptime. We reserve the
            right to modify, suspend, or discontinue the service without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            No Affiliation
          </h2>
          <p>
            We are not responsible for the content of the expanded destinations
            to which shortened URLs direct you. Clicking a Trimly link implies
            clicking an untrusted user-generated path.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Limitation of Liability
          </h2>
          <p>
            Under no external circumstances shell Trimly or its maintainers be
            held liable for indirect, incidental, or consequential damages
            arising via the use of our generated URLs or the inability to
            utilize the platform services.
          </p>
        </section>
      </div>
    </PageContainer>
  );
};

export default TermsPage;

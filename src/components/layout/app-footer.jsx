import { PageContainer } from "./page-container";
import { Link } from "react-router-dom";

export const AppFooter = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-6 md:py-8 mt-10">
      <PageContainer>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Made with ❤️ by{" "}
            <a
              href="https://iamharsh.in"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
            >
              Harsh Prajapati
            </a>
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link
              to="/privacy"
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              Terms
            </Link>
            <a
              href="https://github.com/harshprajapati8347/Trimly-URL-Shortner"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              GitHub
            </a>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
};

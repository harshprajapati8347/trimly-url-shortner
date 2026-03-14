import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  actionOnClick,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center animate-in fade-in-50",
        className
      )}
    >
      {Icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {(actionText && actionHref) || actionOnClick ? (
        actionHref ? (
          <Link to={actionHref}>
            <Button size="sm">{actionText}</Button>
          </Link>
        ) : (
          <Button size="sm" onClick={actionOnClick}>
            {actionText}
          </Button>
        )
      ) : null}
    </div>
  );
};

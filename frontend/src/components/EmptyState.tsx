import { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <div className="surface-card flex min-h-[240px] flex-col items-center justify-center px-6 py-12 text-center">
      <h3 className="text-2xl font-bold text-espresso">{title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-stone">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
};

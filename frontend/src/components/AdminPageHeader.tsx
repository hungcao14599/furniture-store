import { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export const AdminPageHeader = ({
  eyebrow = "Khu vực quản trị",
  title,
  description,
  actions,
}: AdminPageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-4 text-[34px] font-bold tracking-[-0.04em] text-espresso sm:text-[42px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-sm leading-7 text-stone sm:text-[15px]">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
};

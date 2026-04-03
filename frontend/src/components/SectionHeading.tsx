type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  titleVariant?: "display" | "sans";
};

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "left",
  titleVariant = "display",
}: SectionHeadingProps) => {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2
        className={
          titleVariant === "sans"
            ? "mt-4 font-sans text-4xl font-bold tracking-[-0.03em] text-espresso md:text-5xl"
            : "section-title mt-4"
        }
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-7 text-stone md:text-base">{description}</p>
      ) : null}
    </div>
  );
};

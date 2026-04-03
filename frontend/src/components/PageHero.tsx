type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export const PageHero = ({ eyebrow, title, description }: PageHeroProps) => {
  return (
    <section className="border-b border-[#ebe1d4] bg-[#f6f1e9]">
      <div className="shell py-14 sm:py-16">
        <div className="max-w-3xl">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-5 text-4xl font-bold tracking-[-0.03em] text-espresso md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-stone md:text-lg">{description}</p>
        </div>
      </div>
    </section>
  );
};

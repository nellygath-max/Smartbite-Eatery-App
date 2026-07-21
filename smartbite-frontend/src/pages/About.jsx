import aboutPageBanner from '../assets/about page banner.png';

export default function About() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="grid gap-12">
        <img
          className="w-full rounded-4xl object-cover shadow-2xl"
          src={aboutPageBanner}
          alt="SmartBite meals and chef"
        />
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-black uppercase tracking-widest text-brand-muted">
            Our story
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            Food should feel like a warm welcome.
          </h1>
          <p className="mt-6 leading-8 text-brand-muted">
            At SmartBite, we are passionate about making every 
            order worth looking forward to. Whether it's lunch at work, 
            dinner with family, or a quick bite on a busy day, 
            we prepare every meal fresh and deliver it with care.
          </p>
          <p className="mt-4 leading-8 text-brand-muted">
            Because great food is not just about eating. it is 
            about creating moments you will want to enjoy again and again.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <b className="block text-2xl text-brand-secondary">20+</b>
              <span className="text-xs text-brand-muted">Signature Dishes</span>
            </div>
            <div>
              <b className="block text-2xl text-brand-secondary">10,000+</b>
              <span className="text-xs text-brand-muted">Happy Customers</span>
            </div>
            <div>
              <b className="block text-2xl text-brand-secondary">Daily</b>
              <span className="text-xs text-brand-muted">Fresh Ingredients Every Day</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

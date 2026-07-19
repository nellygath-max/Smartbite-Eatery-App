export default function About() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <img
          className="h-[32rem] w-full rounded-[2rem] object-cover shadow-2xl"
          src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=85"
          alt="Warm restaurant interior"
        />
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-orange-600">
            Our story
          </p>
          <h1 className="mt-3 text-5xl font-black leading-tight">
            Food should feel like a warm welcome.
          </h1>
          <p className="mt-6 leading-8 text-stone-600">
            SmartBite began with a simple belief: convenient food can still be
            full of care. We pair familiar flavours with fresh ingredients, so
            every plate feels made just for you.
          </p>
          <p className="mt-4 leading-8 text-stone-600">
            From our kitchen in Lagos to your table, we cook with curiosity,
            generosity, and a little bit of joy.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <b className="block text-2xl text-emerald-700">20+</b>
              <span className="text-xs text-stone-500">Meals</span>
            </div>
            <div>
              <b className="block text-2xl text-emerald-700">4.9★</b>
              <span className="text-xs text-stone-500">Rating</span>
            </div>
            <div>
              <b className="block text-2xl text-emerald-700">Daily</b>
              <span className="text-xs text-stone-500">Freshness</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

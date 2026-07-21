import { useState, useEffect } from 'react';
import heroBanner1 from '../assets/Hero banner 1.png';
import heroBanner2 from '../assets/Hero banner 2.png';
import heroBanner3 from '../assets/Hero banner 3.png';
import './HeroBanner.css';

export default function HeroBanner() {
  const [currentHero, setCurrentHero] = useState(0);
  const heroBanners = [heroBanner1, heroBanner2, heroBanner3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroBanners.length);
    }, 5000); // Change hero every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-banner overflow-hidden text-white">
      <div className="hero-carousel-container">
        {heroBanners.map((banner, index) => (
          <div
            key={index}
            className={`hero-slide ${
              index === currentHero ? 'hero-slide-active' : 'hero-slide-inactive'
            }`}
            style={{
              backgroundImage: `url(${banner})`,
            }}
          >
            <div className="hero-overlay"></div>
          </div>
        ))}
        <div className="hero-indicators">
          {heroBanners.map((_, index) => (
            <button
              key={index}
              className={`hero-indicator ${index === currentHero ? 'active' : ''}`}
              onClick={() => setCurrentHero(index)}
              aria-label={`Go to hero ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}

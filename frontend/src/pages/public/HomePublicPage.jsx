import React from 'react';
import HeroSection from '../../components/public/HeroSection.jsx';
import PublicQuoteCard from '../../components/public/PublicQuoteCard.jsx';
import TrackingCard from '../../components/public/TrackingCard.jsx';

function HomePublicPage() {
  return (
    <>
      <HeroSection />
      <section className="bg-white px-5 py-8 sm:px-8 lg:px-16">
        <div className="mx-auto grid max-w-[1840px] gap-10 min-[1700px]:grid-cols-[minmax(0,1.55fr)_minmax(420px,0.9fr)] min-[1700px]:items-start">
          <PublicQuoteCard />
          <div id="contacto" className="min-w-0">
            <TrackingCard />
          </div>
        </div>
        <div id="nosotros" className="sr-only">Carmencita Express Cargo</div>
      </section>
    </>
  );
}

export default HomePublicPage;

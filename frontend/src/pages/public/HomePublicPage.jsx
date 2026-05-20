import React from 'react';
import HeroSection from '../../components/public/HeroSection.jsx';
import PublicQuoteCard from '../../components/public/PublicQuoteCard.jsx';
import TrackingCard from '../../components/public/TrackingCard.jsx';

function HomePublicPage() {
  return (
    <>
      <HeroSection />
      <section className="bg-white py-8 lg:py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-4 sm:px-6 lg:px-8 min-[1400px]:grid-cols-[minmax(0,1.7fr)_minmax(360px,0.9fr)]">
          <PublicQuoteCard />
          <div id="contacto" className="min-w-0 w-full">
            <TrackingCard />
          </div>
        </div>
        <div id="nosotros" className="sr-only">Carmencita Express Cargo</div>
      </section>
    </>
  );
}

export default HomePublicPage;

import React from 'react';
import HeroSection from '../../components/public/HeroSection.jsx';
import PublicQuoteCard from '../../components/public/PublicQuoteCard.jsx';
import TrackingCard from '../../components/public/TrackingCard.jsx';
import HomeSections from '../../components/public/HomeSections.jsx';

function HomePublicPage() {
  return (
    <>
      <HeroSection />
      <section className="bg-[#F8F9FA] py-10 lg:py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-4 sm:px-6 lg:px-8 min-[1400px]:grid-cols-[minmax(0,1.7fr)_minmax(360px,0.9fr)]">
          <PublicQuoteCard />
          <div className="min-w-0 w-full">
            <TrackingCard />
          </div>
        </div>
      </section>
      <HomeSections />
    </>
  );
}

export default HomePublicPage;

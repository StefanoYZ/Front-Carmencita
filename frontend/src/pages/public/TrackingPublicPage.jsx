import React from 'react';
import { useParams } from 'react-router-dom';
import TrackingCard from '../../components/public/TrackingCard.jsx';

function TrackingPublicPage() {
  const { codigo } = useParams();

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <TrackingCard initialCode={codigo || ''} />
      </div>
    </section>
  );
}

export default TrackingPublicPage;

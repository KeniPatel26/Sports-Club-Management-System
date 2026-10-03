import React from 'react';
import { Hero } from '../components/landing/Hero';
import { Stats } from '../components/landing/Stats';
import { Features } from '../components/landing/Features';
import { DashboardPreview } from '../components/landing/DashboardPreview';
import { ArchitectureGuide } from '../components/landing/ArchitectureGuide';
import { Testimonials } from '../components/landing/Testimonials';
import { CtaBanner } from '../components/landing/CtaBanner';

export const LandingPage = () => {
  return (
    <main>
      <Hero />
      <Stats />
      <Features />
      <DashboardPreview />
      <ArchitectureGuide />
      <Testimonials />
      <CtaBanner />
    </main>
  );
};

export default LandingPage;

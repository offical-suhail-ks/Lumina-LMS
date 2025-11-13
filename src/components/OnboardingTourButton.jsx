import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { featureFlagService } from '../services/featureFlagService';

const OnboardingTourButton = ({ onLaunchTour }) => {
  const user = useSelector(state => state.auth.user);
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFeatureFlag();
  }, []);

  const checkFeatureFlag = async () => {
    try {
      const enabled = await featureFlagService.isFeatureEnabled('onboarding_tour', user?.role);
      setIsEnabled(enabled);
    } catch (error) {
      console.error('Error checking feature flag:', error);
      // Default to enabled if check fails
      setIsEnabled(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isEnabled) {
    return null;
  }

  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
      <p className="mb-2 text-sm font-semibold text-white">Need a tour?</p>
      <p className="text-xs text-white/60">
        Explore interactive walkthroughs tailored for your role and get the best out of Lumina LMS.
      </p>
      <button
        type="button"
        onClick={onLaunchTour}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/25 w-full"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Launch onboarding
      </button>
    </div>
  );
};

export default OnboardingTourButton;


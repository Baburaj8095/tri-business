import React from 'react';
import CaptainProfile from './CaptainProfile';

/**
 * CaptainKyc Screen:
 * Automatically opens the modern Bottom Navigation Drawer for KYC verification
 * on top of the world-class Captain Profile backdrop.
 */
export default function CaptainKyc() {
  return <CaptainProfile autoOpenKyc={true} />;
}

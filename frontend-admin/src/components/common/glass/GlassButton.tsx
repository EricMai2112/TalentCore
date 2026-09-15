'use client';

import React from 'react';
import CustomButton, { CustomButtonProps } from '../CustomButton';

export interface GlassButtonProps extends CustomButtonProps {}

export default function GlassButton(props: GlassButtonProps) {
  return <CustomButton {...props} />;
}

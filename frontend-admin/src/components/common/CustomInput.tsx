"use client";

import React, { forwardRef } from "react";
import GlassInput, { GlassInputProps } from "./glass/GlassInput";

export interface CustomInputProps extends GlassInputProps {}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>((props, ref) => {
  return <GlassInput ref={ref} {...props} />;
});

CustomInput.displayName = "CustomInput";

export default CustomInput;

"use client";

import CountUp from "react-countup";

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <CountUp
      end={value}
      duration={1.8}
      separator=","
      decimals={0}
      prefix={prefix}
      suffix={suffix}
    />
  );
}
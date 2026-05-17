import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export const CatAnimation = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <DotLottieReact
        src="https://lottie.host/93823057-3846-40fb-8eda-7096ffa58195/CAkwvVz8e7.lottie"
        loop
        autoplay
        className="w-full h-full object-contain"
      />
    </div>
  );
};

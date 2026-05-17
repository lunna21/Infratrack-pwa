import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export const AnimalFootPrint = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <DotLottieReact
        src="https://lottie.host/dd018fbf-43d3-4e5a-ad97-af2ab4d2d9eb/vdhhrg70gF.lottie"
        loop
        autoplay
        className="w-full h-full object-cover"
      />
    </div>
  );
};

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export const SuccessAnimation = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <DotLottieReact
        src="https://lottie.host/dea2f653-cf1e-453c-8369-645eb4f317f8/XdN8Bu1hR6.lottie"
        loop
        autoplay
        className="w-full h-full object-cover"
      />
    </div>
  );
};

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export const AnimalFootPrint = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <DotLottieReact
        src="/animations/footprint.lottie"
        loop
        autoplay
        className="w-full h-full object-cover"
      />
    </div>
  );
};

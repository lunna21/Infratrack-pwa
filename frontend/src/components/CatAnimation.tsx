import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export const CatAnimation = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <DotLottieReact
        src="/animations/cat.lottie"
        loop
        autoplay
        className="w-full h-full object-contain"
      />
    </div>
  );
};

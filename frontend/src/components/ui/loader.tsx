import React from "react";

export type LoaderProps = {
  size?: number;
  color?: string;
  className?: string;
  label?: string;
};

const Loader: React.FC<LoaderProps> = ({
  size = 120,
  color = "black",
  className = "",
  label = "Đang tải",
}) => {
  return (
    <div
      className={`flex items-center justify-center w-full h-full ${className}`}
      role="status"
      aria-label={label}
      style={{ color }}
    >
      <div style={{ width: size, height: size }} className="relative">
        <div className="absolute animate-[speeder_0.4s_linear_infinite]" style={{ top: "50%", left: "50%", transform: 'translate(-50%, -50%)' }}>
        <span className="absolute top-[-19px] left-[60px] h-[5px] w-[35px] rounded-[2px_10px_1px_0] bg-current">
          <span className="absolute h-[1px] w-[30px] bg-current animate-[fazer1_0.2s_linear_infinite]" />
          <span className="absolute top-[3px] h-[1px] w-[30px] bg-current animate-[fazer2_0.4s_linear_infinite]" />
          <span className="absolute top-[1px] h-[1px] w-[30px] bg-current animate-[fazer3_0.4s_linear_infinite]" />
          <span className="absolute top-[4px] h-[1px] w-[30px] bg-current animate-[fazer4_1s_linear_infinite]" />
        </span>
        <div className="base relative">
          <span className="absolute h-0 w-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[100px] border-r-current before:absolute before:right-[-110px] before:top-[-16px] before:h-[22px] before:w-[22px] before:rounded-full before:bg-current after:absolute after:right-[-98px] after:top-[-16px] after:h-0 after:w-0 after:border-t-0 after:border-b-[16px] after:border-b-transparent after:border-r-[55px] after:border-r-current" />
          <div className="absolute right-[-125px] top-[-15px] h-[12px] w-[20px] rotate-[-40deg] rounded-t-[20px] bg-current after:absolute after:right-[4px] after:top-[7px] after:h-[12px] after:w-[12px] after:rotate-[40deg] after:origin-center after:rounded-bl-sm after:bg-current" />
        </div>
      </div>
      </div>
      <div className="longfazers absolute inset-0 w-full h-full overflow-hidden">
        <span className="absolute top-[20%] h-[2px] w-1/5 bg-current animate-[lf_0.6s_linear_infinite_-5s]" />
        <span className="absolute top-[40%] h-[2px] w-1/5 bg-current animate-[lf2_0.8s_linear_infinite_-1s]" />
        <span className="absolute top-[60%] h-[2px] w-1/5 bg-current animate-[lf3_0.6s_linear_infinite]" />
        <span className="absolute top-[80%] h-[2px] w-1/5 bg-current animate-[lf4_0.5s_linear_infinite_-3s]" />
      </div>

      <style>{`
        @keyframes fazer1 {
          0% { left: 0; }
          100% { left: -80px; opacity: 0; }
        }
        @keyframes fazer2 {
          0% { left: 0; }
          100% { left: -100px; opacity: 0; }
        }
        @keyframes fazer3 {
          0% { left: 0; }
          100% { left: -50px; opacity: 0; }
        }
        @keyframes fazer4 {
          0% { left: 0; }
          100% { left: -150px; opacity: 0; }
        }
        @keyframes speeder {
          0%   { transform: translate(2px, 1px) rotate(0deg); }
          10%  { transform: translate(-1px, -3px) rotate(-1deg); }
          20%  { transform: translate(-2px, 0px) rotate(1deg); }
          30%  { transform: translate(1px, 2px) rotate(0deg); }
          40%  { transform: translate(1px, -1px) rotate(1deg); }
          50%  { transform: translate(-1px, 3px) rotate(-1deg); }
          60%  { transform: translate(-1px, 1px) rotate(0deg); }
          70%  { transform: translate(3px, 1px) rotate(-1deg); }
          80%  { transform: translate(-2px, -1px) rotate(1deg); }
          90%  { transform: translate(2px, 1px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @keyframes lf {
          0% { left: 200%; }
          100% { left: -200%; opacity: 0; }
        }
        @keyframes lf2 {
          0% { left: 200%; }
          100% { left: -200%; opacity: 0; }
        }
        @keyframes lf3 {
          0% { left: 200%; }
          100% { left: -100%; opacity: 0; }
        }
        @keyframes lf4 {
          0% { left: 200%; }
          100% { left: -100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Loader;

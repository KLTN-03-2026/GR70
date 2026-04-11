import React from "react";
import llogo from "../../assets/Logo.svg";

const Loading = ({
    fullScreen = true,
    text
}) => {
    return (
        <div
            className={`flex flex-col items-center justify-center gap-4
            ${fullScreen ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50" : "py-16"}`}
        >
            <div className="relative flex items-center justify-center">
                {/* Spinner mịn kiểu lá */}
                <div className="relative w-20 h-20 animate-spin">
                    <div
                        className="w-full h-full rounded-full"
                        style={{
                            background:
                                "conic-gradient(from 0deg, transparent, #10BC5D, transparent)",
                            WebkitMask:
                                "radial-gradient(farthest-side, transparent calc(100% - 6px), black 0)",
                            mask:
                                "radial-gradient(farthest-side, transparent calc(100% - 6px), black 0)",
                        }}
                    ></div>
                </div>

                {/* Glow nhẹ */}
                <div className="absolute w-24 h-24 rounded-full bg-primary/10 blur-xl"></div>

                {/* Logo giữa */}
                {llogo && (
                    <div className="absolute w-8 h-8 flex items-center justify-center">
                        <img
                            src={llogo}
                            alt="logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                )}
            </div>

            {/* Text */}
            <span className="text-sm text-slate-500 font-medium tracking-wide">
                {text || "Đang tải..."}
            </span>
        </div>
    );
};

export default Loading;
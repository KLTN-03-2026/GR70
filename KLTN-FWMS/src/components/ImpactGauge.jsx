export const ImpactGauge = () => {
    return (
        <div className="lg:col-span-4 bg-surface-container-high rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <h6 className="text-[18px] font-bold mb-6 uppercase tracking-widest text-on-surface-variant">
                Tỉ lệ Điều hướng Lãng phí
            </h6>
            <div className="relative w-48 h-48 rounded-full border-8 border-surface-container-lowest flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-primary/10" />
                <div className="absolute bottom-0 left-0 right-0 liquid-gauge h-[78%] transition-all duration-1000" />
                <span className="relative text-[45px] font-bold text-on-surface">
                    78<span className="text-2xl">%</span>
                </span>
            </div>
            <p className="mt-6 text-on-surface-variant text-sm font-semibold max-w-[200px]">
                Hiệu quả điều hướng lãng phí toàn hệ thống so với quý trước.
            </p>
        </div>
    );
};
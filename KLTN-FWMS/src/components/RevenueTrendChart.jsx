export const RevenueTrendChart = () => {
  return (
    <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between overflow-hidden relative">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-[30px] font-semibold mb-1">Tốc độ Tăng trưởng Doanh thu</h3>
          <p className="text-on-surface-variant">Phân tích so sánh thu nhập và chi phí vận hành</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-wider">
            Trực tiếp
          </span>
          <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-bold uppercase">
            12 THÁNG
          </span>
        </div>
      </div>

      <div className="h-64 flex items-end gap-2 relative">
        {/* 12 thanh chart decorative giống HTML */}
        <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[40%] hover:bg-primary-container transition-all cursor-pointer group relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-on-surface text-on-primary text-xs px-2 py-1 rounded">
            T1
          </div>
        </div>
        <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[55%] hover:bg-primary-container transition-all cursor-pointer" />
        <div className="flex-1 bg-primary-container/30 rounded-t-lg h-[45%] hover:bg-primary-container transition-all cursor-pointer" />
        <div className="flex-1 bg-primary-container/40 rounded-t-lg h-[70%] hover:bg-primary-container transition-all cursor-pointer" />
        <div className="flex-1 bg-primary-container/50 rounded-t-lg h-[65%] hover:bg-primary-container transition-all cursor-pointer" />
        <div className="flex-1 bg-primary-container/60 rounded-t-lg h-[85%] hover:bg-primary-container transition-all cursor-pointer" />
        <div className="flex-1 bg-primary-container/50 rounded-t-lg h-[75%] hover:bg-primary-container transition-all cursor-pointer" />
        <div className="flex-1 bg-primary-container/40 rounded-t-lg h-[60%] hover:bg-primary-container transition-all cursor-pointer" />
        <div className="flex-1 bg-primary-container/30 rounded-t-lg h-[50%] hover:bg-primary-container transition-all cursor-pointer" />
        <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[40%] hover:bg-primary-container transition-all cursor-pointer" />
        <div className="flex-1 bg-primary-container/70 rounded-t-lg h-[95%] hover:bg-primary-container transition-all cursor-pointer group relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-on-primary text-xs px-2 py-1 rounded">
            Cao nhất
          </div>
        </div>
        <div className="flex-1 bg-primary-container/60 rounded-t-lg h-[80%] hover:bg-primary-container transition-all cursor-pointer" />
      </div>
    </div>
  );
};
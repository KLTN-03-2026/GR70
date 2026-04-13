export const HeroSection = () => {
  return (
    <section className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-outline-variant/20 pb-8">
      <div className="max-w-2xl">
        <h2 className="text-[45px] leading-[55px] font-bold text-on-surface mb-2">
          Hệ thống Quản trị
        </h2>
        <p className="text-lg text-on-surface-variant leading-relaxed">
          Giám sát toàn hệ thống về phân bổ tài nguyên và điều hướng dư thừa tại 48 nút phân phối đã đăng ký.
        </p>
      </div>
      <div className="text-right">
        <p className="text-[18px] font-bold text-primary mb-[-10px]">TỔNG DOANH THU HỆ THỐNG</p>
        <h1 className="text-[90px] leading-[100px] font-bold tracking-tighter text-on-surface">$2.4M</h1>
      </div>
    </section>
  );
};
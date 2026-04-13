import { useState } from "react";
import { HeroSection } from "../../components/HeroSection";
import { RevenueTrendChart } from "../../components/RevenueTrendChart";
import { ImpactGauge } from "../../components/ImpactGauge";
import { StoreListSection } from "../../components/StoreListSection";
import { StoreDetailsModal } from "../../components/StoreDetailsModal";

export const StoreManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
    
      <div className="space-y-8">
        {/* Hero */}
        <HeroSection />

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <RevenueTrendChart />
          <ImpactGauge />
          <StoreListSection onOpenModal={() => setIsModalOpen(true)} />
        </div>
      </div>

      {/* Modal */}
      <StoreDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* FAB - nút thêm */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-[0px_20px_40px_rgba(20,28,33,0.15)] flex items-center justify-center hover:scale-95 transition-all duration-150 z-50"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </>
  );
};
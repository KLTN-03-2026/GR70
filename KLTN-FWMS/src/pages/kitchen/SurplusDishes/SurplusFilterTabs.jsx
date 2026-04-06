import React from "react";
import { PlusCircle } from "lucide-react";

const SurplusFilterTabs = ({
    activeTab,
    onTabChange,
    totalAll,
    totalActive,
    totalClosed,
    onAddNew,
}) => {
    return (
        <>
            <div className="flex gap-3 mb-5 border-b border-gray-200">
                <button
                    onClick={() => onTabChange("all")}
                    className={`px-5 py-2.5 text-sm font-medium transition-all ${
                        activeTab === "all"
                            ? "text-[#10bc5d] border-b-2 border-[#10bc5d]"
                            : "text-[#8b8b8b] hover:text-[#3d3d3d]"
                    }`}
                >
                    Tất cả ({totalAll})
                </button>
            </div>
        </>
    );
};

export default SurplusFilterTabs;

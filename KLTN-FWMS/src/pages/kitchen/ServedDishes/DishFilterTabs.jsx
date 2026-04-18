import React from "react";
import { PlusCircle } from "lucide-react";

const DishFilterTabs = ({
    activeTab,
    onTabChange,
    totalAll,
    totalActive,
    totalClosed,
    onAddNew,
}) => {
    return (
        <>
            <div className="flex gap-3 mb-0 border-b border-gray-200">
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

            <div className="mt-2">
                <button
                    onClick={onAddNew}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#10bc5d] text-white rounded-lg hover:bg-[#0c9c4a] text-sm font-medium mb-2"
                >
                    <PlusCircle size={18} />
                    <span>Thêm món ra</span>
                </button>
            </div>
        </>
    );
};

export default DishFilterTabs;

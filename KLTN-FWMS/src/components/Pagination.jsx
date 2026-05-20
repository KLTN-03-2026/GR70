import React from "react";

export default function Pagination({
    page,
    totalPages,
    total,
    limit,
    onPageChange
}) {
    if (totalPages <= 1 || total === 0) return null;

    const getPages = () => {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p =>
                p === 1 ||
                p === totalPages ||
                Math.abs(p - page) <= 1
            )
            .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
            }, []);
    };

    return (
        <div className="px-6 py-4 bg-slate-50 border-t flex justify-between items-center">

            {/* TEXT */}
            <span className="text-sm text-slate-500">
                Hiển thị {(page - 1) * limit + 1}–
                {Math.min(page * limit, total)} / {total}
            </span>

            {/* PAGINATION */}
            <div className="flex items-center gap-1">

                <button
                    onClick={() => onPageChange(1)}
                    disabled={page === 1}
                    className="px-2 py-1 border rounded disabled:opacity-30"
                >
                    «
                </button>

                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-2 py-1 border rounded disabled:opacity-30"
                >
                    ‹
                </button>

                {getPages().map((p, idx) =>
                    p === "..." ? (
                        <span key={idx} className="px-2 text-slate-400">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`px-3 py-1 rounded text-sm font-semibold transition
                            ${page === p
                                    ? "bg-primary text-white"
                                    : "border hover:bg-slate-100"
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-2 py-1 border rounded disabled:opacity-30"
                >
                    ›
                </button>

                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={page === totalPages}
                    className="px-2 py-1 border rounded disabled:opacity-30"
                >
                    »
                </button>
            </div>
        </div>
    );
}
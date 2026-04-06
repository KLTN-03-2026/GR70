import React from 'react'

export const AdminDashboard = () => {
    return (
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-text-1 dark:text-slate-100 tracking-tight">System Statistics</h2>
                    <p className="text-text-3">Real-time data-driven insights for waste management and operational efficiency.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-text-4/30 px-4 py-2 rounded-xl text-text-2 dark:text-slate-100 text-sm font-bold shadow-sm">
                            <span className="material-symbols-outlined text-primary">download</span>
                            Export Data
                            <span className="material-symbols-outlined">keyboard_arrow_down</span>
                        </button>
                        {/* Dropdown Mockup (Floating) */}
                        <div className="hidden absolute right-0 top-12 w-56 bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-text-4/20 py-2 z-10">
                            <button className="w-full text-left px-4 py-2 text-sm text-text-2 hover:bg-primary/10 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">file_download</span> Waste Report (.xlsx)
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-text-2 hover:bg-primary/10 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">bar_chart</span> Store Ranking (.xlsx)
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-text-2 hover:bg-primary/10 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">savings</span> Financial Impact (.csv)
                            </button>
                        </div>
                    </div>
                    <button className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:brightness-110 transition-all">
                        Refresh Stats
                    </button>
                </div>
            </header>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-text-4/20 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-primary">recycling</span>
                        </div>
                        <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-full">+4.2%</span>
                    </div>
                    <p className="text-text-3 text-xs font-bold uppercase tracking-wider mb-1">Total Waste Collected</p>
                    <h3 className="text-2xl font-bold text-text-1 dark:text-slate-100">42,850 kg</h3>
                    <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-[75%]" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-text-4/20 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-blue-500">speed</span>
                        </div>
                        <span className="text-blue-500 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded-full">+2.1%</span>
                    </div>
                    <p className="text-text-3 text-xs font-bold uppercase tracking-wider mb-1">Operational Efficiency</p>
                    <h3 className="text-2xl font-bold text-text-1 dark:text-slate-100">94.2%</h3>
                    <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[94%]" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-text-4/20 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-primary">monetization_on</span>
                        </div>
                        <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-full">+12.5%</span>
                    </div>
                    <p className="text-text-3 text-xs font-bold uppercase tracking-wider mb-1">Monthly Savings</p>
                    <h3 className="text-2xl font-bold text-text-1 dark:text-slate-100">$12,400.00</h3>
                    <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-[60%]" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-text-4/20 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-amber-500/10 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-amber-500">warning</span>
                        </div>
                        <span className="text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-full">-5.2%</span>
                    </div>
                    <p className="text-text-3 text-xs font-bold uppercase tracking-wider mb-1">Waste Diverted</p>
                    <h3 className="text-2xl font-bold text-text-1 dark:text-slate-100">18,200 kg</h3>
                    <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-[45%]" />
                    </div>
                </div>
            </div>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Efficiency Trends - Line Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-text-4/20 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold text-text-1 dark:text-slate-100">Efficiency Trends</h4>
                        <select className="bg-transparent border-none text-text-3 text-sm focus:ring-0 cursor-pointer">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last Quarter</option>
                        </select>
                    </div>
                    <div className="flex-1 min-h-[300px] flex flex-col justify-between">
                        <div className="relative w-full h-[250px] mt-4">
                            <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1000 250">
                                <path d="M0 200C100 180 200 220 300 150C400 80 500 120 600 90C700 60 800 110 900 40C950 20 1000 50 1000 50V250H0V200Z" fill="url(#gradient-green)" />
                                <path d="M0 200C100 180 200 220 300 150C400 80 500 120 600 90C700 60 800 110 900 40C950 20 1000 50 1000 50" stroke="#10BC5D" strokeLinecap="round" strokeWidth={4} />
                                <defs>
                                    <linearGradient id="gradient-green" x1={0} x2={0} y1={0} y2={1}>
                                        <stop offset="0%" stopColor="#10BC5D" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#10BC5D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                {/* Grid Lines */}
                                <line stroke="#D1D1D1" strokeDasharray="4 4" strokeOpacity="0.3" x1={0} x2={1000} y1={50} y2={50} />
                                <line stroke="#D1D1D1" strokeDasharray="4 4" strokeOpacity="0.3" x1={0} x2={1000} y1={100} y2={100} />
                                <line stroke="#D1D1D1" strokeDasharray="4 4" strokeOpacity="0.3" x1={0} x2={1000} y1={150} y2={150} />
                                <line stroke="#D1D1D1" strokeDasharray="4 4" strokeOpacity="0.3" x1={0} x2={1000} y1={200} y2={200} />
                            </svg>
                        </div>
                        <div className="flex justify-between px-2 pt-4 border-t border-text-4/10">
                            <span className="text-text-3 text-xs font-bold uppercase">Mon</span>
                            <span className="text-text-3 text-xs font-bold uppercase">Tue</span>
                            <span className="text-text-3 text-xs font-bold uppercase">Wed</span>
                            <span className="text-text-3 text-xs font-bold uppercase">Thu</span>
                            <span className="text-text-3 text-xs font-bold uppercase">Fri</span>
                            <span className="text-text-3 text-xs font-bold uppercase">Sat</span>
                            <span className="text-text-3 text-xs font-bold uppercase">Sun</span>
                        </div>
                    </div>
                </div>
                {/* Waste Distribution - Pie Chart Mockup */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-text-4/20 shadow-sm">
                    <h4 className="text-lg font-bold text-text-1 dark:text-slate-100 mb-6">Waste Categories</h4>
                    <div className="relative size-48 mx-auto mb-8">
                        <svg className="size-full" viewBox="0 0 36 36">
                            <circle cx={18} cy={18} fill="none" r="15.915" stroke="#f1f5f9" strokeWidth={3} />
                            <circle cx={18} cy={18} fill="none" r="15.915" stroke="#10BC5D" strokeDasharray="60 40" strokeDashoffset={25} strokeWidth={3} />
                            <circle cx={18} cy={18} fill="none" r="15.915" stroke="#3b82f6" strokeDasharray="25 75" strokeDashoffset={85} strokeWidth={3} />
                            <circle cx={18} cy={18} fill="none" r="15.915" stroke="#f59e0b" strokeDasharray="15 85" strokeDashoffset={10} strokeWidth={3} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-text-1 dark:text-slate-100">124.5</span>
                            <span className="text-text-3 text-[10px] uppercase font-bold">Total Tons</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-primary" />
                                <span className="text-sm text-text-2 dark:text-slate-300">Organic</span>
                            </div>
                            <span className="text-sm font-bold text-text-1 dark:text-slate-100">60%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-blue-500" />
                                <span className="text-sm text-text-2 dark:text-slate-300">Plastic</span>
                            </div>
                            <span className="text-sm font-bold text-text-1 dark:text-slate-100">25%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-amber-500" />
                                <span className="text-sm text-text-2 dark:text-slate-300">Paper</span>
                            </div>
                            <span className="text-sm font-bold text-text-1 dark:text-slate-100">15%</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Top Wasteful Stores - Bar Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-text-4/20 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold text-text-1 dark:text-slate-100">Top Wasteful Stores</h4>
                        <span className="text-xs text-text-3 font-semibold">Tons / Month</span>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-2 dark:text-slate-300 font-medium">Downtown Store #402</span>
                                <span className="text-text-1 dark:text-slate-100 font-bold">12.4 Tons</span>
                            </div>
                            <div className="w-full bg-background-light dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full w-[85%] rounded-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-2 dark:text-slate-300 font-medium">Uptown Store #121</span>
                                <span className="text-text-1 dark:text-slate-100 font-bold">9.8 Tons</span>
                            </div>
                            <div className="w-full bg-background-light dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[65%] rounded-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-2 dark:text-slate-300 font-medium">Suburban Store #089</span>
                                <span className="text-text-1 dark:text-slate-100 font-bold">7.2 Tons</span>
                            </div>
                            <div className="w-full bg-background-light dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[45%] rounded-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-2 dark:text-slate-300 font-medium">Mall Store #552</span>
                                <span className="text-text-1 dark:text-slate-100 font-bold">5.6 Tons</span>
                            </div>
                            <div className="w-full bg-background-light dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[35%] rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Export Action Categories */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-text-4/20 shadow-sm">
                    <h4 className="text-lg font-bold text-text-1 dark:text-slate-100 mb-6">Quick Export Options</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button className="flex flex-col items-center justify-center p-6 bg-background-light dark:bg-slate-800 border border-text-4/10 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group">
                            <span className="material-symbols-outlined text-text-3 group-hover:text-primary text-3xl mb-3">file_copy</span>
                            <span className="text-sm font-bold text-text-1 dark:text-slate-100">Waste Report</span>
                            <span className="text-[10px] text-text-3 uppercase mt-1">Excel Format</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-6 bg-background-light dark:bg-slate-800 border border-text-4/10 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group">
                            <span className="material-symbols-outlined text-text-3 group-hover:text-primary text-3xl mb-3">leaderboard</span>
                            <span className="text-sm font-bold text-text-1 dark:text-slate-100">Store Ranking</span>
                            <span className="text-[10px] text-text-3 uppercase mt-1">Excel Format</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-6 bg-background-light dark:bg-slate-800 border border-text-4/10 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group">
                            <span className="material-symbols-outlined text-text-3 group-hover:text-primary text-3xl mb-3">account_balance_wallet</span>
                            <span className="text-sm font-bold text-text-1 dark:text-slate-100">Financial Impact</span>
                            <span className="text-[10px] text-text-3 uppercase mt-1">CSV Format</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-6 bg-background-light dark:bg-slate-800 border border-text-4/10 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group">
                            <span className="material-symbols-outlined text-text-3 group-hover:text-primary text-3xl mb-3">auto_graph</span>
                            <span className="text-sm font-bold text-text-1 dark:text-slate-100">Full Audit Log</span>
                            <span className="text-[10px] text-text-3 uppercase mt-1">PDF Export</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}

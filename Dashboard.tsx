
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Wallet, Truck, Plus, Minus, MapPin, Receipt } from 'lucide-react';

interface DashboardProps {
  totalStartingPrice: number;
  totals: {
    sumExpenses: number;
    sumDeliveries: number;
    remainingFromTotal: number;
    officeShare: number;
    profit: number;
    netTotal: number;
  };
  onAddExpense: () => void;
  onAddDelivery: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ totals, totalStartingPrice, onAddExpense, onAddDelivery }) => {
  // totals.remainingFromTotal now calculates: (StartingPrice + SumDeliveries) - SumExpenses
  const totalCashInHand = totals.remainingFromTotal;

  return (
    <div className="space-y-6 pt-2 pb-8">
      
      {/* Quick Actions - 3D Buttons Section */}
      {/* Added mt-4 to move buttons down slightly */}
      <div className="grid grid-cols-2 gap-4 px-2 mt-4">
        
        {/* Delivery Button */}
        <button 
          onClick={onAddDelivery}
          className="group relative h-28 w-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl shadow-[0_6px_0_#064e3b] active:shadow-none active:translate-y-[6px] transition-all duration-150 overflow-hidden border-t border-emerald-400"
        >
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <MapPin size={64} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
          
          {/* Button Content */}
          <div className="relative h-full flex flex-col items-center justify-center z-10 space-y-2">
            <div className="bg-emerald-800/30 p-2 rounded-xl border border-emerald-400/30 backdrop-blur-sm shadow-inner group-active:scale-90 transition-transform">
              <Plus size={24} className="text-white" strokeWidth={4} />
            </div>
            <span className="text-white font-black text-base tracking-wide drop-shadow-md">
              إضافة توصيل
            </span>
          </div>
        </button>

        {/* Expense Button */}
        <button 
          onClick={onAddExpense}
          className="group relative h-28 w-full bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 rounded-3xl shadow-[0_6px_0_#881337] active:shadow-none active:translate-y-[6px] transition-all duration-150 overflow-hidden border-t border-rose-400"
        >
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <Receipt size={64} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>

          {/* Button Content */}
          <div className="relative h-full flex flex-col items-center justify-center z-10 space-y-2">
            <div className="bg-rose-800/30 p-2 rounded-xl border border-rose-400/30 backdrop-blur-sm shadow-inner group-active:scale-90 transition-transform">
              <Minus size={24} className="text-white" strokeWidth={4} />
            </div>
            <span className="text-white font-black text-base tracking-wide drop-shadow-md">
              إضافة مصروف
            </span>
          </div>
        </button>

      </div>

      {/* Primary Result Card */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 relative overflow-hidden mt-2">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        <div className="flex items-center justify-between divide-x divide-x-reverse divide-slate-100 relative z-10">
            {/* Net Total (User's Share) */}
            <div className="flex-1 text-center pl-2">
                <p className="text-slate-400 text-[10px] mb-1 font-black uppercase tracking-wider">السعر الكلي الصافي</p>
                <p className="text-3xl font-black text-indigo-900 leading-none">
                    {totals.netTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    <span className="text-xs font-bold mr-1 text-slate-400">د.ج</span>
                </p>
            </div>

            {/* Total Cash (Box) */}
            <div className="flex-1 text-center pr-2">
                <p className="text-slate-400 text-[10px] mb-1 font-black uppercase tracking-wider">السعر الكلي</p>
                <p className="text-3xl font-black text-slate-700 leading-none">
                    {totalCashInHand.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    <span className="text-xs font-bold mr-1 text-slate-400">د.ج</span>
                </p>
            </div>
        </div>

        <div className="mt-5 flex justify-center relative z-10">
            <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl text-[11px] font-black flex items-center gap-2">
                <TrendingUp size={16} />
                الأداء المالي ممتاز
            </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Expenses Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 transform transition hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4 shadow-sm">
            <TrendingDown size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black mb-1 uppercase">المصاريف</p>
          <p className="text-xl font-black text-rose-600">{totals.sumExpenses.toLocaleString()}</p>
        </div>

        {/* Deliveries Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 transform transition hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
            <Truck size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black mb-1 uppercase">التوصيلات</p>
          <p className="text-xl font-black text-emerald-600">{totals.sumDeliveries.toLocaleString()}</p>
        </div>

        {/* Remainder Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 transform transition hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm">
            <Wallet size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black mb-1 uppercase">الباقي من الكلي</p>
          <p className="text-xl font-black text-blue-900">{totals.remainingFromTotal.toLocaleString()}</p>
        </div>

        {/* Profit Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 transform transition hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4 shadow-sm">
            <DollarSign size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black mb-1 uppercase">صافي الفائدة</p>
          <p className="text-xl font-black text-amber-600">{totals.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Distribution Detail Card */}
      <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mb-12 -mr-12"></div>
        <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
                <PieChart size={20} className="text-indigo-400" />
            </div>
            <h3 className="font-black text-lg">تحليل توزيع العوائد</h3>
        </div>
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-bold">إجمالي دخل التوصيلات</span>
                <span className="font-black text-xl">{totals.sumDeliveries.toLocaleString()} <span className="text-xs opacity-50">د.ج</span></span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex p-0.5">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '66.6%' }}></div>
                <div className="h-full bg-indigo-500 rounded-full ml-1" style={{ width: '33.4%' }}></div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">فائدتك (2/3)</span>
                    </div>
                    <p className="font-black text-amber-400">{totals.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">المكتب (1/3)</span>
                    </div>
                    <p className="font-black text-indigo-400">{totals.officeShare.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

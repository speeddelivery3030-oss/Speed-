
import React, { useState, useEffect, useMemo } from 'react';
import { Tab, Expense, Delivery, AppData, DailyHistory, BalanceTransaction } from './types';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import DeliveryList from './components/DeliveryList';
import AddModal from './components/AddModal';
import SplashScreen from './components/SplashScreen';
import { 
  LayoutDashboard, 
  Receipt, 
  Truck, 
  Settings,
  Edit3,
  Bike
} from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('delivery_calc_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration for old data structure
      return {
        totalStartingPrice: parsed.totalStartingPrice || 0,
        expenses: parsed.expenses || [],
        deliveries: parsed.deliveries || [],
        history: parsed.history || [],
        balanceHistory: parsed.balanceHistory || [] // Initialize if missing
      };
    }
    return {
      totalStartingPrice: 0,
      expenses: [],
      deliveries: [],
      history: [],
      balanceHistory: []
    };
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'delivery' | 'balance' | 'settings'>('expense');
  
  // Handle PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    });
  };
  
  // Timer for Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('delivery_calc_data', JSON.stringify(data));
  }, [data]);

  const totals = useMemo(() => {
    const sumExpenses = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const sumDeliveries = data.deliveries.reduce((acc, curr) => acc + curr.price, 0);
    
    const remainingFromTotal = (data.totalStartingPrice + sumDeliveries) - sumExpenses;
    const officeShare = sumDeliveries / 3;
    const profit = sumDeliveries - officeShare;
    const netTotal = remainingFromTotal - officeShare;

    return {
      sumExpenses,
      sumDeliveries,
      remainingFromTotal,
      officeShare,
      profit,
      netTotal
    };
  }, [data]);

  const getCurrentDateTime = () => {
    const now = new Date();
    const months = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const datePart = `${day} ${month} ${year}`;
    const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} | ${timePart}`;
  };

  // Format Date for Header
  const formattedDate = useMemo(() => {
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const months = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const dayName = days[currentTime.getDay()];
    const day = currentTime.getDate();
    const month = months[currentTime.getMonth()];
    const year = currentTime.getFullYear();
    return `${dayName}، ${day} ${month} ${year}`;
  }, [currentTime]);

  const formattedTime = useMemo(() => {
     return currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }, [currentTime]);

  const handleAddExpense = (name: string, amount: number) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      name,
      amount,
      date: getCurrentDateTime()
    };
    setData(prev => ({ ...prev, expenses: [newExpense, ...prev.expenses] }));
    setIsAddModalOpen(false);
  };

  const handleAddDelivery = (location: string, price: number) => {
    const newDelivery: Delivery = {
      id: Date.now().toString(),
      location,
      price,
      date: getCurrentDateTime()
    };
    setData(prev => ({ ...prev, deliveries: [newDelivery, ...prev.deliveries] }));
    setIsAddModalOpen(false);
  };

  const handleUpdateInitialPrice = (mode: string, amount: number) => {
    const newTransaction: BalanceTransaction = {
      id: Date.now().toString(),
      type: mode as 'set' | 'add',
      amount: amount,
      date: getCurrentDateTime()
    };

    setData(prev => {
      let newTotal = prev.totalStartingPrice;
      let newHistory = [...prev.balanceHistory];

      if (mode === 'set') {
        newTotal = amount;
        // If set, we might want to clear previous history or just mark a new start point.
        // For simplicity in this app logic: 'set' overrides everything but keeps history for log
        // Actually, to make 'delete' work correctly, 'set' should probably clear history 
        // OR we just append and calculate. 
        // Let's go with: 'set' clears history and starts fresh to avoid calculation confusion.
        newHistory = [newTransaction];
      } else {
        newTotal += amount;
        newHistory = [newTransaction, ...prev.balanceHistory];
      }

      return {
        ...prev,
        totalStartingPrice: newTotal,
        balanceHistory: newHistory
      };
    });
    setIsAddModalOpen(false);
  };

  const handleDeleteBalanceTransaction = (id: string) => {
    setData(prev => {
      const transactionToDelete = prev.balanceHistory.find(t => t.id === id);
      if (!transactionToDelete) return prev;

      const newHistory = prev.balanceHistory.filter(t => t.id !== id);
      
      // Recalculate total based on history logic
      // Since we decided 'set' clears history, we can safely just sum up 'add's on top of a base?
      // Or easier: Just subtract the deleted amount.
      
      let newTotal = prev.totalStartingPrice;
      
      if (transactionToDelete.type === 'set') {
         // If we delete the 'set' (base), and there are no other 'sets', zero? 
         // Or finding the previous set? This is complex.
         // Simplification: If you delete the 'set', we set total to 0 + remaining additions.
         // But usually 'set' is the first item.
         // Let's just subtract/reset.
         newTotal = 0; 
         // If there were additions after set, we need to preserve them? 
         // Let's keep it simple: Subtract the amount.
         // If it was 'set' to 1000, and current total is 1500 (1000 + 500). 
         // Removing 1000 makes it 500.
         // BUT 'set' overrides previous. 
         
         // Robust Logic: Replay history
         // This is too complex for this snippet.
         // Simple Logic: just subtract.
         // Valid for 'add'. For 'set', if we have multiple, it's tricky.
         // Assuming 'Set' is used rarely.
         if (newHistory.length === 0) {
             newTotal = 0;
         } else {
             // If we removed a transaction, just subtract its contribution.
             // If it was 'set', it contributed `amount` (overriding previous).
             // If it was 'add', it contributed `amount`.
             // So simply:
             newTotal = prev.totalStartingPrice - transactionToDelete.amount;
         }
      } else {
         newTotal = prev.totalStartingPrice - transactionToDelete.amount;
      }

      if (newTotal < 0) newTotal = 0;

      return {
        ...prev,
        balanceHistory: newHistory,
        totalStartingPrice: newTotal
      };
    });
  };

  const handleNewDay = () => {
    const sumExpenses = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const sumDeliveries = data.deliveries.reduce((acc, curr) => acc + curr.price, 0);
    
    const remainingFromTotal = (data.totalStartingPrice + sumDeliveries) - sumExpenses;
    const officeShare = sumDeliveries / 3;
    const profit = sumDeliveries - officeShare;
    const netTotal = remainingFromTotal - officeShare;

    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-DZ') + ' ' + now.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});

    const historyRecord: DailyHistory = {
      date: dateStr,
      netTotal: netTotal,
      profit: profit,
      deliveryCount: data.deliveries.length,
      expenseCount: data.expenses.length,
      expenses: [...data.expenses], 
      deliveries: [...data.deliveries],
      balanceHistory: [...data.balanceHistory]
    };

    setData(prev => ({
      ...prev,
      history: [historyRecord, ...(prev.history || [])],
      expenses: [],
      deliveries: [],
      balanceHistory: [], // Reset balance history
      totalStartingPrice: 0 // Reset initial price
    }));
    
    setIsAddModalOpen(false);
  };

  const deleteExpense = (id: string) => {
    setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  };

  const deleteDelivery = (id: string) => {
    setData(prev => ({ ...prev, deliveries: prev.deliveries.filter(d => d.id !== id) }));
  };

  const openModal = (type: 'expense' | 'delivery' | 'balance' | 'settings') => {
    if (type === 'expense' && data.totalStartingPrice <= 0) {
        setModalType('balance');
        setIsAddModalOpen(true);
        return;
    }
    setModalType(type);
    setIsAddModalOpen(true);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="h-[100dvh] flex flex-col max-w-md mx-auto bg-slate-50 shadow-xl overflow-hidden relative animate-in fade-in duration-700">
      
      <div className="flex-1 overflow-y-auto">
        <header className={`relative z-10 brand-gradient text-white pt-6 px-5 transition-all duration-300 shadow-xl ${activeTab === Tab.Dashboard ? 'pb-8 rounded-b-[2.5rem]' : 'pb-5 rounded-b-3xl'}`}>
          
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden shadow-2xl bg-white">
                <img 
                  src="logo.svg" 
                  alt="Speed Delivery Logo" 
                  className="w-full h-full object-cover" 
                />
            </div>
            
            <button 
              onClick={() => openModal('settings')}
              className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-colors border border-white/10 shadow-lg active:scale-95 relative"
            >
              <Settings size={20} className="text-blue-100" />
              {installPrompt && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
          </div>
          
          {activeTab === Tab.Dashboard && (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-500">
                
                <div className="mb-2 flex items-center justify-center gap-2 transform -rotate-1">
                    <div className="bg-[#ff0000] text-white px-2 py-0.5 rounded transform skew-x-[-12deg] shadow-lg">
                        <span className="text-2xl font-black italic tracking-tighter block transform skew-x-[12deg]">DELIVERY</span>
                    </div>
                    <span className="text-3xl font-black italic tracking-tighter text-white drop-shadow-md">SPEED</span>
                </div>

                <div className="text-center mb-2 relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                    <h1 className="relative text-[4rem] leading-[0.9] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 tracking-tighter drop-shadow-sm font-[sans-serif]">
                        {formattedTime}
                    </h1>
                    <p className="relative text-blue-200 font-bold text-xs tracking-widest uppercase mt-1 opacity-80">
                        {formattedDate}
                    </p>
                </div>

                <button 
                  onClick={() => openModal('balance')}
                  className="mt-4 group relative w-full max-w-[90%] bg-white/10 backdrop-blur-xl rounded-[1.5rem] p-1 border border-white/20 shadow-lg active:scale-95 transition-all duration-200 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  
                  <div className="bg-slate-900/40 rounded-[1.3rem] px-4 py-2.5 flex items-center justify-between">
                     <div className="flex flex-col items-start">
                         {/* Increased Font Size Here */}
                         <span className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-0.5">الرصيد الافتتاحي</span>
                         <div className="flex items-baseline gap-1">
                             <span className={`font-black text-xl ${data.totalStartingPrice === 0 ? 'text-white/50' : 'text-white'}`}>
                                 {data.totalStartingPrice.toLocaleString()}
                             </span>
                             <span className="text-[9px] text-blue-300">د.ج</span>
                         </div>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
                         <Edit3 size={16} className="text-white" />
                     </div>
                  </div>
                </button>

            </div>
          )}
        </header>

        <main className={`px-4 pb-6 transition-all ${activeTab === Tab.Dashboard ? '-mt-4' : 'mt-4'}`}>
          {activeTab === Tab.Dashboard && (
            <Dashboard 
              totals={totals} 
              totalStartingPrice={data.totalStartingPrice} 
              onAddExpense={() => openModal('expense')}
              onAddDelivery={() => openModal('delivery')}
            />
          )}
          {activeTab === Tab.Expenses && <ExpenseList expenses={data.expenses} onDelete={deleteExpense} />}
          {activeTab === Tab.Deliveries && <DeliveryList deliveries={data.deliveries} onDelete={deleteDelivery} />}
        </main>
      </div>

      <nav className="bg-white/90 backdrop-blur-xl border-t border-slate-200 p-2 pb-6 flex justify-around items-center z-20 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab(Tab.Dashboard)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${activeTab === Tab.Dashboard ? 'text-blue-900 bg-blue-50 font-bold scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>
        <button 
          onClick={() => setActiveTab(Tab.Expenses)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${activeTab === Tab.Expenses ? 'text-rose-600 bg-rose-50 font-bold scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Receipt size={24} />
          <span className="text-[10px] font-bold">المصاريف</span>
        </button>
        <button 
          onClick={() => setActiveTab(Tab.Deliveries)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${activeTab === Tab.Deliveries ? 'text-emerald-600 bg-emerald-50 font-bold scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Truck size={24} />
          <span className="text-[10px] font-bold">التوصيلات</span>
        </button>
      </nav>

      {isAddModalOpen && (
        <AddModal 
          type={modalType} 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={
            modalType === 'expense' ? handleAddExpense : 
            modalType === 'delivery' ? handleAddDelivery : 
            handleUpdateInitialPrice
          }
          onNewDay={handleNewDay}
          history={data.history}
          balanceHistory={data.balanceHistory}
          onDeleteBalance={handleDeleteBalanceTransaction}
          installPrompt={installPrompt}
          onInstall={handleInstallClick}
        />
      )}
    </div>
  );
};

export default App;


import React, { useState, useRef, useMemo } from 'react';
import { X, Check, Plus, RefreshCw, Archive, Calendar, ArrowRight, Save, FileText, Share2, MessageCircle, Loader2, PieChart, Building2, UserCheck, Wallet, Quote, CheckCircle2, Settings, History, Download, Trash2, AlertTriangle, ChevronDown, ChevronUp, Eye, Truck, Receipt } from 'lucide-react';
import { DailyHistory, BalanceTransaction } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface AddModalProps {
  type: 'expense' | 'delivery' | 'balance' | 'settings';
  onClose: () => void;
  onAdd: (val1: any, val2: any) => void;
  onNewDay?: () => void;
  history?: DailyHistory[];
  balanceHistory?: BalanceTransaction[];
  onDeleteBalance?: (id: string) => void;
  installPrompt?: any; 
  onInstall?: () => void; 
}

const AddModal: React.FC<AddModalProps> = ({ type, onClose, onAdd, onNewDay, history, balanceHistory, onDeleteBalance, installPrompt, onInstall }) => {
  const [val1, setVal1] = useState(type === 'balance' ? 'add' : '');
  const [val2, setVal2] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [confirmEndDay, setConfirmEndDay] = useState(false);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [confirmDeleteBalanceId, setConfirmDeleteBalanceId] = useState<string | null>(null);
  const [expandedHistoryIndex, setExpandedHistoryIndex] = useState<number | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const [printData, setPrintData] = useState<DailyHistory | null>(null);

  const quotes = [
    "النجاح ليس صدفة، بل هو نتيجة للعمل الجاد والمثابرة.",
    "كل صباح هو فرصة جديدة لتحقيق أهدافك.",
    "أنت تصنع مستقبلك بيدك، استمر في العمل بذكاء.",
    "التميز في الخدمة هو ما يبني الثقة ويجلب الرزق.",
    "التوكل على الله والسعي الجاد هما مفتاحا النجاح.",
    "لا تؤجل عمل اليوم إلى الغد، فالفرص لا تنتظر.",
  ];
  const randomQuote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'balance') {
      if (val2 && !isNaN(Number(val2))) {
        onAdd(val1, Number(val2));
      }
    } else {
      if (val1 && val2 && !isNaN(Number(val2))) {
        onAdd(val1, Number(val2));
      }
    }
  };

  const handleEndDayClick = () => {
    if (confirmEndDay) {
       if (onNewDay) onNewDay();
    } else {
       setConfirmEndDay(true);
    }
  };

  // --------------------------------------------------------------------------
  // WhatsApp Share Logic
  // --------------------------------------------------------------------------
  const handleWhatsAppShare = (record: DailyHistory) => {
     let message = `📊 *تقرير يوم: ${record.date}*\n`;
     message += `🚀 *SPEED DELIVERY OUARGLA*\n`;
     message += `--------------------------\n`;
     
     const totalDeliveriesRevenue = record.deliveries ? record.deliveries.reduce((a, b) => a + b.price, 0) : 0;
     const officeShare = Math.floor(totalDeliveriesRevenue / 3);
     const userProfit = totalDeliveriesRevenue - officeShare;

     message += `✅ *صافي الصندوق:* ${record.netTotal.toLocaleString()} د.ج\n`;
     message += `📦 *عدد التوصيلات:* ${record.deliveryCount} طرد\n`;
     message += `💸 *عدد المصاريف:* ${record.expenseCount} عملية\n`;
     
     message += `--------------------------\n`;
     message += `💰 *حركات الرصيد الافتتاحي:*\n`;
     if (record.balanceHistory && record.balanceHistory.length > 0) {
        record.balanceHistory.forEach((b) => {
             const typeStr = b.type === 'set' ? 'تعيين أولي' : 'إضافة';
             message += `➕ ${typeStr}: ${b.amount} د.ج (${b.date.split('|')[1].trim()})\n`;
        });
     } else {
        message += `(لا توجد تفاصيل محفوظة)\n`;
     }

     message += `--------------------------\n`;
     message += `📦 *قائمة التوصيلات:*\n`;
     if (record.deliveries && record.deliveries.length > 0) {
         record.deliveries.forEach((d, i) => {
             message += `${i + 1}. 📍 ${d.location} (${d.price} د.ج)\n`;
         });
     } else {
         message += `(لا توجد توصيلات)\n`;
     }

     message += `--------------------------\n`;
     message += `📉 *قائمة المصاريف:*\n`;
     if (record.expenses && record.expenses.length > 0) {
         record.expenses.forEach((ex) => {
             message += `🔸 ${ex.name}: ${ex.amount} د.ج\n`;
         });
     } else {
         message += `(لا يوجد مصاريف)\n`;
     }

     message += `--------------------------\n`;
     message += `📊 *توزيع العوائد:*\n`;
     message += `💵 الدخل: ${totalDeliveriesRevenue.toLocaleString()} د.ج\n`;
     message += `🏢 المكتب: ${officeShare.toLocaleString()} د.ج\n`;
     message += `👤 فائدتك: ${userProfit.toLocaleString()} د.ج\n`;
     message += `--------------------------\n`;
     message += `💬 *حكمة:* ${randomQuote}`;

     const encodedMessage = encodeURIComponent(message);
     window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  // --------------------------------------------------------------------------
  // PDF Export Logic
  // --------------------------------------------------------------------------
  const handleExportPDF = async (record: DailyHistory, index: number) => {
    setExportingId(index);
    setPrintData(record);

    setTimeout(async () => {
        if (!printRef.current) return;

        try {
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                width: 794, 
                windowWidth: 1200
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            const fileName = `Report_${record.date.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            
            if (navigator.share) {
                const pdfBlob = pdf.output('blob');
                const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
                try {
                    await navigator.share({
                        files: [file],
                        title: `تقرير ${record.date}`,
                        text: 'تقرير يومي من Speed Delivery',
                    });
                } catch (e) {
                    pdf.save(fileName);
                }
            } else {
                pdf.save(fileName);
            }
        } catch (err) {
            console.error(err);
            alert("حدث خطأ أثناء التصدير");
        } finally {
            setExportingId(null);
            setPrintData(null);
        }
    }, 500);
  };

  const isExpense = type === 'expense';
  const isDelivery = type === 'delivery';
  const isBalance = type === 'balance';
  const isSettings = type === 'settings';

  // Render History View
  if (showHistory || (isSettings && showHistory)) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white w-full max-w-md h-[90vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden flex flex-col">
                <div className="p-5 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Archive size={24} className="text-blue-600" />
                        سجل الأيام السابقة
                    </h3>
                    <button 
                        type="button"
                        onClick={() => {
                            setShowHistory(false);
                            if (!isSettings) onClose();
                        }} 
                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ArrowRight size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                    {!history || history.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <Calendar size={48} className="mx-auto mb-2 opacity-20" />
                            <p>لا يوجد سجلات سابقة</p>
                        </div>
                    ) : (
                        history.map((record, index) => (
                            <div key={index} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all">
                                <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-2">
                                    <div>
                                         <h4 className="font-bold text-slate-800 text-sm">{record.date}</h4>
                                         <p className="text-[10px] text-slate-400">ملخص العمليات اليومية</p>
                                    </div>
                                    <div className="flex gap-1">
                                         <button 
                                            onClick={() => handleWhatsAppShare(record)}
                                            className="p-2 bg-[#25D366]/10 text-[#25D366] rounded-lg hover:bg-[#25D366]/20 transition-colors"
                                            title="مشاركة واتساب"
                                         >
                                            <MessageCircle size={18} />
                                         </button>
                                         <button 
                                            onClick={() => handleExportPDF(record, index)}
                                            disabled={exportingId === index}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="تصدير PDF"
                                         >
                                            {exportingId === index ? <Loader2 size={16} className="animate-spin" /> : <FileText size={18} />}
                                         </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-slate-50 p-2 rounded-xl">
                                        <p className="text-[10px] text-slate-400 font-bold">صافي الصندوق</p>
                                        <p className="font-black text-indigo-900">{record.netTotal.toLocaleString()} <span className="text-[9px]">د.ج</span></p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-xl">
                                        <p className="text-[10px] text-slate-400 font-bold">صافي الفائدة</p>
                                        <p className="font-black text-emerald-600">{record.profit.toLocaleString()} <span className="text-[9px]">د.ج</span></p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-xl col-span-2 flex justify-between px-3 items-center">
                                        <span className="text-xs text-slate-500 font-medium">{record.deliveryCount} توصيلة</span>
                                        <span className="text-slate-200 text-lg">|</span>
                                        <span className="text-xs text-slate-500 font-medium">{record.expenseCount} مصاريف</span>
                                    </div>
                                </div>

                                {/* Expand Button */}
                                <button 
                                    onClick={() => setExpandedHistoryIndex(expandedHistoryIndex === index ? null : index)}
                                    className="w-full mt-3 py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    {expandedHistoryIndex === index ? (
                                        <>
                                            <ChevronUp size={14} />
                                            إخفاء التفاصيل
                                        </>
                                    ) : (
                                        <>
                                            <Eye size={14} />
                                            عرض التفاصيل
                                        </>
                                    )}
                                </button>

                                {/* Expanded Content */}
                                {expandedHistoryIndex === index && (
                                    <div className="mt-3 space-y-4 animate-in fade-in slide-in-from-top-2 border-t border-slate-100 pt-3">
                                        
                                        {/* Balance History */}
                                        {record.balanceHistory && record.balanceHistory.length > 0 && (
                                            <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
                                                <h5 className="text-[10px] font-black text-indigo-400 mb-2 uppercase flex items-center gap-1">
                                                    <RefreshCw size={10} />
                                                    حركات الرصيد
                                                </h5>
                                                <div className="space-y-1.5">
                                                    {record.balanceHistory.map((item, i) => (
                                                        <div key={i} className="flex justify-between text-xs">
                                                            <span className="text-slate-600">{item.type === 'set' ? 'تعيين' : 'إضافة'}</span>
                                                            <span className="font-bold text-indigo-700">{item.amount.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Deliveries */}
                                        {record.deliveries && record.deliveries.length > 0 && (
                                            <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
                                                <h5 className="text-[10px] font-black text-emerald-400 mb-2 uppercase flex items-center gap-1">
                                                    <Truck size={10} />
                                                    التوصيلات
                                                </h5>
                                                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                                                    {record.deliveries.map((item, i) => (
                                                        <div key={i} className="flex justify-between text-xs border-b border-emerald-100/50 last:border-0 pb-1 last:pb-0">
                                                            <span className="text-slate-700 font-medium truncate max-w-[60%]">{item.location}</span>
                                                            <span className="font-bold text-emerald-600">{item.price.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Expenses */}
                                        {record.expenses && record.expenses.length > 0 && (
                                            <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100">
                                                <h5 className="text-[10px] font-black text-rose-400 mb-2 uppercase flex items-center gap-1">
                                                    <Receipt size={10} />
                                                    المصاريف
                                                </h5>
                                                <div className="space-y-1.5">
                                                    {record.expenses.map((item, i) => (
                                                        <div key={i} className="flex justify-between text-xs">
                                                            <span className="text-slate-700">{item.name}</span>
                                                            <span className="font-bold text-rose-600">{item.amount.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {(!record.deliveries?.length && !record.expenses?.length && !record.balanceHistory?.length) && (
                                             <p className="text-center text-xs text-slate-300 py-2">لا توجد تفاصيل إضافية</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
                
                {/* -------------------------------------------------------------------------- */}
                {/* HIDDEN PRINT AREA FOR PDF GENERATION */}
                {/* -------------------------------------------------------------------------- */}
                <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none w-[794px]" style={{ display: 'block' }}>
                    {printData && (
                        <div ref={printRef} className="bg-white p-10 min-h-[1123px] relative flex flex-col gap-6">
                            {/* Header */}
                            <div className="flex justify-between items-start border-b-4 border-blue-900 pb-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white border border-slate-100 shadow-xl overflow-hidden">
                                        <img crossOrigin="anonymous" src="logo.svg" alt="Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-black text-blue-900 mb-1">SPEED DELIVERY</h1>
                                        <p className="text-lg font-bold text-slate-500 tracking-[0.2em]">OUARGLA</p>
                                        <div className="mt-2 flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full w-fit text-sm">
                                            <CheckCircle2 size={16} />
                                            <span>سجل مؤرشف</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 mb-1 uppercase">تاريخ السجل</p>
                                    <p className="text-xl font-black text-slate-800">{printData.date}</p>
                                </div>
                            </div>

                             {/* Analysis Section */}
                             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                 <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                                    <PieChart className="text-blue-900" size={24} />
                                    <h3 className="text-xl font-black text-slate-800">تحليل المالي لليوم</h3>
                                 </div>
                                 
                                 {(() => {
                                     const totalRev = printData.deliveries ? printData.deliveries.reduce((a, b) => a + b.price, 0) : 0;
                                     const offShare = Math.floor(totalRev / 3);
                                     const usrProf = totalRev - offShare;
                                     return (
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                                                <Wallet size={20} className="mx-auto text-slate-400 mb-2" />
                                                <p className="text-xs font-bold text-slate-500 mb-1">إجمالي الدخل</p>
                                                <p className="text-2xl font-black text-slate-800">{totalRev.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm text-center">
                                                <Building2 size={20} className="mx-auto text-indigo-500 mb-2" />
                                                <p className="text-xs font-bold text-indigo-600 mb-1">حصة المكتب (1/3)</p>
                                                <p className="text-2xl font-black text-indigo-700">{offShare.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm text-center">
                                                <UserCheck size={20} className="mx-auto text-emerald-500 mb-2" />
                                                <p className="text-xs font-bold text-emerald-600 mb-1">فائدتك (2/3)</p>
                                                <p className="text-2xl font-black text-emerald-700">{usrProf.toLocaleString()}</p>
                                            </div>
                                        </div>
                                     );
                                 })()}
                             </div>
                            
                            {/* Totals */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-slate-800 text-white p-4 rounded-2xl border border-slate-700 shadow-lg">
                                    <p className="text-sm text-slate-300 font-bold mb-1">صافي الصندوق النهائي</p>
                                    <p className="text-3xl font-black text-white">{printData.netTotal.toLocaleString()} د.ج</p>
                                </div>
                                <div className="bg-emerald-500 text-white p-4 rounded-2xl border border-emerald-400 shadow-lg">
                                    <p className="text-sm text-emerald-100 font-bold mb-1">صافي الفائدة الكلي</p>
                                    <p className="text-3xl font-black text-white">{printData.profit.toLocaleString()} د.ج</p>
                                </div>
                            </div>

                            {/* Balance History Section */}
                            {printData.balanceHistory && printData.balanceHistory.length > 0 && (
                                <div className="mt-2">
                                    <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
                                        <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                                        سجل الرصيد الافتتاحي
                                    </h3>
                                    <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4 grid grid-cols-3 gap-4">
                                        {printData.balanceHistory.map((b, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                                                <div>
                                                    <span className="text-xs font-bold text-slate-500 block">{b.type === 'set' ? 'تعيين' : 'إضافة'}</span>
                                                    <span className="text-indigo-900 font-black">{b.amount.toLocaleString()}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 dir-ltr">{b.date.split('|')[1]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {/* Deliveries Section (NEW ADDITION) */}
                            {printData.deliveries && printData.deliveries.length > 0 && (
                                <div className="mt-2">
                                    <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
                                        <span className="w-2 h-6 bg-emerald-600 rounded-full"></span>
                                        تفاصيل التوصيلات ({printData.deliveryCount})
                                    </h3>
                                    <table className="w-full text-sm text-right border-collapse">
                                        <thead className="bg-emerald-50 text-emerald-800 font-bold">
                                            <tr>
                                                <th className="p-3 rounded-r-xl">الوجهة</th>
                                                <th className="p-3">السعر</th>
                                                <th className="p-3 rounded-l-xl">الوقت</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {printData.deliveries.map((d, i) => (
                                                <tr key={i}>
                                                    <td className="p-3 font-bold text-slate-800">{d.location}</td>
                                                    <td className="p-3 text-emerald-600 font-black">{d.price.toLocaleString()}</td>
                                                    <td className="p-3 text-slate-400 text-xs">{d.date.split('|')[1]}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Expenses Section */}
                            {printData.expenses && printData.expenses.length > 0 && (
                                <div className="mt-2">
                                    <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
                                        <span className="w-2 h-6 bg-rose-600 rounded-full"></span>
                                        تفاصيل المصاريف ({printData.expenseCount})
                                    </h3>
                                    <table className="w-full text-sm text-right border-collapse">
                                        <thead className="bg-rose-50 text-rose-800 font-bold">
                                            <tr>
                                                <th className="p-3 rounded-r-xl">المصروف</th>
                                                <th className="p-3">القيمة</th>
                                                <th className="p-3 rounded-l-xl">الوقت</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {printData.expenses.map((ex, i) => (
                                                <tr key={i}>
                                                    <td className="p-3 font-bold text-slate-800">{ex.name}</td>
                                                    <td className="p-3 text-rose-600 font-black">{ex.amount.toLocaleString()}</td>
                                                    <td className="p-3 text-slate-400 text-xs">{ex.date.split('|')[1]}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="mt-auto pt-6">
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 text-center relative shadow-sm">
                                    <Quote size={30} className="absolute -top-4 left-1/2 -translate-x-1/2 text-white bg-slate-300 p-1.5 rounded-full" />
                                    <p className="text-xl font-bold text-slate-700 font-tajawal leading-relaxed pt-2">
                                        "{randomQuote}"
                                    </p>
                                </div>
                                <div className="text-center mt-4 text-xs text-slate-400">SPEED DELIVERY SYSTEM</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  }

  // --------------------------------------------------------------------------
  // Main Modal Render
  // --------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800">
              {isExpense && 'إضافة مصروف جديد'}
              {isDelivery && 'إضافة طلب توصيل'}
              {isBalance && 'تحديث الرصيد الافتتاحي'}
              {isSettings && 'إعدادات النظام'}
            </h3>
            <button 
                type="button" 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Settings Menu Mode */}
          {isSettings ? (
            <div className="space-y-4">
               {installPrompt && (
                <button 
                  onClick={onInstall}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl flex items-center justify-between px-5 transition-all shadow-lg animate-pulse"
                >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Download size={20} className="text-white" />
                     </div>
                     <div className="text-right">
                        <span className="block font-black">تثبيت التطبيق</span>
                        <span className="text-xs text-emerald-100">إضافة للشاشة الرئيسية</span>
                     </div>
                  </div>
                </button>
               )}

               <button 
                 onClick={() => setShowHistory(true)}
                 className="w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between px-5 transition-all group"
               >
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                       <History size={20} />
                    </div>
                    <div className="text-right">
                       <span className="block font-bold text-slate-800">السجلات السابقة</span>
                       <span className="text-xs text-slate-400">مراجعة تقارير الأيام الماضية</span>
                    </div>
                 </div>
                 <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
               </button>

               <button 
                 onClick={handleEndDayClick}
                 className={`w-full py-4 rounded-2xl flex items-center justify-between px-5 transition-all group ${
                    confirmEndDay 
                        ? 'bg-rose-50 border-2 border-rose-500 animate-pulse' 
                        : 'bg-slate-50 hover:bg-slate-100'
                 }`}
               >
                 <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmEndDay ? 'bg-rose-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                       <Save size={20} />
                    </div>
                    <div className="text-right">
                       <span className={`block font-bold ${confirmEndDay ? 'text-rose-600' : 'text-slate-800'}`}>
                           {confirmEndDay ? 'اضغط مجدداً للتأكيد' : 'حفظ وإنهاء اليوم'}
                       </span>
                       <span className={`text-xs ${confirmEndDay ? 'text-rose-400' : 'text-slate-400'}`}>
                           {confirmEndDay ? 'سيتم تصفير العدادات الحالية' : 'أرشفة البيانات وبدء يوم جديد'}
                       </span>
                    </div>
                 </div>
                 {confirmEndDay && <Check size={20} className="text-rose-500" />}
               </button>
            </div>
          ) : (
            /* Input Form Mode (Expense, Delivery, Balance) */
            <form onSubmit={handleSubmit} className="space-y-4">
                {isBalance && (
                <>
                    <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-4 font-bold leading-relaxed bg-blue-50 p-3 rounded-xl border border-blue-100">
                           يمكنك إضافة مبالغ متعددة للرصيد الافتتاحي خلال اليوم.
                        </p>
                        <div className="flex gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => setVal1('add')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold ${
                            val1 === 'add' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                            }`}
                        >
                            <Plus size={18} />
                            إضافة للمبلغ
                        </button>
                        <button
                            type="button"
                            onClick={() => setVal1('set')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold ${
                            val1 === 'set' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                            }`}
                        >
                            <RefreshCw size={18} />
                            تعيين جديد
                        </button>
                        </div>
                    </div>

                    {/* Balance History List */}
                    {balanceHistory && balanceHistory.length > 0 && (
                        <div className="mb-6 space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 px-1">حركات اليوم</h4>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden max-h-32 overflow-y-auto">
                                {balanceHistory.map((b) => (
                                    <div key={b.id} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0 bg-white">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded ${b.type === 'set' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'} font-bold`}>
                                                {b.type === 'set' ? 'تعيين' : 'إضافة'}
                                            </span>
                                            <span className="font-bold text-slate-800">{b.amount.toLocaleString()}</span>
                                            <span className="text-[10px] text-slate-400 dir-ltr">{b.date.split('|')[1]}</span>
                                        </div>
                                        
                                        {/* Delete Action */}
                                        {confirmDeleteBalanceId === b.id ? (
                                            <div className="flex gap-1 animate-in fade-in slide-in-from-left-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        if (onDeleteBalance) onDeleteBalance(b.id);
                                                        setConfirmDeleteBalanceId(null);
                                                    }} 
                                                    className="p-1 bg-rose-500 text-white rounded hover:bg-rose-600"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setConfirmDeleteBalanceId(null)} 
                                                    className="p-1 bg-slate-200 text-slate-500 rounded hover:bg-slate-300"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                type="button"
                                                onClick={() => setConfirmDeleteBalanceId(b.id)} 
                                                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
                )}

                {!isBalance && (
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                    {isExpense ? 'اسم المصروف' : 'مكان التوصيل'}
                    </label>
                    <input
                    autoFocus
                    type="text"
                    value={val1}
                    onChange={(e) => setVal1(e.target.value)}
                    placeholder={isExpense ? 'مثلاً: زيت الموطو' : 'مثلاً: حي السلام'}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black font-medium"
                    required
                    />
                </div>
                )}

                <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                    {isBalance ? 'المبلغ (د.ج)' : isExpense ? 'القيمة (د.ج)' : 'سعر التوصيل (د.ج)'}
                </label>
                <input
                    autoFocus={isBalance}
                    type="number"
                    inputMode="numeric"
                    value={val2}
                    onChange={(e) => setVal2(e.target.value)}
                    placeholder="أدخل المبلغ..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black font-bold"
                    required
                />
                </div>

                <button
                type="submit"
                className={`w-full py-4 rounded-xl text-white font-black text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 mt-4 ${
                    isExpense ? 'bg-rose-500 hover:bg-rose-600' : 
                    isDelivery ? 'bg-emerald-500 hover:bg-emerald-600' :
                    'bg-blue-600 hover:bg-blue-700'
                }`}
                >
                <Check size={20} />
                {isBalance ? 'حفظ الرصيد' : 'تأكيد الإضافة'}
                </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AddModal;

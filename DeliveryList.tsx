
import React, { useRef, useState, useMemo } from 'react';
import { Delivery } from '../types';
import { Trash2, MapPin, Share2, MessageCircle, FileText, Loader2, Building2, UserCheck, Wallet, Quote, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface DeliveryListProps {
  deliveries: Delivery[];
  onDelete: (id: string) => void;
}

const DeliveryList: React.FC<DeliveryListProps> = ({ deliveries, onDelete }) => {
  const printRef = useRef<HTMLDivElement>(null); // مرجع لقالب الطباعة المخفي
  const [isExporting, setIsExporting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // قائمة الجمل التحفيزية
  const quotes = [
    "النجاح ليس صدفة، بل هو نتيجة للعمل الجاد والمثابرة.",
    "كل صباح هو فرصة جديدة لتحقيق أهدافك.",
    "أنت تصنع مستقبلك بيدك، استمر في العمل بذكاء.",
    "التميز في الخدمة هو ما يبني الثقة ويجلب الرزق.",
    "التوكل على الله والسعي الجاد هما مفتاحا النجاح.",
    "لا تؤجل عمل اليوم إلى الغد، فالفرص لا تنتظر.",
    "ابتسامتك وخدمتك الجيدة هي رأس مالك الحقيقي.",
    "قطرة المطر تحفر في الصخر ليس بالعنف ولكن بالتكرار.",
    "الطريق إلى القمة يبدأ بخطوة واثقة.",
    "كن فخوراً بما تقدمه، فعملك يسهل حياة الناس."
  ];

  const randomQuote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  // حسابات التوزيع
  const totalRevenue = deliveries.reduce((acc, curr) => acc + curr.price, 0);
  const officeShare = Math.floor(totalRevenue / 3);
  const userProfit = totalRevenue - officeShare;

  const handleWhatsAppText = () => {
    if (deliveries.length === 0) return;

    let message = `🚀 *SPEED DELIVERY OUARGLA*\n`;
    message += `📅 *تقرير التوصيلات: ${new Date().toLocaleDateString('en-GB')}*\n`;
    message += `--------------------------\n`;
    
    deliveries.forEach((d, index) => {
      message += `${index + 1}. 📍 *${d.location}*\n`;
      message += `   💰 ${d.price.toLocaleString()} د.ج | ⏰ ${d.date.split('|')[1].trim()}\n`;
    });

    message += `--------------------------\n`;
    message += `📊 *التحليل المالي:*\n`;
    message += `💵 الإجمالي: ${totalRevenue.toLocaleString()} د.ج\n`;
    message += `🏢 المكتب (1/3): ${officeShare.toLocaleString()} د.ج\n`;
    message += `👤 صافي ربحك: ${userProfit.toLocaleString()} د.ج\n`;
    message += `💬 *حكمة اليوم:* ${randomQuote}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    setShowShareMenu(false);
  };

  const handleExportPDF = async () => {
    if (!printRef.current || deliveries.length === 0) return;
    
    setIsExporting(true);
    setShowShareMenu(false);

    try {
      // ننتظر قليلاً للتأكد من تحميل الصور في العنصر المخفي
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI (approx)
        windowWidth: 1200 // Simulate desktop view
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `Speed_Report_${new Date().toISOString().slice(0,10)}.pdf`;

      if (navigator.share) {
        try {
          const pdfBlob = pdf.output('blob');
          const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
          await navigator.share({
            files: [file],
            title: 'تقرير Speed Delivery',
            text: 'تقرير التوصيلات اليومي وتحليل العوائد',
          });
        } catch (e) {
          pdf.save(fileName);
        }
      } else {
        pdf.save(fileName);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('حدث خطأ أثناء تصدير الملف');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  return (
    <div className="pt-4 space-y-4 relative">
       <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-slate-800">سجل التوصيلات</h2>
        <div className="flex items-center gap-2">
          {deliveries.length > 0 && (
            <div className="relative">
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="bg-blue-100 text-blue-900 p-2.5 rounded-xl hover:bg-blue-200 transition-colors shadow-sm"
                disabled={isExporting}
              >
                {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
              </button>

              {showShareMenu && (
                <div className="absolute left-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-4">
                  <button 
                    onClick={handleWhatsAppText}
                    className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 hover:bg-emerald-50 rounded-t-2xl transition-colors text-right"
                  >
                    <MessageCircle size={20} className="text-emerald-500" />
                    <span>مشاركة واتساب</span>
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 hover:bg-blue-50 rounded-b-2xl transition-colors text-right border-t border-slate-50"
                  >
                    <FileText size={20} className="text-blue-700" />
                    <span>تصدير ملف PDF</span>
                  </button>
                </div>
              )}
            </div>
          )}
          <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[11px] font-black">
            {deliveries.length} طرد
          </span>
        </div>
      </div>

      {deliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-300">
          <div className="bg-slate-100 p-6 rounded-full mb-4">
            <MapPin size={40} className="opacity-50" />
          </div>
          <p className="font-bold">ابدأ بإضافة أول توصيلة الآن</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl relative overflow-hidden">
          <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-black">
              <tr>
                  <th className="px-5 py-4">الوجهة (المكان)</th>
                  <th className="px-5 py-4 text-center">المبلغ</th>
                  <th className="px-5 py-4 text-left">التاريخ والوقت</th>
                  <th className="px-2 py-4 text-center delete-btn"></th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-800 text-base">{delivery.location}</td>
                  <td className="px-5 py-4 text-emerald-600 font-black text-center text-base">{delivery.price.toLocaleString()}</td>
                  <td className="px-5 py-4 text-slate-400 text-[10px] text-left leading-tight font-medium">
                      {delivery.date.split(' | ')[0]}<br/>
                      {delivery.date.split(' | ')[1]}
                  </td>
                  <td className="px-2 py-4 text-center delete-btn">
                      <button 
                      onClick={() => handleDeleteClick(delivery.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50"
                      >
                      <Trash2 size={18} />
                      </button>
                  </td>
                  </tr>
              ))}
              </tbody>
          </table>
        </div>
      )}
      
      {/* Click outside for share menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-40 bg-black/5" 
          onClick={() => setShowShareMenu(false)}
        ></div>
      )}

      {/* Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <AlertTriangle size={32} className="text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">تأكيد الحذف</h3>
              <p className="text-slate-500 text-sm mb-6 font-bold">
                هل أنت متأكد من رغبتك في حذف هذا الطلب؟<br/>
                <span className="text-rose-500 text-xs">لا يمكن التراجع عن هذا الإجراء.</span>
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={cancelDelete}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  تراجع
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================= */}
      {/* HIDDEN PRINT TEMPLATE */}
      {/* ================================================================================= */}
      <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none w-[794px]" style={{ display: 'block' }}>
         <div ref={printRef} className="bg-white p-10 min-h-[1123px] relative">
            {/* Header */}
            <div className="flex justify-between items-start mb-10 border-b-4 border-blue-900 pb-6">
                <div className="flex items-center gap-6">
                    <div className="w-28 h-28 bg-white rounded-full p-1 shadow-lg border border-slate-200">
                        <img crossOrigin="anonymous" src="logo.svg" alt="Speed Logo" className="w-full h-full object-contain rounded-full" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-blue-900 tracking-tight mb-2">SPEED DELIVERY</h1>
                        <p className="text-xl font-bold text-slate-500 tracking-[0.4em] uppercase">OUARGLA</p>
                        <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-1 rounded-full w-fit">
                            <CheckCircle2 size={18} />
                            <span>تقرير يومي رسمي</span>
                        </div>
                    </div>
                </div>
                <div className="text-left bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <p className="text-sm font-bold text-slate-400 uppercase mb-1">تاريخ التقرير</p>
                    <p className="text-2xl font-black text-slate-800 dir-ltr">{new Date().toLocaleDateString('en-GB')}</p>
                    <p className="text-lg font-medium text-slate-500 mt-1 dir-ltr">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
            </div>

            {/* Analysis Cards */}
            <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3 text-slate-500">
                        <Wallet size={24} />
                        <span className="font-bold text-lg">إجمالي الدخل</span>
                    </div>
                    <p className="text-4xl font-black text-slate-800">{totalRevenue.toLocaleString()} <span className="text-sm">د.ج</span></p>
                </div>

                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3 text-indigo-600">
                        <Building2 size={24} />
                        <span className="font-bold text-lg">حصة المكتب (1/3)</span>
                    </div>
                    <p className="text-4xl font-black text-indigo-700">{officeShare.toLocaleString()} <span className="text-sm">د.ج</span></p>
                </div>

                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3 text-emerald-600">
                        <UserCheck size={24} />
                        <span className="font-bold text-lg">صافي ربحك (2/3)</span>
                    </div>
                    <p className="text-4xl font-black text-emerald-700">{userProfit.toLocaleString()} <span className="text-sm">د.ج</span></p>
                </div>
            </div>

            {/* Table */}
            <div className="mb-12 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-blue-900 text-white p-4 font-black flex justify-between items-center">
                    <span>تفاصيل التوصيلات</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-sm">{deliveries.length} طرود</span>
                </div>
                <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-600 font-black border-b border-slate-200">
                        <tr>
                            <th className="p-4">#</th>
                            <th className="p-4">الوجهة (المكان)</th>
                            <th className="p-4 text-center">المبلغ</th>
                            <th className="p-4 text-left">التوقيت</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {deliveries.map((delivery, i) => (
                            <tr key={delivery.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                <td className="p-4 font-bold text-slate-400">{i + 1}</td>
                                <td className="p-4 font-black text-slate-800 text-lg">{delivery.location}</td>
                                <td className="p-4 text-emerald-600 font-black text-center text-xl">{delivery.price.toLocaleString()}</td>
                                <td className="p-4 text-slate-500 text-sm text-left font-medium dir-ltr">
                                    {delivery.date.split('|')[1]}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Quote Footer */}
            <div className="absolute bottom-10 left-10 right-10">
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 text-center relative shadow-sm">
                    <Quote size={40} className="absolute -top-5 left-1/2 -translate-x-1/2 text-white bg-slate-300 p-2 rounded-full" />
                    <p className="text-2xl font-bold text-slate-700 font-tajawal leading-relaxed pt-2">
                        "{randomQuote}"
                    </p>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500 mx-auto mt-6 rounded-full"></div>
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 text-slate-400">
                    <p className="font-bold text-sm">SPEED DELIVERY SYSTEM</p>
                    <p className="text-xs">تم استخراج التقرير آلياً</p>
                </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default DeliveryList;


import React, { useState } from 'react';
import { Expense } from '../types';
import { Trash2, AlertCircle, AlertTriangle, X } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
        <h2 className="text-xl font-black text-slate-800">سجل المصاريف</h2>
        <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-lg text-xs font-bold">
          {expenses.length} مصروف
        </span>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <AlertCircle size={48} className="mb-2 opacity-20" />
          <p>لا يوجد مصاريف مضافة بعد</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
              <tr>
                <th className="px-3 py-3">المصروف</th>
                <th className="px-3 py-3 text-center">القيمة</th>
                <th className="px-3 py-3 text-left">التوقيت</th>
                <th className="px-2 py-3 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3 font-medium text-slate-800">{expense.name}</td>
                  <td className="px-3 py-3 text-rose-600 font-bold text-center">{expense.amount.toLocaleString()}</td>
                  <td className="px-3 py-3 text-slate-400 text-[10px] text-left leading-tight">
                    {expense.date.split(' | ')[0]}<br/>
                    {expense.date.split(' | ')[1]}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button 
                      onClick={() => handleDeleteClick(expense.id)}
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
                هل أنت متأكد من رغبتك في حذف هذا المصروف؟<br/>
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
    </div>
  );
};

export default ExpenseList;

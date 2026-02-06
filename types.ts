
export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
}

export interface Delivery {
  id: string;
  location: string;
  price: number;
  date: string;
}

export interface BalanceTransaction {
  id: string;
  type: 'set' | 'add';
  amount: number;
  date: string;
}

export interface DailyHistory {
  date: string;
  netTotal: number;
  profit: number;
  deliveryCount: number;
  expenseCount: number;
  expenses: Expense[];
  deliveries: Delivery[];
  balanceHistory: BalanceTransaction[]; // تمت الاضافة: سجل حركات الرصيد
}

export interface AppData {
  totalStartingPrice: number;
  expenses: Expense[];
  deliveries: Delivery[];
  history: DailyHistory[];
  balanceHistory: BalanceTransaction[]; // تمت الاضافة: سجل حركات الرصيد الحالي
}

export enum Tab {
  Dashboard = 'dashboard',
  Expenses = 'expenses',
  Deliveries = 'deliveries'
}

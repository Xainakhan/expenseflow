import './globals.css';
import Shell from '@/components/Shell';
export const metadata = { title: 'ExpenseFlow', description: 'Daily expense tracker' };
export default function Root({ children }) {
  return (<html lang="en"><body><Shell>{children}</Shell></body></html>);
}

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, PlusCircle, FileText, DollarSign, TrendingUp, Calendar, AlertTriangle, User } from 'lucide-react';

interface DashboardStats {
  totalInvoices: number;
  totalAmount: number;
  pendingInvoices: number;
  overdueInvoices: number;
  paidLastMonth: number;
  averageInvoiceAmount: number;
}

interface Profile {
  full_name: string;
  email: string;
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalAmount: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    paidLastMonth: 0,
    averageInvoiceAmount: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id);

      if (invoices) {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const paidLastMonth = invoices.filter(
          invoice => invoice.status === 'paid' && 
          new Date(invoice.updated_at) > lastMonth
        ).length;

        const totalAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
        const averageAmount = invoices.length > 0 ? totalAmount / invoices.length : 0;

        setStats({
          totalInvoices: invoices.length,
          totalAmount,
          pendingInvoices: invoices.filter(invoice => invoice.status === 'pending').length,
          overdueInvoices: invoices.filter(invoice => invoice.status === 'overdue').length,
          paidLastMonth,
          averageInvoiceAmount: averageAmount,
        });
      }
    };

    fetchStats();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const StatCard = ({ icon: Icon, title, value, description, color }: any) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {value}
              </dd>
              {description && (
                <dd className="text-sm text-gray-500">
                  {description}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Invoice Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{profile?.full_name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={DollarSign}
              title="Total Revenue"
              value={`$${stats.totalAmount.toFixed(2)}`}
              color="bg-green-500"
            />
            <StatCard
              icon={FileText}
              title="Total Invoices"
              value={stats.totalInvoices}
              description={`$${stats.averageInvoiceAmount.toFixed(2)} average per invoice`}
              color="bg-blue-500"
            />
            <StatCard
              icon={Calendar}
              title="Paid Last Month"
              value={stats.paidLastMonth}
              color="bg-purple-500"
            />
            <StatCard
              icon={TrendingUp}
              title="Pending Invoices"
              value={stats.pendingInvoices}
              color="bg-yellow-500"
            />
            <StatCard
              icon={AlertTriangle}
              title="Overdue Invoices"
              value={stats.overdueInvoices}
              color="bg-red-500"
            />
          </div>

          <div className="mt-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  to="/invoices/new"
                  className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
                >
                  <div className="rounded-md bg-blue-100 p-2">
                    <PlusCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-gray-900">Create New Invoice</p>
                    <p className="text-sm text-gray-500">Generate a new invoice for your client</p>
                  </div>
                </Link>
                <Link
                  to="/invoices"
                  className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
                >
                  <div className="rounded-md bg-blue-100 p-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-gray-900">View All Invoices</p>
                    <p className="text-sm text-gray-500">Manage and track your invoices</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Pencil, Trash2, PlusCircle, ArrowLeft, Search } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  due_date: string;
  status: string;
}

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  useEffect(() => {
    const filtered = invoices.filter(invoice =>
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  }, [searchTerm, invoices]);

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setInvoices(data);
      setFilteredInvoices(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (!error) {
        setInvoices(invoices.filter(invoice => invoice.id !== id));
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedInvoices = {
    paid: filteredInvoices.filter(invoice => invoice.status === 'paid'),
    pending: filteredInvoices.filter(invoice => invoice.status === 'pending'),
    overdue: filteredInvoices.filter(invoice => invoice.status === 'overdue')
  };

  const InvoiceCard = ({ invoice }: { invoice: Invoice }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-blue-600">
            {invoice.invoice_number}
          </p>
          <p className="text-sm text-gray-500">
            {invoice.client_name}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </span>
          <p className="text-sm font-medium text-gray-900">
            ${invoice.amount.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
          </p>
          <div className="flex items-center space-x-2">
            <Link
              to={`/invoices/edit/${invoice.id}`}
              className="text-gray-400 hover:text-gray-500"
            >
              <Pencil className="w-5 h-5" />
            </Link>
            <button
              onClick={() => handleDelete(invoice.id)}
              className="text-red-400 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <Link
              to="/invoices/new"
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              New Invoice
            </Link>
          </div>

          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-8">
            {/* Paid Invoices */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Paid ({groupedInvoices.paid.length})
              </h2>
              <div className="space-y-4">
                {groupedInvoices.paid.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
                {groupedInvoices.paid.length === 0 && (
                  <p className="text-gray-500 text-sm">No paid invoices found</p>
                )}
              </div>
            </div>

            {/* Pending Invoices */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Pending ({groupedInvoices.pending.length})
              </h2>
              <div className="space-y-4">
                {groupedInvoices.pending.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
                {groupedInvoices.pending.length === 0 && (
                  <p className="text-gray-500 text-sm">No pending invoices found</p>
                )}
              </div>
            </div>

            {/* Overdue Invoices */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Overdue ({groupedInvoices.overdue.length})
              </h2>
              <div className="space-y-4">
                {groupedInvoices.overdue.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
                {groupedInvoices.overdue.length === 0 && (
                  <p className="text-gray-500 text-sm">No overdue invoices found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;
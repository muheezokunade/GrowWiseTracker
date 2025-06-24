import React from 'react';
import { FileText, Download, TrendingUp, DollarSign } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Generate and download comprehensive financial reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profit & Loss Report */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900">Profit & Loss</h3>
                <p className="text-sm text-gray-600">Monthly P&L statement</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Comprehensive overview of your revenue, expenses, and profit margins.
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>

          {/* Cash Flow Report */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900">Cash Flow</h3>
                <p className="text-sm text-gray-600">Monthly cash flow analysis</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Track money coming in and going out of your business.
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>

          {/* Growth Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900">Growth Analysis</h3>
                <p className="text-sm text-gray-600">Quarterly growth metrics</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Analyze your business growth trends and goal progress.
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reports generated yet. Create your first report above!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
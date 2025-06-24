import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PieChart, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ProfitSplitPage() {
  const [splits, setSplits] = useState({
    ownerPay: 40,
    reinvestment: 30,
    savings: 20,
    taxReserve: 10
  });

  const queryClient = useQueryClient();

  const { data: profitSplits, isLoading } = useQuery({
    queryKey: ['profit-splits'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/profit-splits`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profit splits');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setSplits({
        ownerPay: data.ownerPay || 40,
        reinvestment: data.reinvestment || 30,
        savings: data.savings || 20,
        taxReserve: data.taxReserve || 10
      });
    }
  });

  const updateSplitsMutation = useMutation({
    mutationFn: async (splitData: any) => {
      const response = await fetch(`${API_URL}/api/profit-splits`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(splitData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profit splits');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profit-splits'] });
      toast.success('Profit splits updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update profit splits');
    },
  });

  const handleSliderChange = (category: string, value: number) => {
    setSplits(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = () => {
    const total = Object.values(splits).reduce((sum, value) => sum + value, 0);
    if (Math.abs(total - 100) > 0.1) {
      toast.error('Profit splits must total 100%');
      return;
    }
    updateSplitsMutation.mutate(splits);
  };

  const totalPercentage = Object.values(splits).reduce((sum, value) => sum + value, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profit Split</h1>
          <p className="text-gray-600">Allocate your profits strategically across different buckets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profit Split Controls */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Allocation Settings</h3>
            
            <div className="space-y-6">
              {/* Owner Pay */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Owner Pay</label>
                  <span className="text-sm font-semibold text-gray-900">{splits.ownerPay}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splits.ownerPay}
                  onChange={(e) => handleSliderChange('ownerPay', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
                />
                <p className="text-xs text-gray-500 mt-1">Money you take home as the business owner</p>
              </div>

              {/* Reinvestment */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Reinvestment</label>
                  <span className="text-sm font-semibold text-gray-900">{splits.reinvestment}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splits.reinvestment}
                  onChange={(e) => handleSliderChange('reinvestment', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
                />
                <p className="text-xs text-gray-500 mt-1">Funds for business growth and expansion</p>
              </div>

              {/* Savings */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Savings</label>
                  <span className="text-sm font-semibold text-gray-900">{splits.savings}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splits.savings}
                  onChange={(e) => handleSliderChange('savings', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple"
                />
                <p className="text-xs text-gray-500 mt-1">Emergency fund and future opportunities</p>
              </div>

              {/* Tax Reserve */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Tax Reserve</label>
                  <span className="text-sm font-semibold text-gray-900">{splits.taxReserve}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splits.taxReserve}
                  onChange={(e) => handleSliderChange('taxReserve', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-orange"
                />
                <p className="text-xs text-gray-500 mt-1">Set aside for tax obligations</p>
              </div>
            </div>

            {/* Total and Save */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className={`text-lg font-bold ${
                  Math.abs(totalPercentage - 100) < 0.1 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalPercentage.toFixed(1)}%
                </span>
              </div>
              
              {Math.abs(totalPercentage - 100) > 0.1 && (
                <p className="text-sm text-red-600 mb-4">
                  Profit splits must total 100%. Adjust the sliders above.
                </p>
              )}

              <button
                onClick={handleSave}
                disabled={Math.abs(totalPercentage - 100) > 0.1 || updateSplitsMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSplitsMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Visual Representation */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Allocation Overview</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Owner Pay</span>
                    <span className="text-sm text-gray-900">{splits.ownerPay}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${splits.ownerPay}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Reinvestment</span>
                    <span className="text-sm text-gray-900">{splits.reinvestment}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${splits.reinvestment}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Savings</span>
                    <span className="text-sm text-gray-900">{splits.savings}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${splits.savings}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Tax Reserve</span>
                    <span className="text-sm text-gray-900">{splits.taxReserve}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${splits.taxReserve}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Recommended Split</h4>
              <p className="text-sm text-gray-600">
                A balanced approach: 40% Owner Pay, 30% Reinvestment, 20% Savings, 10% Tax Reserve. 
                Adjust based on your business goals and tax obligations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
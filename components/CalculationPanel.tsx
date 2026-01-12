// CalculationPanel.tsx - NEW FILE
import React from 'react';
import { CalculationResult } from '../types';

interface CalculationPanelProps {
  calculations: CalculationResult;
}

export const CalculationPanel: React.FC<CalculationPanelProps> = ({ calculations }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-300">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
        <span className="text-sm font-bold text-white">Payment Calculations</span>
        <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold uppercase">Live Calculation</span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <CalculationCard
            title="Full Payment"
            value={calculations.fullPayment}
            color="gray"
            prefix="₹"
          />
          <CalculationCard
            title="Total Discount"
            value={calculations.totalDiscount}
            color="green"
            prefix="₹"
          />
          <CalculationCard
            title="Net Payment"
            value={calculations.netPayment}
            color="blue"
            prefix="₹"
          />
          <CalculationCard
            title="Monthly Payout"
            value={calculations.totalMonthlyPayout}
            color="purple"
            prefix="₹"
          />
          <CalculationCard
            title="Final Payment"
            value={calculations.finalPayment}
            color="indigo"
            prefix="₹"
            highlight={true}
          />
          <CalculationCard
            title="Discount %"
            value={calculations.fullPayment > 0 ? 
              ((calculations.totalDiscount / calculations.fullPayment) * 100).toFixed(2) : 0}
            color="orange"
            suffix="%"
          />
        </div>

        {calculations.monthlyPayouts.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Monthly Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 text-left font-bold text-gray-600">Month</th>
                    <th className="py-2 px-3 text-left font-bold text-gray-600">Target</th>
                    <th className="py-2 px-3 text-left font-bold text-gray-600">Achieved</th>
                    <th className="py-2 px-3 text-left font-bold text-gray-600">Payout/Unit</th>
                    <th className="py-2 px-3 text-left font-bold text-gray-600">Total Payout</th>
                    <th className="py-2 px-3 text-left font-bold text-gray-600">Achievement %</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.monthlyPayouts.map((scheme, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium">{scheme.month}</td>
                      <td className="py-2 px-3">{scheme.targetQuantity.toLocaleString()}</td>
                      <td className="py-2 px-3">{scheme.achievedQuantity.toLocaleString()}</td>
                      <td className="py-2 px-3">₹{scheme.payoutPerUnit.toLocaleString()}</td>
                      <td className="py-2 px-3 font-bold">₹{scheme.totalPayout.toLocaleString()}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          scheme.targetQuantity > 0 ? 
                            (scheme.achievedQuantity >= scheme.targetQuantity ? 
                              'bg-green-100 text-green-800' : 
                              'bg-yellow-100 text-yellow-800') : 
                            'bg-gray-100 text-gray-800'
                        }`}>
                          {scheme.targetQuantity > 0 ? 
                            ((scheme.achievedQuantity / scheme.targetQuantity) * 100).toFixed(1) + '%' : 
                            'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Summary</p>
              <p className="text-sm text-gray-600">
                Final payment after all discounts and monthly payouts
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">₹{calculations.finalPayment.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {calculations.fullPayment > 0 && 
                  `Net discount: ${((calculations.totalDiscount / calculations.fullPayment) * 100).toFixed(2)}%`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CalculationCardProps {
  title: string;
  value: number | string;
  color: 'gray' | 'blue' | 'green' | 'purple' | 'indigo' | 'orange';
  prefix?: string;
  suffix?: string;
  highlight?: boolean;
}

const CalculationCard: React.FC<CalculationCardProps> = ({ 
  title, 
  value, 
  color, 
  prefix = '', 
  suffix = '',
  highlight = false 
}) => {
  const colorClasses = {
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  const highlightClasses = highlight 
    ? 'ring-2 ring-indigo-500 ring-offset-2' 
    : '';

  return (
    <div className={`p-4 rounded-2xl border ${colorClasses[color]} ${highlightClasses}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1">{title}</p>
      <p className="text-xl font-bold">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
    </div>
  );
};

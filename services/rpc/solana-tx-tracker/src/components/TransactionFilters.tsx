import { useState } from 'react';

export interface TransactionFilters {
  status: 'all' | 'success' | 'failed';
  timeRange: 'all' | 'today' | 'week' | 'month' | 'year';
  hasMemo: boolean | null;
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFilterChange: (filters: TransactionFilters) => void;
}

export default function TransactionFiltersComponent({ filters, onFilterChange }: TransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleStatusChange = (status: 'all' | 'success' | 'failed') => {
    onFilterChange({ ...filters, status });
  };

  const handleTimeRangeChange = (timeRange: 'all' | 'today' | 'week' | 'month' | 'year') => {
    onFilterChange({ ...filters, timeRange });
  };

  const handleMemoFilterChange = (hasMemo: boolean | null) => {
    onFilterChange({ ...filters, hasMemo });
  };

  return (
    <div className="mb-4 border rounded-lg p-3 bg-gray-50 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-900">Filters</h3>
        <button 
          className="text-blue-700 text-sm font-medium hover:text-blue-800"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-4">
          {/* Status Filter */}
          <div>
            <p className="text-sm font-semibold mb-2 text-gray-900">Status</p>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded font-medium ${
                  filters.status === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                }`}
                onClick={() => handleStatusChange('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 text-sm rounded font-medium ${
                  filters.status === 'success' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                }`}
                onClick={() => handleStatusChange('success')}
              >
                Success
              </button>
              <button
                className={`px-3 py-1 text-sm rounded font-medium ${
                  filters.status === 'failed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                }`}
                onClick={() => handleStatusChange('failed')}
              >
                Failed
              </button>
            </div>
          </div>

          {/* Time Range Filter */}
          <div>
            <p className="text-sm font-semibold mb-2 text-gray-900">Time Range</p>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 text-sm rounded font-medium ${
                  filters.timeRange === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                }`}
                onClick={() => handleTimeRangeChange('all')}
              >
                All Time
              </button>
              <button
                className={`px-3 py-1 text-sm rounded font-medium ${
                  filters.timeRange === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                }`}
                onClick={() => handleTimeRangeChange('today')}
              >
                Today
              </button>
              <button
                className={`px-3 py-1 text-sm rounded font-medium ${
                  filters.timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                }`}
                onClick={() => handleTimeRangeChange('week')}
              >
                This Week
              </button>
              <button
                className={`px-3 py-1 text-sm rounded font-medium ${
                  filters.timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                }`}
                onClick={() => handleTimeRangeChange('month')}
              >
                This Month
              </button>
              <button
                className={`px-3 py-1 text-sm rounded font-medium ${
                  filters.timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                }`}
                onClick={() => handleTimeRangeChange('year')}
              >
                This Year
              </button>
            </div>
          </div>

          {/* Memo Filter */}
          <div>
            <p className="text-sm font-semibold mb-2 text-gray-900">Memo</p>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded font-medium ${
                  filters.hasMemo === null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                }`}
                onClick={() => handleMemoFilterChange(null)}
              >
                Any
              </button>
              <button
                className={`px-3 py-1 text-sm rounded font-medium ${
                  filters.hasMemo === true ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                }`}
                onClick={() => handleMemoFilterChange(true)}
              >
                With Memo
              </button>
              <button
                className={`px-3 py-1 text-sm rounded font-medium ${
                  filters.hasMemo === false ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                }`}
                onClick={() => handleMemoFilterChange(false)}
              >
                Without Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

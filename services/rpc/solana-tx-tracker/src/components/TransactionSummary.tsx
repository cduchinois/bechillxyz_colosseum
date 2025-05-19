// Define the types locally to avoid dependency on library
interface TransactionPageInfo {
  page: number;
  blocktime: number;
  lastSignature: string;
  nb_transaction: number;
}

interface TransactionSummary {
  address: string;
  firstTransactionDate: string;
  nb_all_transactions: number;
  pages: TransactionPageInfo[];
}

interface TransactionSummaryProps {
  summary: TransactionSummary;
}

export default function TransactionSummaryComponent({ summary }: TransactionSummaryProps) {
  const mostRecentDate = summary.pages[0]?.blocktime 
    ? new Date(summary.pages[0].blocktime * 1000).toLocaleString() 
    : 'N/A';
    
  const timeRange = (summary.firstTransactionDate && summary.pages[0]?.blocktime) 
    ? calculateTimeRange(new Date(summary.firstTransactionDate), new Date(summary.pages[0].blocktime * 1000))
    : 'N/A';

  return (
    <div className="w-full max-w-3xl mx-auto my-6 p-6 bg-white border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Transaction Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-800 font-medium">Address</p>
          <a 
            href={`https://explorer.solana.com/address/${summary.address}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium truncate text-blue-600 hover:underline block"
          >
            {summary.address}
          </a>
        </div>
        <div>
          <p className="text-gray-800 font-medium">First Transaction</p>
          <p className="font-medium text-gray-900">
            {summary.firstTransactionDate 
              ? new Date(summary.firstTransactionDate).toLocaleString() 
              : 'N/A'
            }
          </p>
        </div>
        <div>
          <p className="text-gray-800 font-medium">Most Recent Transaction</p>
          <p className="font-medium text-gray-900">{mostRecentDate}</p>
        </div>
        <div>
          <p className="text-gray-800 font-medium">Activity Timespan</p>
          <p className="font-medium text-gray-900">{timeRange}</p>
        </div>
        <div>
          <p className="text-gray-800 font-medium">Total Transactions</p>
          <p className="font-medium text-gray-900">{summary.nb_all_transactions.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-800 font-medium">Pages Fetched</p>
          <p className="font-medium text-gray-900">{summary.pages.length}</p>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate the time range between two dates
function calculateTimeRange(startDate: Date, endDate: Date): string {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 365) {
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  } else if (diffDays > 30) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  } else if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  } else {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
    } else {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'}`;
    }
  }
}

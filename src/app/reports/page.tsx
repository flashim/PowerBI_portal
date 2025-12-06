import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports | Power BI Portal',
  description: 'View all available Power BI reports',
};

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Reports</h1>
        <p className="text-gray-600 mb-8">
          This page will display a list of available reports. Add your report configurations here.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example report card */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sales Analytics</h2>
            <p className="text-gray-600 text-sm mb-4">
              Comprehensive sales metrics and KPIs for your organization.
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              View Report →
            </button>
          </div>

          {/* More reports can be added here */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Customer Insights</h2>
            <p className="text-gray-600 text-sm mb-4">
              Deep dive into customer behavior and segmentation.
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              View Report →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Financial Summary</h2>
            <p className="text-gray-600 text-sm mb-4">
              Financial performance and budget tracking.
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              View Report →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

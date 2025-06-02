export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Tech Dashboard Successfully Disabled
        </h1>
        <p className="text-gray-600 mb-6">
          The tech functionality has been completely removed from the application.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>Available for admin access only</p>
          <p>No technician features will load</p>
        </div>
      </div>
    </div>
  );
}
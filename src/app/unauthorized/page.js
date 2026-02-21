import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-600 to-red-800">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">403</h1>
        <p className="text-xl text-red-100 mb-8">
          You don't have permission to access this page
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-white text-red-600 font-bold px-8 py-3 rounded-lg hover:bg-red-50 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

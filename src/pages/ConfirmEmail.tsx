// Email confirmation page - User is already verified by Supabase before landing here
// This page just shows success message and prompts user to open the app

export default function ConfirmEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Berhasil Dikonfirmasi!</h1>
          <p className="text-gray-600 mb-6">
            Akun Anda sudah aktif. Silakan buka aplikasi Taaruf Samara untuk login.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-emerald-800">
              <strong>Selanjutnya:</strong> Buka aplikasi Taaruf Samara di HP Anda dan login dengan akun yang sudah dikonfirmasi.
            </p>
          </div>
          <a href="taarufsamara://app" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline">
            Buka Aplikasi Taaruf Samara
          </a>
        </div>
      </div>
    </div>
  );
}

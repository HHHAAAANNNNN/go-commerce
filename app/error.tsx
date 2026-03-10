'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
        toast.error('Gagal memproses permintaan Anda: ' + error.message);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Terjadi Kesalahan</h2>
                <p className="text-gray-400 mb-8 break-words text-sm">
                    {error.message || 'Kami sedang mengalami masalah teknis. Silakan coba beberapa saat lagi.'}
                </p>

                <button
                    onClick={() => reset()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
                >
                    Coba Lagi
                </button>
            </div>
        </div>
    );
}


interface SpinnerProps {
  className?: string;
}

export function Spinner({ className = '' }: SpinnerProps) {
  return (
    // <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 ${className}`}>
    //   <style jsx>{`
    //     .animate-spin {
    //       animation: spin 1s linear infinite;
    //     }
    //     @keyframes spin {
    //       from { transform: rotate(0deg); }
    //       to { transform: rotate(360deg); }
    //     }
    //   `}</style>
    // </div>

    <div className={`inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-[-0.125em] ${className}`}>
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
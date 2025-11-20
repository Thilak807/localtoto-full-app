import React from 'react'

const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white/90">
      <div className="w-full max-w-sm px-6">
        <div className="relative w-full mb-2">
          {/* Single track with inner fill */}
          <div className="w-full h-3 bg-gray-200/90 rounded-full overflow-visible relative">
            <div className="h-full bg-green-500 rounded-full progress-anim relative">
              <img
                src="/icons/rickshaw.png"
                alt="Loading"
                className="absolute -top-8 right-0 h-12 w-auto"
              />
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-700 font-medium">
          {message || 'Loading...'}
        </div>
      </div>
      <style>{`
        @keyframes progressWidth { from { width: 0%; } to { width: 100%; } }
        .progress-anim { animation: progressWidth 1.8s ease-out forwards; }
      `}</style>
    </div>
  )
}

export default LoadingOverlay



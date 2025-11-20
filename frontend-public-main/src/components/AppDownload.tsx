import { CarFront } from 'lucide-react';

const AppDownload = () => {
  return (
    <section className="py-20 bg-green-600 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-green-500 opacity-50"></div>
        <div className="absolute bottom-32 -left-16 w-80 h-80 rounded-full bg-green-700 opacity-30"></div>
      </div>
      
      <div className="container-classic relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="flex flex-col items-start mb-4">
              <img 
                src="/full_logo.png" 
                alt="Local ToTo" 
                className="h-12 md:h-14 object-contain mb-3 filter brightness-0 invert"
              />
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Download the App
              </h2>
            </div>
            <p className="text-lg opacity-90 max-w-lg">
              Get the convenience of booking e-rickshaws right from your smartphone. 
              Track your ride in real-time, save favorite routes, and enjoy exclusive app-only offers.
            </p>
            
            <div className="pt-4 space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
              <a href="#" className="flex items-center justify-center sm:justify-start bg-black text-white rounded-lg px-4 py-3 w-full sm:w-auto hover:bg-gray-900 transition-colors duration-300">
                <svg viewBox="0 0 24 24" className="w-7 h-7 mr-3" fill="currentColor">
                  <path d="M17.9,19.9l-5.4,3c-0.8,0.5-1.8,0.5-2.6,0l-5.4-3C3.7,19.4,3,18.7,3,17.8V6.9C3,6,3.7,5.3,4.5,4.8l5.4-3
                    c0.8-0.5,1.8-0.5,2.6,0l5.4,3C18.7,5.3,19.4,6,19.4,6.9v10.9C19.4,18.7,18.7,19.4,17.9,19.9z M12,3.1L6.6,6.2v11.7L12,21l5.4-3.1
                    V6.2L12,3.1z M14.9,8.4c0.2-0.2,0.5-0.2,0.7,0l0,0c0.2,0.2,0.2,0.5,0,0.7l-3.1,3.1c-0.2,0.2-0.2,0.5,0,0.7l3.1,3.1
                    c0.2,0.2,0.2,0.5,0,0.7l0,0c-0.2,0.2-0.5,0.2-0.7,0l-3.5-3.5c-0.2-0.2-0.2-0.5,0-0.7L14.9,8.4z"/>
                </svg>
                <div className="text-left">
                  <p className="text-xs">Download on the</p>
                  <p className="text-lg font-semibold -mt-1">App Store</p>
                </div>
              </a>
              
              <a href="#" className="flex items-center justify-center sm:justify-start bg-black text-white rounded-lg px-4 py-3 w-full sm:w-auto hover:bg-gray-900 transition-colors duration-300">
                <svg viewBox="0 0 24 24" className="w-7 h-7 mr-3" fill="currentColor">
                  <path d="M5.5,3.5C5,4,4.5,4.8,4.5,5.8c0,1,0.4,1.8,1.1,2.5c0.7,0.6,1.5,0.9,2.4,0.9s1.8-0.3,2.4-0.9s1.1-1.5,1.1-2.5
                    c0-0.1,0-0.1,0-0.2c0-0.1,0-0.2-0.1-0.3l0,0c-0.2-1-0.7-1.8-1.4-2.3C9.4,2.4,8.7,2.2,7.9,2.2C7,2.2,6.2,2.5,5.5,3.5z M15.5,20.2
                    l3.1-1.8c0.4-0.2,0.6-0.5,0.7-0.9c0.1-0.4,0-0.8-0.3-1.1l-2.2-2.2l-3.1,3.1l0,0L15.5,20.2z M13.8,18.6L16.9,9l-3-3L4.4,16.4l3,3
                    L13.8,18.6z M8,17.7l-1.6,0.9l-1.3-1.3l0.9-1.6L8,17.7z"/>
                </svg>
                <div className="text-left">
                  <p className="text-xs">GET IT ON</p>
                  <p className="text-lg font-semibold -mt-1">Google Play</p>
                </div>
              </a>
            </div>
            
            <div className="pt-6 flex items-center">
              <div className="flex -space-x-2">
                <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="User" />
                <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="User" />
                <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="User" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">Trusted by</p>
                <p className="text-xl font-bold">50,000+ users</p>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-green-400/20 transform rotate-6 rounded-3xl blur-xl"></div>
              <div className="bg-white rounded-3xl overflow-hidden border-8 border-white shadow-2xl relative z-10 max-w-xs">
                <div className="h-10 bg-gray-100 flex items-center justify-center rounded-t-lg">
                  <div className="w-20 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <div className="w-full h-96 bg-white">
                  <div className="h-full flex flex-col p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                      <div className="h-3 w-12 bg-gray-200 rounded" />
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <div className="text-sm font-semibold text-green-800">Book an E‑Rickshaw</div>
                      <div className="mt-2 grid grid-cols-6 gap-2 text-xs text-green-900">
                        <div className="col-span-6 bg-white/70 rounded-lg px-3 py-2 border border-green-100">
                          Pickup: Your location
                        </div>
                        <div className="col-span-6 bg-white/70 rounded-lg px-3 py-2 border border-green-100">
                          Destination: Enter address
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 p-3">
                      <div className="h-full w-full rounded-lg bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                        <CarFront className="w-12 h-12 text-green-700" aria-label="Auto" />
                      </div>
                    </div>
                    <button className="w-full py-3 rounded-lg btn btn-primary">
                      Request E‑Rickshaw
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
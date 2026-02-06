
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#001f3f] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/50 to-slate-900/80"></div>
      
      {/* Main Animation Container */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Logo Container with Ripple Effect */}
        <div className="relative mb-8">
          {/* Animated Rings */}
          <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute inset-[-10px] bg-emerald-500 rounded-full opacity-10 animate-pulse delay-75"></div>
          
          {/* Logo Image */}
          <div className="relative w-40 h-40 bg-white rounded-full p-1 shadow-2xl shadow-blue-500/50 animate-[bounce_2s_infinite]">
            <img 
              src="logo.svg" 
              alt="Speed Delivery" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>

        {/* Text Animation */}
        <div className="text-center space-y-2 animate-[slideUp_0.8s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">
            SPEED <span className="text-emerald-400">DELIVERY</span>
          </h1>
          <p className="text-blue-200 text-sm font-bold tracking-[0.5em] uppercase">Ouargla</p>
        </div>

        {/* Loading Bar */}
        <div className="mt-12 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500 w-[50%] animate-[loading_1.5s_infinite_linear]"></div>
        </div>
      </div>

      {/* CSS Keyframes for custom animations */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes loading {
          0% { left: -50%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;

import React from 'react';

const Navigation = () => {
  return (
    <header className="justify-between items-center backdrop-blur-[10px] bg-[rgba(0,0,0,0.10)] absolute z-50 flex min-h-[60px] w-full text-white h-[60px] px-1.5 py-3.5 border-b-[rgba(255,255,255,0.10)] border-b border-solid top-0 max-md:max-w-full">
      <div className="self-stretch flex min-w-60 w-full max-w-screen-xl mx-auto gap-[40px_100px] justify-between flex-wrap my-auto px-4">
        <div className="flex min-w-60 items-center gap-5 whitespace-nowrap">
          <div className="self-stretch flex items-center gap-1 text-lg font-bold tracking-[-0.9px] my-auto p-1">
            <img
              src="https://api.builder.io/api/v1/image/assets/a296e6f6909345febc364568fca847ed/287d02f5b15436f84cb0b3b36e585320804b8ba8?placeholderIfAbsent=true"
              className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
              alt="Stellar Logo"
            />
            <div className="text-white self-stretch my-auto">
              Stellar
            </div>
          </div>
          <nav className="self-stretch flex min-w-60 gap-2.5 text-sm font-medium leading-none my-auto">
            <button className="justify-center items-center flex gap-2 overflow-hidden px-4 py-1.5 rounded-[99px] hover:bg-white/10 transition-colors">
              <div className="text-white self-stretch my-auto">
                Product
              </div>
            </button>
            <button className="justify-center items-center flex gap-2 overflow-hidden px-4 py-1.5 rounded-[99px] hover:bg-white/10 transition-colors">
              <div className="text-white self-stretch my-auto">
                Pricing
              </div>
            </button>
            <button className="justify-center items-center flex gap-2 overflow-hidden px-4 py-1.5 rounded-[99px] hover:bg-white/10 transition-colors">
              <div className="text-white self-stretch my-auto">
                Changelog
              </div>
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-2.5 text-sm font-medium leading-none">
          <button className="justify-center items-center self-stretch flex gap-2 overflow-hidden my-auto px-4 py-1.5 rounded-[99px] hover:bg-white/10 transition-colors">
            <div className="text-white self-stretch my-auto">
              Log in
            </div>
          </button>
          <button className="items-center border shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] self-stretch flex gap-2 overflow-hidden my-auto px-4 py-1.5 rounded-lg border-solid border-[rgba(255,255,255,0.07)] hover:bg-white/5 transition-colors">
            <div className="text-white self-stretch my-auto">
              Sign up
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;

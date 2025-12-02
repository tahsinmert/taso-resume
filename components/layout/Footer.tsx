import React from "react";

const Footer = () => {
  return (
    <footer className="backdrop-blur-md w-full mt-auto print:hidden relative z-20">
      <div className="w-full m-auto text-center max-w-screen-xl p-4">
        <div className="text-sm text-gray-500 sm:text-center">
          <div className="text-xs text-gray-400">
            <span className="text-gray-500">Coded with</span>{" "}
            <span className="text-primary-600 font-medium">❤️</span>{" "}
            <span className="text-gray-500">by</span>{" "}
            <span className="text-primary-600 font-semibold hover:text-primary-700 transition-colors cursor-default">
              Tahsin Mert Mutlu
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


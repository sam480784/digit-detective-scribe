
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full animate-slide-down">
      <div className="container mx-auto px-4 py-6 flex flex-col items-center">
        <div className="chip mb-2">Machine Learning</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
          Handwritten Digit Recognition
        </h1>
        <p className="mt-3 text-muted-foreground text-center max-w-lg">
          Draw a single digit (0-9) in the canvas below and watch as the system recognizes it in real-time.
        </p>
      </div>
    </header>
  );
};

export default Header;

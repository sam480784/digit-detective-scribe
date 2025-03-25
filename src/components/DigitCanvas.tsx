
import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface DigitCanvasProps {
  onImageData: (imageData: ImageData) => void;
}

const DigitCanvas: React.FC<DigitCanvasProps> = ({ onImageData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [hasDrawing, setHasDrawing] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (context) {
      // Set canvas to be square
      const size = Math.min(canvas.parentElement?.clientWidth || 280, 280);
      canvas.width = size;
      canvas.height = size;
      
      // Set up canvas styling
      context.lineWidth = 20;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = 'black';
      context.fillStyle = 'white';
      
      // Fill with white background
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      setCtx(context);
    }
    
    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current || !context) return;
      
      // Store the current image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Resize canvas
      const size = Math.min(canvas.parentElement?.clientWidth || 280, 280);
      canvas.width = size;
      canvas.height = size;
      
      // Reset context properties as they get reset on resize
      context.lineWidth = 20;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = 'black';
      
      // Restore the image
      context.putImageData(imageData, 0, 0);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ctx) return;
    
    setIsDrawing(true);
    setHasDrawing(true);
    
    // Get coordinates
    let x, y;
    if ('touches' in e) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    
    // Get coordinates
    let x, y;
    if ('touches' in e) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const endDrawing = () => {
    if (!isDrawing || !ctx || !canvasRef.current) return;
    
    setIsDrawing(false);
    ctx.closePath();
    
    // Send image data for prediction
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    onImageData(imageData);
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    
    setHasDrawing(false);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Reset prediction
    const emptyImageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    onImageData(emptyImageData);
  };

  // Add touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling when drawing
    startDrawing(e);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    draw(e);
  };
  
  const handleTouchEnd = () => {
    endDrawing();
  };

  return (
    <div className="w-full max-w-xs mx-auto canvas-container animate-fade-in">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="touch-none"
      />
      {hasDrawing && (
        <button 
          onClick={clearCanvas}
          className="digit-btn absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm"
          aria-label="Clear canvas"
        >
          <X size={24} className="text-gray-800" />
        </button>
      )}
    </div>
  );
};

export default DigitCanvas;

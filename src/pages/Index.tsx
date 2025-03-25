
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import DigitCanvas from '../components/DigitCanvas';
import PredictionDisplay from '../components/PredictionDisplay';
import { digitRecognizer, type Prediction } from '../lib/recognitionModel';

const Index: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  
  // Check if model is loaded
  useEffect(() => {
    const checkModel = () => {
      const isLoaded = digitRecognizer.isModelLoaded();
      setModelReady(isLoaded);
      
      if (!isLoaded) {
        // Check again in a second
        setTimeout(checkModel, 1000);
      }
    };
    
    checkModel();
  }, []);
  
  const handleImageData = async (imageData: ImageData) => {
    // Skip prediction if the image is empty/white
    const data = imageData.data;
    let hasDrawing = false;
    
    // Check if there's any non-white pixel
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 255 || data[i + 1] < 255 || data[i + 2] < 255) {
        hasDrawing = true;
        break;
      }
    }
    
    if (!hasDrawing) {
      setPredictions(null);
      return;
    }
    
    // Set processing state
    setIsProcessing(true);
    
    try {
      // Add a small delay to make the UI feel more responsive
      setTimeout(async () => {
        const results = await digitRecognizer.predict(imageData);
        setPredictions(results);
        setIsProcessing(false);
      }, 200);
    } catch (error) {
      console.error('Prediction error:', error);
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      {/* Glassmorphism background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      </div>
      
      <div className="container max-w-3xl mx-auto">
        <Header />
        
        <main className="mt-10 flex flex-col items-center">
          {!modelReady && (
            <div className="mb-8 p-4 glass-panel rounded-xl animate-pulse-subtle">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-primary animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading recognition model...</p>
              </div>
            </div>
          )}
          
          <DigitCanvas onImageData={handleImageData} />
          
          <PredictionDisplay 
            predictions={predictions} 
            isProcessing={isProcessing} 
          />
          
          <div className="mt-16 text-center text-sm text-muted-foreground max-w-md">
            <p>
              This system uses a TensorFlow.js model trained on the MNIST dataset
              to recognize handwritten digits from 0 to 9.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;


import React, { useState, useEffect } from 'react';

interface PredictionDisplayProps {
  predictions: Array<{ digit: number; probability: number }> | null;
  isProcessing: boolean;
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ 
  predictions, 
  isProcessing 
}) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (predictions && predictions.length > 0) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [predictions]);

  if (!visible) return null;

  const topPrediction = predictions?.[0];
  const restPredictions = predictions?.slice(1, 4) || [];

  return (
    <div className="mt-8 w-full max-w-xs mx-auto result-card">
      {isProcessing ? (
        <div className="flex flex-col items-center justify-center py-4">
          <div className="h-12 w-12 rounded-full border-t-2 border-primary animate-spin" />
          <p className="mt-4 text-muted-foreground">Analyzing...</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-4">
            <div className="chip mx-auto">Recognition Result</div>
          </div>
          
          {topPrediction && (
            <div className="flex flex-col items-center">
              <div className="text-6xl font-bold mb-2 text-primary">
                {topPrediction.digit}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {(topPrediction.probability * 100).toFixed(1)}% confidence
              </div>
              
              {restPredictions.length > 0 && (
                <div className="w-full mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-2">
                    Other possibilities:
                  </div>
                  <div className="flex justify-between gap-2">
                    {restPredictions.map((pred) => (
                      <div key={pred.digit} className="flex-1 text-center p-2 rounded-lg bg-secondary">
                        <div className="font-medium">{pred.digit}</div>
                        <div className="text-xs text-muted-foreground">
                          {(pred.probability * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PredictionDisplay;


import * as tf from '@tensorflow/tfjs';

// Define interface for prediction results
export interface Prediction {
  digit: number;
  probability: number;
}

class DigitRecognitionModel {
  private model: tf.LayersModel | null = null;
  private isLoading: boolean = false;
  
  constructor() {
    this.loadModel();
  }
  
  private async loadModel(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Load the pre-trained model
      this.model = await tf.loadLayersModel(
        'https://storage.googleapis.com/tfjs-models/tfjs/mnist_v1/model.json'
      );
      
      // Warm up the model
      const dummyInput = tf.zeros([1, 28, 28, 1]);
      this.model.predict(dummyInput);
      dummyInput.dispose();
      
      console.log('Digit recognition model loaded successfully');
    } catch (error) {
      console.error('Failed to load digit recognition model:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  public async predict(imageData: ImageData): Promise<Prediction[] | null> {
    // If model is not loaded yet or is loading
    if (!this.model) {
      if (this.isLoading) {
        console.log('Model is still loading...');
        return null;
      }
      
      // Try to load the model again
      await this.loadModel();
      if (!this.model) {
        console.error('Model could not be loaded');
        return null;
      }
    }
    
    // Process the image to match MNIST format
    const tensor = this.preprocessImage(imageData);
    
    // Run prediction
    const predictions = this.model.predict(tensor) as tf.Tensor;
    const probabilities = await predictions.data();
    
    // Cleanup tensors
    tensor.dispose();
    predictions.dispose();
    
    // Format and sort results
    const results: Prediction[] = Array.from(probabilities)
      .map((probability, digit) => ({ digit, probability }))
      .sort((a, b) => b.probability - a.probability);
    
    return results;
  }
  
  private preprocessImage(imageData: ImageData): tf.Tensor {
    return tf.tidy(() => {
      // Convert the image data to a tensor
      let tensor = tf.browser.fromPixels(imageData, 1);
      
      // Resize to 28x28
      tensor = tf.image.resizeBilinear(tensor, [28, 28]);
      
      // Normalize: invert colors and divide by 255
      tensor = tf.scalar(1).sub(tensor.div(tf.scalar(255)));
      
      // Reshape to match model input
      return tensor.expandDims(0);
    });
  }
  
  public isModelLoaded(): boolean {
    return this.model !== null;
  }
}

// Create a singleton instance
export const digitRecognizer = new DigitRecognitionModel();

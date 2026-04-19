
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

class ObjectDetectionService {
    constructor() {
        this.model = null;
        this.isInitialized = false;
        this.detectedObjects = [];
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log("ObjectDetectionService: Initializing COCO-SSD...");
        // Use a backend like webgl for performance
        await tf.ready();
        this.model = await cocoSsd.load({
            base: 'mobilenet_v2' // Lightweight version
        });
        
        this.isInitialized = true;
        console.log("ObjectDetectionService: Initialized");
    }

    async detect(videoElement) {
        if (!this.isInitialized || !this.model) return [];

        try {
            const predictions = await this.model.detect(videoElement);
            
            // Filter for suspicious objects
            const suspiciousClasses = ['cell phone', 'laptop', 'book', 'tablet'];
            const violations = predictions.filter(pred => 
                suspiciousClasses.includes(pred.class.toLowerCase()) && pred.score > 0.6
            );

            return violations;
        } catch (e) {
            // console.error("Detection error", e);
            return [];
        }
    }

    stop() {
        this.isInitialized = false;
        this.model = null;
        console.log("ObjectDetectionService: Stopped");
    }
}

export const objectDetectionService = new ObjectDetectionService();

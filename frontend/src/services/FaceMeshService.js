
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

class FaceMeshService {
    constructor() {
        this.faceMesh = null;
        this.camera = null;
        this.videoElement = null;
        this.onResultsCallback = null;
        this.isInitialized = false;
    }

    async initialize(onResults) {
        if (this.isInitialized) {
            console.log("FaceMeshService: Re-initializing");
            // If already initialized, just update the callback
            this.onResultsCallback = onResults;
            return;
        }

        this.onResultsCallback = onResults;

        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.faceMesh.onResults(this.handleResults.bind(this));

        // Initialize the model (send a dummy/empty frame or wait for first send)
        await this.faceMesh.initialize();

        this.isInitialized = true;
        console.log("FaceMeshService: Initialized");
    }

    async send(videoElement) {
        if (!this.isInitialized || !this.faceMesh) return;

        try {
            await this.faceMesh.send({ image: videoElement });
        } catch (e) {
            // console.error("FaceMesh send error", e); // Suppress frequent errors if frame not ready
        }
    }

    handleResults(results) {
        // results.multiFaceLandmarks is an array of faces.
        // Each face is an array of 478 landmarks {x, y, z}.
        if (this.onResultsCallback) {
            const analysis = this.analyzeFace(results);
            this.onResultsCallback(analysis);
        }
    }

    analyzeFace(results) {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            return {
                status: 'NO_FACE',
                message: 'No face detected',
                score: 0
            };
        }

        const landmarks = results.multiFaceLandmarks[0];

        // 1. Gaze Tracking / Head Pose
        // Simple Head Pose using nose tip and face edges
        // Nose tip: 1
        // Left Cheeck: 234
        // Right Cheek: 454

        const nose = landmarks[1];
        const leftCheek = landmarks[234];
        const rightCheek = landmarks[454];
        const forehead = landmarks[10];
        const chin = landmarks[152];

        // Yaw (Turning Left/Right)
        // Midpoint between cheeks
        const midX = (leftCheek.x + rightCheek.x) / 2;
        const yaw = nose.x - midX;

        // Pitch (Looking Up/Down)
        // Face height
        const faceHeight = chin.y - forehead.y;
        // Nose relative vertical position 
        const noseRelativeY = (nose.y - forehead.y) / faceHeight;

        let status = 'SAFE';
        let message = '';
        let score = 100;

        // Thresholds (Tuned for typical webcam usage)
        // Yaw: > 0.1 means significant turn
        // Pitch: < 0.3 (Up), > 0.7 (Down)

        if (Math.abs(yaw) > 0.12) {
            status = 'WARNING';
            message = 'Looking Away (Side)';
            score = 70;
        } else if (noseRelativeY < 0.25) {
            status = 'WARNING';
            message = 'Looking Away (Up)';
            score = 70;
        } else if (noseRelativeY > 0.75) {
            status = 'WARNING';
            message = 'Looking Away (Down)';
            score = 60; // Looking down is more suspicious (phone)
        }

        return {
            status,
            message,
            score,
            details: { yaw, noseRelativeY }
        };
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.faceMesh) {
            this.faceMesh.close();
        }
        this.isInitialized = false;
    }
}

export const faceMeshService = new FaceMeshService();

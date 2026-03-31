import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

let detector: poseDetection.PoseDetector | null = null;

export async function detectPose(imageElement: HTMLImageElement | HTMLCanvasElement) {
  if (!detector) {
    await tf.ready(); // ensure webgl is bound
    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    };
    detector = await poseDetection.createDetector(model, detectorConfig);
  }

  const poses = await detector.estimatePoses(imageElement);
  if (poses.length > 0) {
    return poses[0].keypoints;
  }
  return null;
}

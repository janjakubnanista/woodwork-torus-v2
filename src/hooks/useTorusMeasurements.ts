// Wood segment vertex coords in polar coordinate system
// for easy trasformation along the ring. We don't even need the second angle coordinate

import { useMemo } from "react";

// since we can set it to 0
export interface TorusSegment {
  r0: number;
  r1: number;
  phi: number;
}

export interface TorusLayer {
  width: number;
  length: number;
  height: number;
  segmentLength: number;
  segment: TorusSegment;
}

export interface TorusMeasurements {
  ringCenterRadius: number;
  layers: TorusLayer[];
}

const EMPTY_MEASUREMENTS: TorusMeasurements = {
  ringCenterRadius: 0,
  layers: []
};

export default function useTorusMeasurements(
  ringDiameter: number,
  torusDiameter: number,
  numSegments: number,
  materialThickness: number,
  kerf: number = 2.2
): TorusMeasurements {
  return useMemo((): TorusMeasurements => {
    if (materialThickness === 0) {
      return EMPTY_MEASUREMENTS;
    }

    const ringRadius = ringDiameter / 2;
    const torusRadius = torusDiameter / 2;
    const ringCenterRadius = ringRadius - torusRadius;

    // Radial length of the segment, in radians
    const segmentPhi = (Math.PI * 2) / numSegments;

    const layers: TorusLayer[] = [];

    // The torus will be formed out of layers material
    // with specific thickness so what we gonna do is start at the center
    // and build up the torus from the widest bottom layer to the narrowest top one.
    // This will form half a torus, then we glue.
    //
    // h is the current "y" coordinate of the torus layer, we'll be increasing it by material thickness
    let h = 0;
    while (h < torusRadius) {
      // Pythagoras
      const layerRadius = Math.sqrt(torusRadius * torusRadius - h * h);

      // The inner segment point lies on the circle since it is inscribed
      const r0 = ringCenterRadius - layerRadius;

      // The outer one though lies outside the circle, on a tangent running
      // perpendicular to the segment
      const r1 = (ringCenterRadius + layerRadius) / Math.cos(segmentPhi / 2);
      const width = (r1 - r0) * Math.cos(segmentPhi / 2);
      const segmentLength = 2 * r1 * Math.sin(segmentPhi / 2);
      const segmentOverlap = width * Math.tan(segmentPhi / 2);
      const segment = { r0, r1, phi: segmentPhi };
      const height = Math.min(materialThickness, torusRadius - h);
      const length =
        segmentLength +
        (numSegments - 1) * (segmentLength - segmentOverlap) +
        numSegments * kerf;

      layers.push({ segmentLength, width, length, segment, height });

      h += materialThickness;
    }

    return {
      ringCenterRadius,
      layers
    };
  }, [ringDiameter, torusDiameter, numSegments, materialThickness, kerf]);
}

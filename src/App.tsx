import * as React from "react";
import "./styles.css";

import { useState } from "react";
import useTorusMeasurements from "./hooks/useTorusMeasurements";

const COLORS = "FC0 CF0 0CF 0FC D70 07D 70D".split(" ");
const getColor = (index: number): string => `#${COLORS[index % COLORS.length]}`;

interface Props {}

export default function App(props: Props) {
  const [numSegments, setNumSegments] = useState<number>(8);
  const [innerDiameter, setInnerDiameter] = useState<number>(100);
  const [outerDiameter, setOuterDiameter] = useState<number>(400);
  const [materialtorusDiameter, setMaterialtorusDiameter] = useState<number>(
    18
  );

  const torusDiameter = (outerDiameter - innerDiameter) / 2;
  const ringRadius = outerDiameter / 2;
  const torusRadius = torusDiameter / 2;

  const measurements = useTorusMeasurements(
    outerDiameter,
    torusDiameter,
    numSegments,
    materialtorusDiameter
  );

  const segmentAngles = Array.from({ length: numSegments }).map(
    (_, index) => (index * Math.PI * 2) / numSegments
  );

  return (
    <div>
      <div>
        <label>
          Inner diameter
          <input
            type="number"
            value={innerDiameter}
            onChange={(event) => setInnerDiameter(Number(event.target.value))}
          />
          mm
        </label>
        <label>
          Outer diameter
          <input
            type="number"
            value={outerDiameter}
            onChange={(event) => setOuterDiameter(Number(event.target.value))}
          />
          mm
        </label>

        <label>
          No. Segments
          <input
            type="number"
            value={numSegments}
            onChange={(event) => setNumSegments(Number(event.target.value))}
          />
        </label>

        <label>
          Material thickness
          <input
            type="number"
            value={materialtorusDiameter}
            onChange={(event) =>
              setMaterialtorusDiameter(Number(event.target.value))
            }
          />
          mm
        </label>
      </div>

      <div className="results">
        <table>
          <thead>
            <tr>
              <th>No. layers</th>
              <th>Center radius</th>
              <th>Torus radius</th>
              <th>Torus diameter</th>
              <th>Mitre angle</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{measurements.layers.length}</td>
              <td>{measurements.ringCenterRadius}mm</td>
              <td>{torusRadius}mm</td>
              <td>{torusRadius * 2}mm</td>
              <td>{180 / numSegments}°</td>
            </tr>
          </tbody>
        </table>

        <table cellSpacing="0">
          <thead>
            <tr>
              <th>Layer</th>
              <th>Width [mm]</th>
              <th>Height [mm]</th>
              <th>Segment length (long side) [mm]</th>
              <th>Total length [mm]</th>
              <th>Max radius [mm]</th>
            </tr>
          </thead>
          <tbody>
            {measurements.layers.map((layer, index) => {
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{Math.ceil(layer.width)}</td>
                  <td>{Math.ceil(layer.height)}</td>
                  <td>{Math.ceil(layer.segmentLength)}</td>
                  <td>{Math.ceil(layer.length)}</td>
                  <td>{Math.ceil(layer.segment.r1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <svg
        viewBox={`${-ringRadius - 20} ${-ringRadius - 20} ${
          ringRadius * 2 + 40
        } ${ringRadius * 2 + 40}`}
        width="640"
        height="640"
      >
        {/* The rings */}
        {measurements.layers.map(({ segment }, layerIndex) => {
          const offset = ((layerIndex % 2) * segment.phi) / 2;
          const layerColor = getColor(layerIndex);

          return (
            <>
              {segmentAngles.map((_, index) => {
                const cos0 = Math.cos(segment.phi * index + offset);
                const sin0 = Math.sin(segment.phi * index + offset);
                const cos1 = Math.cos(segment.phi * (index + 1) + offset);
                const sin1 = Math.sin(segment.phi * (index + 1) + offset);

                const x0 = segment.r0 * cos0;
                const y0 = segment.r0 * sin0;

                const x1 = segment.r0 * cos1;
                const y1 = segment.r0 * sin1;

                const x2 = segment.r1 * cos1;
                const y2 = segment.r1 * sin1;

                const x3 = segment.r1 * cos0;
                const y3 = segment.r1 * sin0;

                return (
                  <path
                    key={index}
                    d={`
                M ${x0},${y0} 
                L${x1},${y1} 
                L${x2},${y2} 
                L${x3},${y3} 
                L${x0},${y0}`}
                    fill={layerColor}
                    stroke="#777"
                    strokeWidth="1"
                    strokeOpacity="0.8"
                    fillOpacity="0.8"
                  />
                );
              })}
              <text
                y={layerIndex * 20}
                fill={layerColor}
                stroke="#000"
                strokeWidth="0.1"
              >
                Layer {layerIndex}
              </text>
            </>
          );
        })}

        {/* The outline */}
        <circle
          x="0"
          y="0"
          r={measurements.ringCenterRadius + torusRadius}
          fill="none"
          strokeWidth="1"
          strokeDasharray="10 10"
          stroke="#333"
          opacity={0.7}
        />
        <circle
          x="0"
          y="0"
          r={measurements.ringCenterRadius - torusRadius}
          fill="none"
          strokeWidth="1"
          strokeDasharray="10 10"
          stroke="#333"
          opacity={0.5}
        />
        <circle
          x="0"
          y="0"
          r={measurements.ringCenterRadius}
          fill="none"
          strokeWidth={torusDiameter}
          stroke="#d48"
          opacity={0.2}
        />
      </svg>
    </div>
  );
}

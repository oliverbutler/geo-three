import {
  getQuadKeyFromCoordinates,
  getCoordinatesFromLatLong,
  CoordinateRounded,
  getPreciseCoordinatesFromLatLong,
} from '@geo-three/shared-utils';
import { useEffect, useRef } from 'react';
import gpx from '../assets/weather-hill.gpx?raw';

const origin = { x: 16125, y: 10434 };
const radius = 12;

const extractRouteFromGpxString = (
  gpxString: string
): { lat: number; lng: number; elevation: number; time: Date }[] => {
  const xml = new DOMParser().parseFromString(gpxString, 'text/xml');

  const trackPoints = xml.getElementsByTagName('trkpt');

  const route: { lat: number; lng: number; elevation: number; time: Date }[] =
    [];

  for (let i = 0; i < trackPoints.length; i++) {
    const trackPoint = trackPoints[i];
    const lat = parseFloat(trackPoint.getAttribute('lat') || '0');
    const lng = parseFloat(trackPoint.getAttribute('lon') || '0');
    const elevation = parseFloat(
      trackPoint.getElementsByTagName('ele')[0].textContent || '0'
    );
    const time = new Date(
      trackPoint.getElementsByTagName('time')[0].textContent || '0'
    );

    route.push({ lat, lng, elevation, time });
  }

  return route;
};

const route = extractRouteFromGpxString(gpx);

const routeAsCoordinates = route
  .map((point) => {
    return getPreciseCoordinatesFromLatLong(point.lat, point.lng);
  })
  .map((coordinate) => {
    return {
      x: coordinate.x - origin.x,
      y: coordinate.y - origin.y,
    };
  });

const GRID_PIXEL_SIZE = 100;

const getCoordinatesWithinBoundaries = (
  x: number,
  y: number,
  width: number,
  height: number
): CoordinateRounded[] => {
  const coordinates: CoordinateRounded[] = [];

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      coordinates.push({ x: x + i, y: y + j } as CoordinateRounded);
    }
  }

  return coordinates;
};

const coordinatesWithinBoundaries = getCoordinatesWithinBoundaries(
  -(radius / 2),
  -(radius / 2),
  radius,
  radius
);

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext('2d');

      if (ctx) {
        coordinatesWithinBoundaries.forEach((coordinate) => {
          const image = new Image();
          image.src = `http://localhost:3000/tile?quadKey=${getQuadKeyFromCoordinates(
            coordinate.x + origin.x,
            coordinate.y + origin.y
          )}&type=os`;

          image.onload = () => {
            ctx.drawImage(
              image,
              coordinate.x * GRID_PIXEL_SIZE + (GRID_PIXEL_SIZE * radius) / 2,
              coordinate.y * GRID_PIXEL_SIZE + (GRID_PIXEL_SIZE * radius) / 2,
              GRID_PIXEL_SIZE,
              GRID_PIXEL_SIZE
            );
          };
        });
      }
    }

    return () => {
      if (canvas) {
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };
  }, []);

  useEffect(() => {
    const canvas = overlayCanvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext('2d');

      if (ctx) {
        routeAsCoordinates.forEach((coordinate) => {
          // Draw circle at coordinate

          ctx.beginPath();
          ctx.arc(
            coordinate.x * GRID_PIXEL_SIZE + (GRID_PIXEL_SIZE * radius) / 2,
            coordinate.y * GRID_PIXEL_SIZE + (GRID_PIXEL_SIZE * radius) / 2,
            1,
            0,
            2 * Math.PI
          );

          ctx.fillStyle = 'red';
          ctx.fill();
        });
      }
    }

    return () => {
      if (canvas) {
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={GRID_PIXEL_SIZE * radius}
        height={GRID_PIXEL_SIZE * radius}
        style={{
          border: '1px solid black',
        }}
      />
      <canvas
        ref={overlayCanvasRef}
        width={GRID_PIXEL_SIZE * radius}
        height={GRID_PIXEL_SIZE * radius}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}

export default App;

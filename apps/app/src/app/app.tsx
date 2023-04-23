import { useCallback, useEffect, useMemo, useRef } from 'react';
import gpx from '../assets/weather-hill.gpx?raw';
import {
  getCoordinatesFromQuadKey,
  getQuadKey,
  getTileUrl,
  getCoordinatesFromLatLong,
  getPreciseCoordinatesFromLatLong,
} from '../map-api/map-api';

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

const quadKeys = new Set<string>();

route.forEach((point) => {
  const { x, y } = getCoordinatesFromLatLong(point.lat, point.lng);

  const quadKey = getQuadKey(x, y);

  quadKeys.add(quadKey);
});

const coordinateGrid = Array.from(quadKeys).map((quadKey) => {
  const { x, y } = getCoordinatesFromQuadKey(quadKey);

  return { x, y };
});

const ImageTile = (props: { x: number; y: number }) => {
  const tileUrl = useMemo(() => {
    const tileUrl = getTileUrl(props.x, props.y, 'OS');

    return tileUrl;
  }, [props.x, props.y]);

  return <img src={tileUrl} width={100} height={100} />;
};

// Take the grid e.g. [{x: 16122, y: 10433}, {x: 16123, y: 10433}]
// and make it relative to the first point e.g. [{x: 0, y: 0}, {x: 1, y: 0}]
const relativeCoordinateGrid = coordinateGrid.map((coordinate, index) => {
  if (index === 0) {
    return {
      relative: {
        x: 0,
        y: 0,
      },
      absolute: coordinate,
    };
  }

  const firstCoordinate = coordinateGrid[0];

  return {
    relative: {
      x: coordinate.x - firstCoordinate.x,
      y: coordinate.y - firstCoordinate.y,
    },
    absolute: coordinate,
  };
});

function App() {
  return (
    <div>
      <div
        style={{
          position: 'relative',
        }}
      >
        {relativeCoordinateGrid.map((coordinate) => {
          return (
            <div
              key={`${coordinate.absolute.x}-${coordinate.absolute.y}`}
              style={{
                position: 'absolute',
                left: coordinate.relative.x * 100,
                top: coordinate.relative.y * 100,
                zIndex: 50,
              }}
            >
              <ImageTile x={coordinate.absolute.x} y={coordinate.absolute.y} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;

const generateOsUrl = (quadKey: string) => {
  return `https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/${quadKey}?mkt=en-GB&ur=gb&it=G,OS,BF,RL&og=2196&n=t&o=webp,95&cstl=s23&key=${
    import.meta.env['NX_MAP_KEY']
  }`;
};

const generateSatelliteUrl = (quadKey: string) => {
  return `https://t.ssl.ak.tiles.virtualearth.net/tiles/a${quadKey}.jpeg?g=13555&n=z&prx=1`;
};

export const getQuadKey = (x: number, y: number) => {
  const z = 15;

  let n: number;
  let quadKey = '';

  for (let a = z; a > 0; a--) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (n = 1 << (a - 1)), (quadKey += (x & n ? 1 : 0) + (y & n ? 2 : 0));
  }

  return quadKey;
};

export const getCoordinatesFromQuadKey = (quadKey: string) => {
  let x = 0;

  let y = 0;

  const z = quadKey.length;

  for (let i = z; i > 0; i--) {
    const mask = 1 << (i - 1);

    switch (quadKey[z - i]) {
      case '0':
        break;
      case '1':
        x |= mask;
        break;
      case '2':
        y |= mask;
        break;
      case '3':
        x |= mask;
        y |= mask;
        break;
      default:
        throw new Error('Invalid QuadKey digit sequence.');
    }
  }

  return { x, y };
};

type Coordinate = {
  x: number;
  y: number;
} & {
  __typeName: 'Coordinate';
};

type CoordinateRounded = {
  x: number;
  y: number;
} & {
  __typeName: 'CoordinateRounded';
};

export const getPreciseCoordinatesFromLatLong = (
  lat: number,
  long: number
): Coordinate => {
  const x = ((long + 180) / 360) * (1 << 15);
  const y =
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    (1 << 15);

  return { x, y } as Coordinate;
};

export const getCoordinatesFromLatLong = (
  lat: number,
  long: number
): CoordinateRounded => {
  const x = Math.floor(((long + 180) / 360) * (1 << 15));
  const y = Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      (1 << 15)
  );

  return { x, y } as CoordinateRounded;
};

export const decodeLatLongFromCoordinates = (x: number, y: number) => {
  const z = 15;

  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);

  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

  const long = (x / Math.pow(2, z)) * 360 - 180;

  return {
    lat: Math.round(lat * 1000000) / 1000000,
    lon: Math.round(long * 1000000) / 1000000,
  };
};

export const getTileUrl = (x: number, y: number, type: 'OS' | 'Satellite') => {
  const quadKey = getQuadKey(x, y);

  if (type === 'OS') {
    return generateOsUrl(quadKey);
  } else {
    return generateSatelliteUrl(quadKey);
  }
};

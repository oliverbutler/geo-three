import { describe, it, expect } from 'vitest';
import {
  decodeLatLongFromCoordinates,
  getPreciseCoordinatesFromLatLong,
  getCoordinatesFromQuadKey,
  getQuadKey,
  getTileUrl,
  getCoordinatesFromLatLong,
} from './map-api';

describe('OSDecoder', () => {
  it('can decode a position in the lakes (Loadpot Hill)', () => {
    const result = getQuadKey(16125, 10434);

    expect(result).toBe('031311033111121');
  });

  it('can decode one position relative to another', () => {
    // One down from the previous position

    const result = getQuadKey(16125, 10435);

    expect(result).toBe('031311033111123');
  });

  it('can get the URL for a tile', () => {
    const result = getTileUrl(16125, 10434, 'OS');

    expect(result).toBe(
      `https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/031311033111121?mkt=en-GB&ur=gb&it=G,OS,BF,RL&og=2196&n=t&o=webp,95&cstl=s23&key=${
        import.meta.env['NX_MAP_KEY']
      }`
    );
  });

  it('can get the URL for a satellite tile', () => {
    const result = getTileUrl(16125, 10434, 'Satellite');

    expect(result).toBe(
      'https://t.ssl.ak.tiles.virtualearth.net/tiles/a031311033111121.jpeg?g=13555&n=z&prx=1'
    );
  });

  it('can decode coordinates from lat, long', () => {
    const lat = 54.555489;
    const lon = -2.838595;

    const result = getCoordinatesFromLatLong(lat, lon);

    expect(result).toEqual({ x: 16125, y: 10434 });
  });

  it('can decode lat long from coordinates', () => {
    const result = decodeLatLongFromCoordinates(16125, 10434);

    console.log(result);

    expect(result).toEqual({ lat: 54.559323, lon: -2.845459 });
  });

  it('can decode coordinates from quad key', () => {
    const result = getCoordinatesFromQuadKey('031311033111121');

    expect(result).toEqual({ x: 16125, y: 10434 });
  });

  it('cam get a tile URL from lat, long', () => {
    const { x, y } = getCoordinatesFromLatLong(54.45316, -3.211783);

    const result = getTileUrl(x, y, 'OS');

    expect(result).toBe(
      `https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/031311033031031?mkt=en-GB&ur=gb&it=G,OS,BF,RL&og=2196&n=t&o=webp,95&cstl=s23&key=${
        import.meta.env['NX_MAP_KEY']
      }`
    );
  });

  it("can get a tile URL from a lat, long that's in an obscure place", () => {
    const { x, y } = getCoordinatesFromLatLong(54.172192, -1.391744);

    const result = getTileUrl(x, y, 'OS');

    expect(result).toBe(
      `https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/031311132222221?mkt=en-GB&ur=gb&it=G,OS,BF,RL&og=2196&n=t&o=webp,95&cstl=s23&key=${
        import.meta.env['NX_MAP_KEY']
      }`
    );
  });

  it('should be able to get floating point coordinates from a lat, long', () => {
    const coordinates = getPreciseCoordinatesFromLatLong(54.555421, -2.841373);

    expect(coordinates).toEqual({
      x: 16125.371915377777,
      y: 10434.612413921852,
    });
  });
});

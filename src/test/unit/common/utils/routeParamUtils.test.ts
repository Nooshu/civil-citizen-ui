import {Request} from 'express';
import {getRouteParam, normalizeRouteParam} from 'common/utils/routeParamUtils';

describe('routeParamUtils', () => {
  describe('normalizeRouteParam', () => {
    it('should return string param as-is', () => {
      expect(normalizeRouteParam('abc')).toEqual('abc');
    });

    it('should return first element of array param', () => {
      expect(normalizeRouteParam(['first', 'second'])).toEqual('first');
    });

    it('should return empty string for empty array', () => {
      expect(normalizeRouteParam([])).toEqual('');
    });

    it('should return empty string for undefined', () => {
      expect(normalizeRouteParam(undefined)).toEqual('');
    });
  });

  describe('getRouteParam', () => {
    it('should read and normalize req.params key', () => {
      const req = {params: {id: 'claim-1'}} as unknown as Request;
      expect(getRouteParam(req, 'id')).toEqual('claim-1');
    });

    it('should normalize array params from request', () => {
      const req = {params: {id: ['a', 'b']}} as unknown as Request;
      expect(getRouteParam(req, 'id')).toEqual('a');
    });

    it('should return empty string when key missing', () => {
      const req = {params: {}} as unknown as Request;
      expect(getRouteParam(req, 'id')).toEqual('');
    });

    it('should return empty string when params is undefined', () => {
      const req = {} as unknown as Request;
      expect(getRouteParam(req, 'id')).toEqual('');
    });
  });
});

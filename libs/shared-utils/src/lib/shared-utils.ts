import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const contract = c.router({
  getTile: {
    method: 'GET',
    path: '/tile',
    query: z.object({
      quadKey: z.string(),
      type: z.enum(['os', 'sat']),
    }),
    responses: {
      200: c.response<any>(),
    },
  },
});

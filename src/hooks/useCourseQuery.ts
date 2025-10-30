import { useQuery } from '@tanstack/react-query';
import { courseApi } from '../api/api';

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await courseApi.getCourses();
      return res.data;
    },
  });
};

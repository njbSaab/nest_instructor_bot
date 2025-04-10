import * as path from 'path';

export const getPublicPath = () => {
  if (process.env.NODE_ENV === 'production') {
    return path.join(process.cwd(), 'public');
  } else {
    return path.join(process.cwd(), 'src', 'public');
  }
};
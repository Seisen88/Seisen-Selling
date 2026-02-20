declare module 'ambient-cbg' {
  import React from 'react';

  export interface SwirlProps {
    color?: string;
    particleCount?: number;
    speed?: number;
    baseSpeed?: number;
    size?: number;
    [key: string]: any;
  }

  export const Swirl: React.FC<SwirlProps>;
}

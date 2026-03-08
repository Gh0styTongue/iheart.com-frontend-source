import isTouch from 'utils/isTouch';
import useMount from 'hooks/useMount';
import { useState } from 'react';

export default function useTouch() {
  const [touch, setTouch] = useState(false);

  useMount(() => {
    if (isTouch !== touch) {
      setTouch(isTouch);
    }
  });
  return touch;
}

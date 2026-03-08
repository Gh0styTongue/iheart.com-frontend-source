import { createContext } from 'react';

export type DefaultValue = {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
};

const ThemeContext = createContext<DefaultValue>({
  isDark: false,
  setIsDark: () => false,
});

export default ThemeContext;

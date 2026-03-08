import ThemeContext from './ThemeContext';
import { darkTheme, lightTheme } from 'styles/themes/default';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { ReactNode, useState } from 'react';

type Props = {
  children: ReactNode;
};

function ThemeProvider({ children }: Props) {
  const [isDark, setIsDark] = useState(false);
  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <EmotionThemeProvider theme={isDark ? darkTheme : lightTheme}>
        {children}
      </EmotionThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;

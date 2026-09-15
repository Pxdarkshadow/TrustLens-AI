import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * TrustLens AI — "Verification Ledger" theme
 *
 * Accessibility-first: high-contrast text on white, visible borders/rings,
 * larger type. Uses the brand navy (trust/verification) with a deep green for
 * the "verified" accent. Everything reads clearly for reduced-contrast / low-vision users.
 */
const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#14408c',      // verified navy — ~8.5:1 on white
      light: '#4166a8',
      dark: '#0e2e61',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0b6e4f',      // trust green (verified seal)
      light: '#2f8c6c',
      dark: '#08563e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0b1117',   // near-black — max contrast
      secondary: '#25303c', // dark slate (still ~8:1), never pale grey
      disabled: '#5b6b7a',
    },
    divider: '#44586b',     // visible rule, not faint
    action: {
      hover: '#eef1f6',
      selected: '#e3ecf7',
      active: '#14408c',
    },
    error: { main: '#b3261e' },   // accessible red
    warning: { main: '#6f4a00' }, // deep amber, readable text
    info: { main: '#0b5cad' },
    success: { main: '#0b6e4f' },
  },
  typography: {
    fontFamily: '"Montserrat", "Segoe UI", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Gambetta", Georgia, serif', fontWeight: 700, fontSize: '2.75rem', lineHeight: 1.15 },
    h2: { fontFamily: '"Gambetta", Georgia, serif', fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.2 },
    h3: { fontFamily: '"Gambetta", Georgia, serif', fontWeight: 700, fontSize: '1.9rem', lineHeight: 1.25 },
    h4: { fontFamily: '"Gambetta", Georgia, serif', fontWeight: 700, fontSize: '1.6rem', lineHeight: 1.3 },
    h5: { fontFamily: '"Gambetta", Georgia, serif', fontWeight: 700, fontSize: '1.35rem', lineHeight: 1.35 },
    h6: { fontFamily: '"Gambetta", Georgia, serif', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.4 },
    body1: { fontSize: '1.0625rem', lineHeight: 1.65 },
    body2: { fontSize: '0.95rem', lineHeight: 1.55 },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '1rem' },
    caption: { fontSize: '0.85rem', lineHeight: 1.45 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 26px',
          fontSize: '1rem',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 8px rgba(20, 64, 140, 0.25)' },
        },
        outlined: { borderWidth: 2, '&:hover': { borderWidth: 2 } },
        text: { fontSize: '0.95rem' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#44586b', borderWidth: 1.5 },
            '&:hover fieldset': { borderColor: '#14408c' },
            '&.Mui-focused fieldset': { borderColor: '#14408c', borderWidth: 2.5 },
          },
          '& .MuiInputLabel-root': { color: '#25303c', '&.Mui-focused': { color: '#0e2e61' } },
          '& .MuiInputBase-input': { color: '#0b1117', fontSize: '1.05rem' },
          '& .MuiFormHelperText-root': { fontSize: '0.85rem', fontWeight: 600 },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { border: '1px solid #dbe2ea', boxShadow: '0 1px 3px rgba(11, 17, 23, 0.08)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: '1px solid #cbd5e0', borderRadius: 12, boxShadow: '0 1px 2px rgba(11,17,23,0.06)' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none', borderBottom: '1px solid #cbd5e0' },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderRight: '1px solid #cbd5e0' } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, backgroundColor: '#eef1f6', color: '#0b1117', fontSize: '0.9rem' },
        root: { fontSize: '0.95rem', borderBottom: '1px solid #cbd5e0' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
        label: { fontSize: '0.85rem' },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 10, fontWeight: 500 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 14 } },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#14408c',
            color: '#ffffff',
            '& .MuiListItemIcon-root': { color: '#ffffff' },
            '&:hover': { backgroundColor: '#0e2e61' },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { '&:focus-visible': { outline: '3px solid #14408c', outlineOffset: 2 } } },
    },
    MuiLink: { styleOverrides: { root: { fontWeight: 600, textDecorationThickness: 2 } } },
  },
};

export const theme = createTheme(themeOptions);
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// JSDOM does not provide these encoders by default
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

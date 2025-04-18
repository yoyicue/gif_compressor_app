import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App';
import './styles.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(App));
}

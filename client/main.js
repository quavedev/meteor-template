import React, { StrictMode } from 'react';
import { Meteor } from 'meteor/meteor';
import { createRoot } from 'react-dom/client';
import { App } from '../app/general/App';
import './main.css';

Meteor.startup(() => {
  const root = createRoot(document.getElementById('app'));
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});

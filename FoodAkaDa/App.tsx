import * as React from 'react';
import {Provider} from 'react-redux';
import AppInner from './AppInner';
import store from './src/store/index';

function App() {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
}

export default App;

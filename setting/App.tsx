import * as React from 'react';
import {Provider} from 'react-redux';
import AppInner from './AppInner';
import store from './src/store/index';

export type LoggedInParamList = {
  Orders: undefined;
  Settings: undefined;
  Delivery: undefined;
  Complete: {orderId: string};
};

function App() {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
}

export default App;

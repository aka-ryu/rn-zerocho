import Settings from './src/pages/Settings';
import Orders from './src/pages/Orders';
import Delivery from './src/pages/Delivery';
import SignIn from './src/pages/SignIn';
import SignUp from './src/pages/SignUp';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootState} from './src/store/reducer';
import {useSelector} from 'react-redux';
import React, {useEffect} from 'react';
import useSocket from './src/hooks/useSocket';
import EncryptedStorage from 'react-native-encrypted-storage';
import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';
import userSlice from './src/slices/user';
import {useAppDispatch} from './src/store';
import {Alert} from 'react-native';
import orderSlice from './src/slices/order';
import usePermissions from './src/hooks/usePermissions';
import SplashScreen from 'react-native-splash-screen';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export type LoggedInParamList = {
  Orders: undefined;
  Settings: undefined;
  Delivery: undefined;
  Complete: {orderId: string};
};

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppInner() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useSelector((state: RootState) => !!state.user.email);
  const [socket, disconnect] = useSocket();

  usePermissions();

  useEffect(() => {
    axios.interceptors.response.use(
      response => response,

      async error => {
        const {
          config,
          response: {status},
        } = error;

        if (status === 419) {
          if (error.response.data.code === 'expired') {
            const originRequest = config;
            const refreshToken = await EncryptedStorage.getItem('refreshToken');
            const {data} = await axios.post(
              `${Config.API_URL}/refreshToken`,
              {},
              {
                headers: {
                  authorization: `Bearer ${refreshToken}`,
                },
              },
            );

            dispatch(userSlice.actions.setAccessToken(data.data.accessToken));
            originRequest.headers.authorization = `Bearer ${data.data.accessToken}`;

            return axios(originRequest);
          }
        }
        return Promise.reject(error);
      },
    );
  }, [dispatch]);

  useEffect(() => {
    const callback = (data: any) => {
      console.log(data);
      dispatch(orderSlice.actions.addOrder(data));
    };
    if (socket && isLoggedIn) {
      socket.emit('acceptOrder', 'hello');
      socket.on('order', callback);
    }
    return () => {
      if (socket) {
        socket.off('order', callback);
      }
    };
  }, [dispatch, isLoggedIn, socket]);

  useEffect(() => {
    if (!isLoggedIn) {
      console.log('!isLoggedIn', !isLoggedIn);
      disconnect();
    }
  }, [isLoggedIn, disconnect]);

  useEffect(() => {
    const getTokenAndRefresh = async () => {
      try {
        const token = await EncryptedStorage.getItem('refreshToken');
        if (!token) {
          SplashScreen.hide();
          return;
        }
        const response = await axios.post(
          `${Config.API_URL}/refreshToken`,
          {},
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );
        dispatch(
          userSlice.actions.setUser({
            name: response.data.data.name,
            email: response.data.data.email,
            accessToken: response.data.data.accessToken,
          }),
        );
      } catch (error) {
        console.error(error);
        if ((error as AxiosError).response?.data.code === 'expired') {
          Alert.alert('??????', '?????? ????????? ????????????.');
        }
      } finally {
        SplashScreen.hide();
      }
    };
    getTokenAndRefresh();
  }, [dispatch]);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Tab.Navigator>
          <Tab.Screen
            name="Orders"
            component={Orders}
            options={{
              title: '?????? ??????',
              tabBarIcon: () => <FontAwesome5 name="list" size={20} />,
            }}
          />
          <Tab.Screen
            name="Delivery"
            component={Delivery}
            options={{
              headerShown: false,
              title: '??????',
              tabBarIcon: () => <FontAwesome5 name="map" size={20} />,
            }}
          />
          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{
              title: '??? ??????',
              unmountOnBlur: true,
              tabBarIcon: () => <FontAwesome5 name="bahai" size={20} />,
            }}
          />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="SignIn"
            component={SignIn}
            options={{title: '?????????'}}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{title: '????????????'}}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default AppInner;

import React from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {Order} from '../slices/order';
import {RootState} from '../store/reducer';
function Orders() {
  const orders = useSelector((state: RootState) => state.order.orders);
  return (
    <View>
      {orders.map((v: Order) => (
        <View>
          <Text>{v.orderId}</Text>
        </View>
      ))}
    </View>
  );
}
export default Orders;

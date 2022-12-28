import React, {useCallback} from 'react';
import {View, Text, FlatList} from 'react-native';
import {useSelector} from 'react-redux';
import {Order} from '../slices/order';
import {RootState} from '../store/reducer';
function Orders() {
  const orders = useSelector((state: RootState) => state.order.orders);
  const renderItem = useCallback(({item}) => {});
  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.orderId}
      renderItem={renderItem}
    />
  );
}
export default Orders;

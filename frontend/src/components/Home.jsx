import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from './layout/MainLayout';
import ChatArea from './messages/ChatArea';
import { getCurrentUser } from '../features/auth/authSlice';

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, user]);

  return (
    <MainLayout>
      <ChatArea />
    </MainLayout>
  );
};

export default Home;

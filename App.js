import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Auth Screens
import LoginScreen from './screens/login';
import SignUpScreen from './screens/signup';

// Patient Screens
import DashboardScreen from './screens/PatientScreens/dashboard';
import ClinicsScreen from './screens/PatientScreens/clinicsScreen'; 
import AppointmentsScreen from './screens/PatientScreens/appointScreen';
import ProfileScreen from './screens/PatientScreens/ProfileScreen';

// Booking screens
import ViewAppointmentsScreen from './screens/BookingAppointment/ViewAppointmentsScreen';
import RescheduleAppointmentScreen from './screens/BookingAppointment/RescheduleAppointmentScreen';
import bookingScreen from './screens/BookingAppointment/bookingScreen';

const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
              break;
            case 'Clinics':
              iconName = 'medkit';
              break;
            case 'Appointments':
              iconName = 'calendar';
              break;
            case 'Profile':
              iconName = 'person';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2b8a3e',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Clinics" component={ClinicsScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsStackScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}



export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      {user ? <AppTabs /> : <AuthStackScreen />}
    </NavigationContainer>
  );
}

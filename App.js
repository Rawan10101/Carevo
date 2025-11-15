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
import DoctorListScreen  from './screens/DoctorListScreen';


const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ClinicsStack = createStackNavigator();

// Auth Stack Navigator
function AuthStackScreen() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

// Nested Clinics Stack Navigator
function ClinicsStackScreen() {
  return (
    <ClinicsStack.Navigator>
      <ClinicsStack.Screen 
        name="ClinicsList" 
        component={ClinicsScreen}
        options={{ 
          title: 'Clinics',
          headerShown: true,
        }}
      />
      <ClinicsStack.Screen 
        name="DoctorList" 
        component={DoctorListScreen}
        options={{ 
          headerShown: true,
          // The title will be set dynamically by DoctorListScreen using navigation.setOptions
        }}
      />
    </ClinicsStack.Navigator>
  );
}

// Bottom Tab Navigator
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Hide header for tab screens since nested stacks have their own headers
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
      <Tab.Screen name="Clinics" component={ClinicsStackScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App Component
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

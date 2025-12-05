// ✅ App.js - DIRECT IMPORTS (NO index.js needed)
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth, firestore } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Auth Screens
import LoginScreen from './screens/login';
import SignUpScreen from './screens/signup';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

// Patient Screens
import DashboardScreen from './screens/PatientScreens/dashboard';
import ClinicsScreen from './screens/PatientScreens/clinicsScreen'; 
import AppointmentsScreen from './screens/PatientScreens/appointScreen';
import ProfileScreen from './screens/PatientScreens/ProfileScreen';
import DoctorListScreen from './screens/DoctorListScreen';

// ✅ DOCTOR SCREENS - DIRECT IMPORTS
import DoctorAppointmentsScreen from './screens/DoctorScreens/DoctorAppointmentsScreen';
import DoctorPatientsScreen from './screens/DoctorScreens/DoctorPatientsScreen';
import DoctorScheduleScreen from './screens/DoctorScreens/DoctorScheduleScreen';
import DoctorProfileScreen from './screens/DoctorScreens/DoctorProfileScreen';

const AuthStack = createStackNavigator();
const PatientTab = createBottomTabNavigator();
const DoctorTab = createBottomTabNavigator();
const ClinicsStack = createStackNavigator();

// Auth Stack Navigator
function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

//  PATIENT TABS
function PatientTabs() {
  return (
    <PatientTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard': iconName = 'home'; break;
            case 'Clinics': iconName = 'medkit'; break;
            case 'Appointments': iconName = 'calendar'; break;
            case 'Profile': iconName = 'person'; break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2b8a3e',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <PatientTab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={({ navigation }) => ({
          title: 'Carevo',
          headerShown: true,
          headerTitleStyle: { 
            fontSize: 28,
            fontWeight: 'bold',
            color: '#28813fff',
          },
          headerRight: () => (
            <View style={{ marginRight: 15 }}>
              <Ionicons
                name="paper-plane-outline"
                size={28}
                color="#28813fff"
                onPress={() => navigation.navigate('Chat')}
              />
            </View>
          ),
        })}
      />
      <PatientTab.Screen name="Clinics" component={ClinicsStackScreen} />
      <PatientTab.Screen name="Appointments" component={AppointmentsScreen} />
      <PatientTab.Screen name="Profile" component={ProfileScreen} />
    </PatientTab.Navigator>
  );
}

// NEW DOCTOR TABS (4 tabs)
function DoctorTabs() {
  return (
    <DoctorTab.Navigator
    
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            'Appointments': 'calendar',
            'Patients': 'people',
            'Schedule': 'time',
            'Profile': 'person'
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#28813fff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <DoctorTab.Screen name="Appointments" component={DoctorAppointmentsScreen} />
      <DoctorTab.Screen name="Patients" component={DoctorPatientsScreen} />
      <DoctorTab.Screen name="Schedule" component={DoctorScheduleScreen} />
      <DoctorTab.Screen name="Profile" component={DoctorProfileScreen} />
    </DoctorTab.Navigator>
  );
}

// Nested Clinics Stack Navigator (unchanged)
function ClinicsStackScreen() {
  return (
    <ClinicsStack.Navigator>
      <ClinicsStack.Screen 
        name="ClinicsList" 
        component={ClinicsScreen}
        options={{ title: 'Clinics', headerShown: false }}
      />
      <ClinicsStack.Screen 
        name="DoctorList" 
        component={DoctorListScreen}
        options={{ headerShown: true }}
      />
    </ClinicsStack.Navigator>
  );
}

// Main App Component
export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      setUser(usr);
      if (usr) {
        // ✅ FETCH USER ROLE FROM FIRESTORE
        try {
          const userRef = doc(firestore, 'users', usr.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserRole(userSnap.data().role); // 'doctor', 'patient', etc.
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setUserRole(null);
      }
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      {user ? (
        userRole === 'doctor' ? (
          <DoctorTabs />
        ) : (
          <PatientTabs />
        )
      ) : (
        <AuthStackScreen />
      )}
    </NavigationContainer>
  );
}

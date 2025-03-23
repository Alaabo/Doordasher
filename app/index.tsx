import { images } from "@/constants";
import { account, login } from "@/lib/appwrite";
import { Redirect, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/lib/authContext";
import { useLocationContext } from "@/lib/locationContxt";
import { reload } from "expo-router/build/global-state/routing";

export default function Index() {
  const { t } = useTranslation();
  const { isLogged , authLoading , authErrors , reload } = useAuthContext()
  const { locationLoading  } = useLocationContext()
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect if already logged in
  if (!locationLoading && !authLoading && isLogged) {
    return <Redirect href="./(root)/home" />;
  }

  // Show loading state
  if (authLoading || locationLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

 

  // Handle login logic
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      
      const results = await login();
      
      
      if (results) {
        reload();
      } else {
        Alert.alert('Error', 'Failed to login');
        console.log(authErrors)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Login failed: ${errorMessage}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <SafeAreaView className="bg-white flex-1 justify-around items-center px-4">
      <View className="items-center">
        <Image className="w-20 h-20" source={images.logo} />
        <Text className="text-5xl font-Poppins-Black text-primary-200 text-center">
          {t('app_name')}
        </Text>
      </View>
      
      <Text className="text-primary-300 font-Poppins-bold text-xl text-center mb-28">
        {t('slogan')}
      </Text>
      
      <TouchableOpacity 
        className="flex-row items-center justify-center bg-primary-200 rounded-lg p-4 w-full max-w-xs"
        onPress={handleLogin}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Image source={images.google} className="w-8 h-8" />
            <Text className="text-2xl text-primary-100 font-Poppins-medium px-2">
              {t('loginWithGoogle')}
            </Text>
            <Image source={images.rightArrow} className="w-8 h-8" />
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}


// import { images } from "@/constants";
// import { login } from "@/lib/appwrite";
// import { useGlobalContext } from "@/lib/globalProvider";
// import { Redirect, router } from "expo-router";
// import { useState } from "react";
// import { useTranslation } from "react-i18next";
// import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function Index() {
//   const {t} = useTranslation()
//   const { refetch , loading , isLogged , user} = useGlobalContext()
//   if(!loading && isLogged) return <Redirect href="./(root)/home"/>
//   if(loading) {
//     return(
//       <>
//         <ActivityIndicator size={200}/>
//       </>
//     )
//   }
//   const loggin = async ()=>{
//     const results = await login()
    
//     if(results){
//       if(results.response == 1){ refetch()
        
//       }

//       if(results.response == 2) {router.push('/phoneNumber')}
      
//     } else {
//       Alert.alert('error' , 'failed to login')
//     }
//   }
//   return (
    
//    <SafeAreaView className="bg-white h-full justify-around items-center">
//     <View className="items-center">
//     <Image className="size-20" source={images.logo}/>
//     <Text className="text-5xl font-Poppins-Black text-primary-200 text-center ">{t('app_name')}</Text>
//     </View>
//     <Text className="text-primary-300 font-Poppins-bold text-xl text-center mb-28 ">{t('slogan')}</Text>
    
//     <TouchableOpacity className="flex-row items-center bg-primary-200 rounded-lg p-4" onPress={()=>{loggin()}}>
//       <Image source={images.google} className="size-8"/>
//       <Text className="text-2xl text-primary-100 font-Poppins-medium px-2">
//         {t('loginWithGoogle')}
//       </Text>
//       <Image source={images.rightArrow} className="size-8"/>
//     </TouchableOpacity>
//    </SafeAreaView>
//   );
// }

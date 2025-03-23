import { View, Text, TouchableOpacity, Image, ImageSourcePropType, Alert, I18nManager } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '@/constants'
import { t } from 'i18next'
import { logoutCurrentUser } from '@/lib/appwrite'
import { useTranslation } from "react-i18next";
import { useAuthContext } from '@/lib/authContext'
import RNRestart from "react-native-restart";

interface SettingsItemProp {
    icon: ImageSourcePropType;
    title: string;
    onPress?: () => void;
    textStyle?: string;
    showArrow?: boolean;
  }
  
  const SettingsItem = ({
    icon,
    title,
    onPress,
    textStyle,
    showArrow = true,
  }: SettingsItemProp) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-row items-center justify-between py-3"
    >
      <View className="flex flex-row items-center gap-3">
        <Image source={icon} className="size-6" />
        <Text className={`text-lg font-Poppins-medium text-primary-300 ${textStyle}`}>
          {title}
        </Text>
      </View>
  
      {showArrow && <Image source={images.rightArrow} className="size-5" />}
    </TouchableOpacity>
  );
const profile = () => {
    const { t, i18n } = useTranslation();
    const {userData , reload} = useAuthContext()
    // const {user , refetch} = useGlobalContext()
    const handleLogout = async () => {
        const result = await logoutCurrentUser();
        if (result) {
          Alert.alert("Success", "Logged out successfully");
          reload();
        } else {
          Alert.alert("Error", "Failed to logout");
        }
      };

    const switchLanguageHandler = async () => {

        const newLang = i18n.language === "en" ? "ar" : "en";
  
        await i18n.changeLanguage(newLang); // Ensure the language is fully changed
        Alert.alert("Info", `Language is set to ${newLang}`);
        const isRTL = newLang === "ar";
  
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
    RNRestart.Restart(); // Restart the app to apply changes
  }
    }
    
  return (
   <SafeAreaView className='p-2 h-full bg-white '>
    <View>
        <Text className='text-4xl font-Poppins-bold '>
            {t('profile')}
        </Text>

        <View className="flex flex-col items-center relative mt-5">
            <Image
              source={{ uri: userData?.avatar }}
              className="size-44 relative rounded-full"
            />
           
            <Text className="text-2xl text-primary-200 font-Poppins-bold mt-2">{userData?.name}</Text>
          </View>
    </View>
        <View className="flex flex-col mt-10">
          <SettingsItem icon={images.calendar} title="My Bookings" />
          <SettingsItem icon={images.wallet} title="Payments" />
        </View>
        <SettingsItem
            icon={images.language}
            title={t('switchLuanguage')}
            textStyle="text-danger"
            showArrow={false}
            onPress={switchLanguageHandler}
          />
        <SettingsItem
            icon={images.logout}
            title="Logout"
            textStyle="text-danger"
            showArrow={false}
            onPress={handleLogout}
          />

   </SafeAreaView>
  )
}

export default profile
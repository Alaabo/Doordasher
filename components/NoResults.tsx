import React from "react";
import { View, Text, Image, I18nManager, StyleSheet } from "react-native";

import { images } from "../constants/index";
import { t } from "i18next";
import i18n from "@/utils/i18n";

const NoResults = () => {
  // Check if current language is RTL
  const isRTL = i18n.dir() === 'rtl' || i18n.language === 'ar';

  // Create RTL-aware styles
  const rtlStyles = StyleSheet.create({
    container: {
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    textAlign: {
      textAlign: isRTL ? 'right' : 'left',
    },
    fullWidth: {
      width: '100%',
    }
  });

  return (
    <View className="flex items-center">
      <Image
        source={images.noResults}
        style={{ width: 150, height: 150 }}
        resizeMode="contain"
      />
      <Text 
        className="text-2xl font-Poppins-bold text-primary-200"
        style={rtlStyles.textAlign}
      >
        {t("NoResults")}
      </Text>
      <Text 
        className="text-base font-Poppins-light mt-1"
        style={rtlStyles.textAlign}
      >
        {t('NoResultsSlogan')}
      </Text>
    </View>
  );
};

export default NoResults;

// import React from "react";
// import { View, Text, Image } from "react-native";

// import {images} from "../constants/index";
// import { t } from "i18next";

// const NoResults = () => {
//   return (
//     <View className="flex items-center ">
//       <Image
//         source={images.noResults}
//         style={{width : 150 , height: 150}}
//         resizeMode="contain"
//       />
//       <Text className="text-2xl font-Poppins-bold text-primary-200 ">
//         {t("NoResults")}
//       </Text>
//       <Text className="text-base font-Poppins-light mt-1">
//         {t('NoResultsSlogan')}
//       </Text>
//     </View>
//   );
// };

// export default NoResults;
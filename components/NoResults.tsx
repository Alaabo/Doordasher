import React from "react";
import { View, Text, Image } from "react-native";

import {images} from "../constants/index";
import { t } from "i18next";

const NoResults = () => {
  return (
    <View className="flex items-center ">
      <Image
        source={images.noResults}
        style={{width : 150 , height: 150}}
        resizeMode="contain"
      />
      <Text className="text-2xl font-Poppins-bold text-primary-200 ">
        {t("NoResults")}
      </Text>
      <Text className="text-base font-Poppins-light mt-1">
        {t('NoResultsSlogan')}
      </Text>
    </View>
  );
};

export default NoResults;
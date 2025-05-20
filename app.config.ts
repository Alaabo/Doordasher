import { ImageBackgroundBase } from "react-native";

//@ts-ignore
export default ({ config }) => ({
  expo: {
    name: "Jawad Delivery",
    slug: "jawaddelivery",
    owner: "alaabourega",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "jawaddelivery",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    developmentClient: {
      silentLaunch: false
    },
    extra: {
      eas: {
        projectId: "dce1c8fa-8c58-47ea-8cd1-2c60e8eca4da"
      },
      cli: {
        appVersionSource: "remote" // This addresses the first warning
      }
    },
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
      },
    },
    android: {
      package: "com.Alaabo.jawaddelivery", // This MUST be unique
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#ffffff",
        googleServicesFile: false,
        
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
        }
      }
      ,
      intentFilters:[
        {
          action : "VIEW",
          data : [{scheme : "jawaddelivery"}],
          category : ["BROWSABLE" , "DEFAULT"]
        }
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/logo.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          resizeMode: "cover",
          backgroundColor: "#ffffff",
          enableFullScreenImage_legacy: true,
        },
      ],
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/Poppins-Black.ttf",
            "./assets/fonts/Poppins-Bold.ttf",
            "./assets/fonts/Poppins-Light.ttf",
            "./assets/fonts/Poppins-Thin.ttf",
            "./assets/fonts/Poppins-Medium.ttf",
            "./assets/fonts/Poppins-Regular.ttf",
            "./assets/fonts/Poppins-SemiBold.ttf",
          ],
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
});

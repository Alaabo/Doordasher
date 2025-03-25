import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, I18nManager } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { t } from 'i18next'
import {useTranslation} from 'react-i18next'
import { images } from '@/constants'
import { account, createUser } from '@/lib/appwrite'
import { DBUser } from "@/types/globals";
import { router } from 'expo-router'
import { useAuthContext } from '@/lib/authContext'

const PhoneNumber = () => {
    const { i18n } = useTranslation();
    const [phone, setPhone] = useState<string>('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {reload} = useAuthContext()
    const [formattedPhone, setFormattedPhone] = useState('');
    const isRTL = i18n.language === 'ar' || I18nManager.isRTL;

    // Phone input handler with formatting
    const handlePhoneChange = (text: string) => {
        // Remove all non-numeric characters
        const cleaned = text.replace(/\D/g, '');
        
        // Limit to 10 digits
        const trimmed = cleaned.substring(0, 10);
        
        setPhone(trimmed);
        
        // Format phone number as user types (0xx-xxx-xxxx)
        let formatted = trimmed;
        if (trimmed.length > 3) {
            formatted = `${trimmed.substring(0, 3)}-${trimmed.substring(3)}`;
        }
        if (trimmed.length > 6) {
            formatted = `${formatted.substring(0, 7)}-${formatted.substring(7)}`;
        }
        
        setFormattedPhone(formatted);
    };

    // Validate phone number and show errors
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (phone.length > 0 && phone.length < 10) {
                setError(t('phonenumberinputerror'));
            } else {
                setError('');
            }
        }, 200);

        return () => clearTimeout(timeout);
    }, [phone]);
    
    // Check if form is valid for submission
    const isFormValid = phone.length === 10 && !error;
    
    async function handleSubmit() {
        if (!isFormValid) {
            Alert.alert(t('error'), t('phonenumberinputerror'));
            return;
        }
        
        try {
            setIsLoading(true);
            const user = await account.get();
            const userNew = {
                $id: user.$id,
                name: user.name,
                email: user.email,
                avatar: "https://images.unsplash.com/photo-1691335053879-02096d6ee2ca?q=60&w=640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                role: "client",
                phone: phone
            };

            const results = await createUser(userNew as DBUser);

            if (results) {
                reload();
                router.replace('/(root)/home')
            }
        } catch (error) {
            console.error(error);
            Alert.alert(t('error'), t('failedToAddPhoneNumber'));
            router.replace('/')
        } finally {
            setIsLoading(false);
        }
    }

    // Dismiss keyboard when tapping outside input
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View className="flex-1 px-6 py-4">
                        {/* Header */}
                        <View className="mb-6">
                            <Text className={`text-3xl font-Poppins-semibold text-primary-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('addphoonenumber')}
                            </Text>
                            <Text className={`text-base font-Poppins-light text-gray-500 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('providePhoneNumber')}
                            </Text>
                        </View>
                        
                        {/* Phone input section */}
                        <View className="mt-10">
                            <Text className={`text-xl font-Poppins-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('providePhoneNumber')}
                            </Text>
                            
                            <View className="border-b-2 border-primary-100 pb-2 mt-3">
                                <TextInput
                                    placeholder="0XX-XXX-XXXX"
                                    value={formattedPhone}
                                    onChangeText={handlePhoneChange}
                                    keyboardType="numeric"
                                    className={`text-xl font-Poppins-medium text-primary-300 py-2 ${isRTL ? 'text-right' : 'text-left'}`}
                                    maxLength={12} // Account for formatting characters
                                    textAlign={isRTL ? 'right' : 'left'}
                                    style={{ writingDirection: isRTL ? 'rtl' : 'ltr' }}
                                />
                            </View>
                            
                            {error ? (
                                <Text className={`text-red-500 font-Poppins-regular mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {error}
                                </Text>
                            ) : (
                                <Text className={`text-gray-400 font-Poppins-light mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {t('phoneNumberHint')}
                                </Text>
                            )}
                        </View>
                        
                        {/* Button group - positioned at the bottom */}
                        <View className="mt-auto mb-8">
                            {/* Submit button */}
                            <TouchableOpacity 
                                className={`items-center justify-center bg-primary-200 rounded-lg py-4 px-6 mb-4 ${!isFormValid ? 'opacity-70' : ''}`}
                                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                                onPress={handleSubmit}
                                disabled={!isFormValid || isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#ffffff" size="small" />
                                ) : (
                                    <>
                                        <Text className={`text-xl font-Poppins-semibold text-white mx-2`}>
                                            {t('ConfirmPhoneNumberButton')}
                                        </Text>
                                        <Image 
                                            source={images.rightArrow} 
                                            className="w-6 h-6" 
                                            tintColor="#ffffff" 
                                            style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} 
                                        />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default PhoneNumber;


// import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import { t } from 'i18next'
// import { images } from '@/constants'
// import { account, createUser } from '@/lib/appwrite'
// import { DBUser } from "@/types/globals";
// import { router } from 'expo-router'
// import { useAuthContext } from '@/lib/authContext'

// const PhoneNumber = () => {
//     const [phone, setPhone] = useState<string>('');
//     const [error, setError] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const {reload} = useAuthContext()
//     const [formattedPhone, setFormattedPhone] = useState('');

//     // Phone input handler with formatting
//     const handlePhoneChange = (text: string) => {
//         // Remove all non-numeric characters
//         const cleaned = text.replace(/\D/g, '');
        
//         // Limit to 10 digits
//         const trimmed = cleaned.substring(0, 10);
        
//         setPhone(trimmed);
        
//         // Format phone number as user types (0xx-xxx-xxxx)
//         let formatted = trimmed;
//         if (trimmed.length > 3) {
//             formatted = `${trimmed.substring(0, 3)}-${trimmed.substring(3)}`;
//         }
//         if (trimmed.length > 6) {
//             formatted = `${formatted.substring(0, 7)}-${formatted.substring(7)}`;
//         }
        
//         setFormattedPhone(formatted);
//     };

//     // Validate phone number and show errors
//     useEffect(() => {
//         const timeout = setTimeout(() => {
//             if (phone.length > 0 && phone.length < 10) {
//                 setError(t('phonenumberinputerror'));
//             } else {
//                 setError('');
//             }
//         }, 200);

//         return () => clearTimeout(timeout);
//     }, [phone]);
    
//     // Check if form is valid for submission
//     const isFormValid = phone.length === 10 && !error;
    
//     async function handleSubmit() {
//         if (!isFormValid) {
//             Alert.alert(t('error'), t('phonenumberinputerror'));
//             return;
//         }
        
//         try {
//             setIsLoading(true);
//             const user = await account.get();
//             const userNew = {
//                 $id: user.$id,
//                 name: user.name,
//                 email: user.email,
//                 avatar: "https://images.unsplash.com/photo-1691335053879-02096d6ee2ca?q=60&w=640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//                 role: "client",
//                 phone: phone
//             };

//             const results = await createUser(userNew as DBUser);

//             if (results) {
//                 reload();
//                 router.replace('/(root)/home')
//             }
//         } catch (error) {
//             console.error(error);
//             Alert.alert(t('error'), t('failedToAddPhoneNumber'));
//             router.replace('/')
//         } finally {
//             setIsLoading(false);
//         }
//     }

    

//     // Dismiss keyboard when tapping outside input
//     const dismissKeyboard = () => {
//         Keyboard.dismiss();
//     };

//     return (
//         <SafeAreaView className="flex-1 bg-white">
//             <KeyboardAvoidingView
//                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//                 className="flex-1"
//             >
//                 <TouchableWithoutFeedback onPress={dismissKeyboard}>
//                     <View className="flex-1 px-6 py-4">
//                         {/* Header */}
//                         <View className="mb-6">
//                             <Text className="text-3xl font-Poppins-semibold text-primary-200">{t('addphoonenumber')}</Text>
//                             <Text className="text-base font-Poppins-light text-gray-500 mt-2">{t('providePhoneNumber')}</Text>
//                         </View>
                        
//                         {/* Phone input section */}
//                         <View className="mt-10">
//                             <Text className="text-xl font-Poppins-medium text-gray-700">{t('providePhoneNumber')}</Text>
                            
//                             <View className="border-b-2 border-primary-100 pb-2 mt-3">
//                                 <TextInput
//                                     placeholder="0XX-XXX-XXXX"
//                                     value={formattedPhone}
//                                     onChangeText={handlePhoneChange}
//                                     keyboardType="numeric"
//                                     className="text-xl font-Poppins-medium text-primary-300 py-2"
//                                     maxLength={12} // Account for formatting characters
//                                 />
//                             </View>
                            
//                             {error ? (
//                                 <Text className="text-red-500 font-Poppins-regular mt-2">{error}</Text>
//                             ) : (
//                                 <Text className="text-gray-400 font-Poppins-light mt-2">{t('phoneNumberHint')}</Text>
//                             )}
//                         </View>
                        
//                         {/* Button group - positioned at the bottom */}
//                         <View className="mt-auto mb-8">
//                             {/* Submit button */}
//                             <TouchableOpacity 
//                                 className={`flex-row items-center justify-center bg-primary-200 rounded-lg py-4 px-6 mb-4 ${!isFormValid ? 'opacity-70' : ''}`}
//                                 onPress={handleSubmit}
//                                 disabled={!isFormValid || isLoading}
//                             >
//                                 {isLoading ? (
//                                     <ActivityIndicator color="#ffffff" size="small" />
//                                 ) : (
//                                     <>
//                                         <Text className="text-xl font-Poppins-semibold text-white mr-2">{t('ConfirmPhoneNumberButton')}</Text>
//                                         <Image source={images.rightArrow} className="w-6 h-6" tintColor="#ffffff" />
//                                     </>
//                                 )}
//                             </TouchableOpacity>
                            
                          
//                         </View>
//                     </View>
//                 </TouchableWithoutFeedback>
//             </KeyboardAvoidingView>
//         </SafeAreaView>
//     );
// };

// export default PhoneNumber;



// // import { View, Text, TextInput, Touchable, TouchableOpacity, Image } from 'react-native'
// // import React, { useEffect, useState } from 'react'
// // import { SafeAreaView } from 'react-native-safe-area-context'
// // import { t } from 'i18next'
// // import { images } from '@/constants'
// // import { account, createUser } from '@/lib/appwrite'
// // import { DBUser } from "@/types/globals";
// // import { useGlobalContext } from '@/lib/globalProvider'
// // import { router } from 'expo-router'
// // const PhoneNumber = () => {
// //     const [phone, setPhone] = useState<string>('');
// //     const [error, setError] = useState('');
// //     const {refetch} = useGlobalContext()
// //     useEffect(() => {
// //          // Clear previous timeout to avoid stacking
// //          const timeout = setTimeout(() => {
// //             if (phone.length > 0 && phone.length < 10) {
// //                 setError(t('phonenumberinputerror'));
// //             } else {
// //                 setError('');
// //             }
// //         }, 200); // 1s delay to prevent unnecessary updates

// //         return () => clearTimeout(timeout);
// //     }, [phone])
    
// //     async function handlePress() {
// //         try {
// //             const user = await account.get()
// //             const userNew= {
// //                 $id : user.$id ,
// //                 name : user.name ,
// //                 email : user.email ,
// //                 avatar : "",
// //                 role : "client",
// //                 phone : phone
// //             }

// //             const results = await createUser(userNew as DBUser)

// //             if(results){
// //                 await refetch();
// //             }
// //         } catch (error) {
// //             console.log(error)
// //         }
// //     }

// //   return (
// //     <SafeAreaView className='flex p-2'>
// //         <Text className='text-3xl font-Poppins-semibold'>{t('addphoonenumber')}</Text>
// //         <View className='mt-40'>
// //             <Text className='text-xl font-Poppins-medium' >{t('providePhoneNumber')}</Text>
// //             <TextInput
// //             placeholder='0xxxxxxxxxx'
// //             onChangeText={(text) => setPhone(text)}
// //             defaultValue={phone}
// //             keyboardType='numeric'
// //             className={`text-xl font-Poppins-light `}
// //             />
// //         </View>
// //         <Text>{error}</Text>
// //         <TouchableOpacity className='flex-row items-center' onPress={()=>{handlePress()}}>
// //             <Text className='text-2xl font-Poppins-semibold text-primary-200 '>{t('ConfirmPhoneNumberButton')}</Text>
// //             <Image source={images.rightArrow} className='size-6' tintColor={"#263D7F"}/>
// //         </TouchableOpacity>
// //         <TouchableOpacity className='flex-row items-center' onPress={()=>{router.push('/(root)/home')}}>
// //             <Text className='text-2xl font-Poppins-semibold text-primary-200 '>{t('ConfirmPhoneNumberButton')}</Text>
// //             <Image source={images.rightArrow} className='size-6' tintColor={"#263D7F"}/>
// //         </TouchableOpacity>
// //     </SafeAreaView>
// //   )
// // }

// // export default PhoneNumber
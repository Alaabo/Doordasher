import { View, Text, TouchableOpacity, Image, Dimensions, FlatList, I18nManager, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getNearbyBusinesses, getReqComplete } from '@/lib/appwrite'
import { images } from '@/constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import {  ProductType, RequestType } from '@/types/globals'
import NoResults from '@/components/NoResults'
import RequestsCard from '@/components/RequestsCard'
import { useAuthContext } from '@/lib/authContext'
import i18next, { t } from 'i18next'
import BusinessesCard from '@/components/BusinessesCard'

import { router, usePathname } from 'expo-router'
import { useLocationContext } from '@/lib/locationContxt'

const Home = () => {

  const pathname = usePathname();
  const { width , height } = Dimensions.get('screen')
  const {userData , logout} = useAuthContext()
  const [req, setreq] = useState<RequestType[]>([])
  const {location} = useLocationContext()
  const [businesses, setbusinesses] = useState<ProductType[] | null>(null)
  const [isRTL , setIsRTL] = useState(false);
  useEffect(() => {
    const fetch = async () => {
      const results = await getReqComplete(userData?.$id!)
      const business = await getNearbyBusinesses(location)
      
      
      
      if(results){
        setreq(results as unknown as RequestType[])
      }
      if(business){
         setbusinesses(business)}
    }
    const currentLanguage = i18next.language;
      
    const isArabicLanguage = currentLanguage === 'ar';
    setIsRTL(isArabicLanguage);
    
    fetch()
  }, [pathname])
   

  
  function handleRedirect(request: string) {
    try {
      router.push(`/request/${request}`)
    } catch (error) {
      Alert.alert(t('error') , t('error') + error)
    }
  }

  return (
    <SafeAreaView className='p-2 h-screen bg-white'>
      <View className='flex-row items-center justify-between' 
        style={{
          borderBottomWidth: 2, 
          paddingBottom: 5, 
          borderBottomColor: "#B5C8FF",
          flexDirection: 'row'
        }}>
        <TouchableOpacity onPress={()=>router.push('/(root)/profile')}>
          <Image
            source={{ uri: userData?.avatar }}
            className="relative rounded-full"
            resizeMode='cover'
            style={{
              width: 64,
              height: 64
            }}
          />
        </TouchableOpacity>
        
        <View className='px-2' style={{ alignItems: 'center' }}>
          <Text className='text-2xl font-Poppins-semibold text-primary-300' style={{ textAlign:'center' }}>
            {t('WelcomtoHome')} 
          </Text>
          <Text className='text-2xl font-Poppins-bold text-primary-200' style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {userData?.name}
          </Text>
        </View>

        <TouchableOpacity 
          style={{backgroundColor: "#000B2B"}} 
          className='bg-primary-300 rounded-full p-2' 
          onPress={()=>router.push('/(root)/activity')}>
          <Image
            source={images.rightArrow}
            className="relative rounded-full"
            resizeMode='cover'
            style={{
              width: 32,
              height: 32
            }}
            tintColor={'white'}
          />
        </TouchableOpacity>
      </View>
      
      <Text className='text-xl font-Poppins-semibold mt-2 text-center'>{t('Requests')}</Text>
      
      {req.length == 0 ? <View><NoResults /></View> : 
        <View>
          <FlatList
            style={{width: "100%"}}
            showsHorizontalScrollIndicator={false}
            contentContainerClassName=""
            horizontal={true}
            inverted={isRTL} // Invert scroll direction for RTL
            data={req}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ width: width }} className='p-2 flex items-center justify-center'> 
                <RequestsCard request={item as unknown as RequestType} onPress={() => handleRedirect(item.$id!)} />
              </View>
            )}
            ListFooterComponent={
              <TouchableOpacity 
                onPress={()=>router.push('/RequestHistory')} 
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  padding: 16,
                  marginVertical: 8,
                  marginHorizontal: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }} 
                className='p-2 flex-row items-center justify-center'>    
                <Text className='text-2xl font-Poppins-semibold mt-2 text-center'>{t('deliveryHistory')}</Text>
                <Image 
                  source={images.backArrow} 
                  style={{ 
                    width: 32, 
                    height: 32,
                    transform: [{ rotate: isRTL ? '0deg' : '180deg' }] // Adjust arrow direction for RTL
                  }}
                />
              </TouchableOpacity>
            }
          />
        </View>
      }
    
      <Text className='text-xl font-Poppins-semibold text-center'>{t('NearbyProducts')}</Text>
      
      {!businesses ? <View><NoResults /></View> : 
        <View>
          <FlatList
            style={{width: "100%"}}
            showsHorizontalScrollIndicator={false}
            contentContainerClassName=""
            horizontal={true}
            inverted={isRTL} // Invert scroll direction for RTL
            data={businesses}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ width: width }} className='p-2 flex items-center justify-center '> 
                <BusinessesCard business={item} />
              </View>
            )}
            ListFooterComponent={
              <TouchableOpacity 
                onPress={()=>router.push('/(root)/activity')} 
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  padding: 16,
                  marginVertical: 8,
                  marginHorizontal: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }} 
                className='p-2 flex-row items-center justify-center'>    
                <Text className='text-2xl font-Poppins-semibold mt-2 text-center'>{t('PickFromCart')}</Text>
                <Image 
                  source={images.backArrow} 
                  style={{ 
                    width: 32, 
                    height: 32,
                    transform: [{ rotate: isRTL ? '0deg' : '180deg' }] // Adjust arrow direction for RTL
                  }}
                />
              </TouchableOpacity>
            }
            
          />
        </View>
      } 
      
      
    </SafeAreaView>
  )
}

export default Home

// import { View, Text, TouchableOpacity, Image,  Dimensions, FlatList } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import { getCompletedTransactions, getReqComplete } from '@/lib/appwrite'
// import { Href, Redirect, router, usePathname } from 'expo-router'
// import { images } from '@/constants'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import { t } from 'i18next'
// import { RequestType, Transaction } from '@/types/globals'
// import NoResults from '@/components/NoResults'
// import RequestsCard from '@/components/RequestsCard'
// import { useAuthContext } from '@/lib/authContext'
// import TransactionCard from '@/components/TransactionCard'
// // Removed import statement

// const Home = () => {
//   const pathname = usePathname();
//   const{logout , userData} = useAuthContext()
//   const {width , height} = Dimensions.get('screen')
  
//   const [req, setreq] = useState<RequestType[]>([])
//   const [transactions, settransactions] = useState<Transaction[]>([])
 
//   useEffect(() => {
//     const fetch = async () => {
//       const results = await getReqComplete(userData?.$id!)
//       const transac = await getCompletedTransactions(userData?.$id!)
//       if(results){
//         setreq(results as unknown as RequestType[])
//       }
//       if(transac){
//          settransactions(transac as unknown as Transaction[])}
//     }

//     fetch()
//   }, [pathname])
  
//   return (
//     <SafeAreaView className='p-2 h-screen bg-white '>
//       <View className='flex-row items-center justify-between ' style={{borderBottomWidth : 2 , paddingBottom : 5 , borderBottomColor : "#B5C8FF"}} >
//                    <TouchableOpacity onPress={()=>router.push('/(root)/profile')}>
//                    <Image
//                       source={{ uri: userData?.avatar }}
//                       className="relative rounded-full "
//                       resizeMode='cover'
//                       style={{
//                         width : 64,
//                         height : 64
//                       }}
//                     />
//                    </TouchableOpacity>
//                    <View className='px-2'>
//                    <Text className='text-2xl font-Poppins-semibold text-primary-300'>{t('WelcomtoHome')} </Text><Text className='text-2xl font-Poppins-bold text-primary-200'>{userData?.name}</Text>
//                    </View>

//                    <TouchableOpacity style={{backgroundColor : "#000B2B"}} className='bg-primary-300 rounded-full p-2' onPress={()=>router.push('/(root)/activity')}>
//                    <Image
//                       source={images.rightArrow}
//                       className="relative rounded-full  "
//                       resizeMode='cover'
//                       style={{
//                         width : 32,
//                         height : 32
//                       }}
//                       tintColor={'white'}
//                     />
//                    </TouchableOpacity>
//       </View>
//       <Text className='text-xl font-Poppins-semibold mt-2 text-center '>{t('Requests')}</Text>
//       {req.length == 0 ? <View ><NoResults /></View> : 
//      <View >
//        <FlatList
//       // className="p-10"
//       style={{width : "100%"}}
//       showsHorizontalScrollIndicator={false}
//       contentContainerClassName=""
//       horizontal = {true}
//       data={req}
//       keyExtractor={(item, index) => index.toString()}
//       renderItem={({ item }) => (
//                       <View style={{ width : width }} className='p-2 flex items-center justify-center'> 
//                       <RequestsCard request={item as unknown as RequestType} onPress={() => {router.push(`/request/${item.$id}` as Href)}} />
//                     </View>
//                          )}
//       ListFooterComponent={
//         <TouchableOpacity onPress={()=>router.push('/RequestHistory')} style={{  backgroundColor: '#FFFFFF',
//           borderRadius: 8,
//           padding: 16,
//           marginVertical: 8,
//           marginHorizontal: 16,
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.1,
//           shadowRadius: 4,
//           elevation: 2, }} className='p-2 flex-row items-center justify-center '>    
//             <Text  className='text-2xl font-Poppins-semibold mt-2 text-center '>{t('deliveryHistory')}</Text>
//             <Image source={images.backArrow} className='rotate-180' style={{ width: 32 , height: 32}}/>
//         </TouchableOpacity>
//       }
//       />
//      </View>
      
//     }
    
//       <Text className='text-xl font-Poppins-semibold  text-center'>{t('transactionsComp')}</Text>
//       {transactions.length == 0 ? <View ><NoResults /></View> : 
      
//       <View >
//        <FlatList
//       // className="p-10"
//       style={{width : "100%"}}
//       showsHorizontalScrollIndicator={false}
//       contentContainerClassName=""
//       horizontal = {true}
//       data={transactions}
//       keyExtractor={(item, index) => index.toString()}
//       renderItem={({ item }) => (
//                       <View style={{ width : width }} className='p-2 flex items-center justify-center'> 
//                       <TransactionCard transaction={item as unknown as Transaction} onPress={() => {router.push(`/request/${item.request}` as Href)}} />
//                     </View>
//                          )}

//                          ListFooterComponent={
//                           <TouchableOpacity onPress={()=>router.push('/TransactionHistory')} style={{ backgroundColor: '#FFFFFF',
//                             borderRadius: 8,
//                             padding: 16,
//                             marginVertical: 8,
//                             marginHorizontal: 16,
//                             shadowColor: '#000',
//                             shadowOffset: { width: 0, height: 2 },
//                             shadowOpacity: 0.1,
//                             shadowRadius: 4,
//                             elevation: 2, }} className='p-2 flex-row items-center justify-center '>    
//                               <Text  className='text-2xl font-Poppins-semibold mt-2 text-center '>{t('TransactionsHistory')}</Text>
//                               <Image source={images.backArrow} className='rotate-180' style={{ width: 32 , height: 32}}/>
//                           </TouchableOpacity>
//                         }
//       />
//      </View>
      
//       }
      
//       <TouchableOpacity style={{backgroundColor : "#000B2B" , padding : 20 , position : 'absolute' , bottom : 100 , left : 10 , right : 10}} onPress={()=>router.push('/(root)/activity')}>
//         <Text className='text-primary-100 font-Poppins-medium text-center text-xl'>{t('CreateRequestNow')}</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   )
// }

// export default Home
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  I18nManager
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { getReq } from '@/lib/appwrite';
import { useAuthContext } from '@/lib/authContext';
import { RequestType } from '@/types/globals';
import { router, usePathname } from 'expo-router';


const DeliveryRequestsScreen = () => {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const {userData} = useAuthContext();
  const pathname = usePathname();
  const isRTL = i18n.language === 'ar' || i18n.dir() === 'rtl';

  useEffect(() => {
    // Replace with your actual API call
    const fetchRequests = async () => {
      try {
        // Simulate API delay
        const results = await getReq(userData?.$id!)
        
        if(results){
          setRequests(results.map(result => ({
            ...result,
            pickUpLan: result.pickUpLan,
            pickUpLon: result.pickUpLon,
            destinyLan: result.destinyLan,
            destinyLon: result.destinyLon,
            packageDetails: result.packageDetails,
            price: result.price,
            status: result.status,
            user: result.user,
            driverid: result.driverid
          })));
        }
      } catch (error) {
        console.error('Error fetching delivery requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [pathname]);


  const getStatusIcon = (status: string): { name: keyof typeof Ionicons.glyphMap, color: string } => {
    switch (status) {
      case 'pending':
        return { name: 'time-outline', color: '#FFC107' }; // Yellow
      case 'accepted':
        return { name: 'checkmark-circle-outline', color: '#2196F3' }; // Blue
      case 'onRoad':
        return { name: 'car-outline', color: '#9C27B0' }; // Purple
      case 'delivered':
        return { name: 'checkmark-done-circle-outline', color: '#4CAF50' }; // Green
      default:
        return { name: 'help-circle-outline', color: '#9E9E9E' }; // Grey
    }
  };

  
  const renderRequestItem = ({ item }: { item: RequestType }) => {
    const statusIcon = getStatusIcon(item.status);
    
    return (
      <TouchableOpacity
        style={styles.requestItem}
        onPress={() => router.push(`/request/${item.$id}`)}
      >
        <View style={[styles.requestHeader, isRTL && styles.rowReverse]}>
          <Text style={styles.requestId}>#{item.$id!.slice(-4)}</Text>
          <View style={[styles.statusContainer, isRTL && styles.rowReverse]}>
            <Ionicons name={statusIcon.name} size={18} color={statusIcon.color} />
            <Text style={[
              styles.statusText, 
              { color: statusIcon.color },
              isRTL && styles.statusTextRTL
            ]}>
              {t(`request.status.${item.status}`)}
            </Text>
          </View>
        </View>
        
        <View style={styles.requestDetails}>
          <View style={[styles.detailRow, isRTL && styles.rowReverse]}>
            <Text style={[styles.detailLabel, isRTL && styles.textAlignRight]}>{t('request.package')}:</Text>
            <Text style={[styles.detailValue, isRTL && styles.textAlignRight]}>{item.packageDetails}</Text>
          </View>
          
          <View style={[styles.detailRow, isRTL && styles.rowReverse]}>
            <Text style={[styles.detailLabel, isRTL && styles.textAlignRight]}>{t('request.price')}:</Text>
            <Text style={[styles.detailValue, isRTL && styles.textAlignRight]}>${item.price.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.locationContainer, isRTL && styles.rowReverse]}>
            <View style={[styles.locationLine, isRTL && styles.locationLineRTL]}>
              <View style={styles.locationDot} />
              <View style={styles.locationDash} />
              <View style={[styles.locationDot, styles.destinationDot]} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={[styles.locationText, isRTL && styles.textAlignRight]} numberOfLines={1}>
                {t('request.pickup')}: {item.pickUpLan.toFixed(4)}, {item.pickUpLon.toFixed(4)}
              </Text>
              <Text style={[styles.locationText, isRTL && styles.textAlignRight]} numberOfLines={1}>
                {t('request.destination')}: {item.destinyLan.toFixed(4)}, {item.destinyLon.toFixed(4)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.userInfoText, isRTL && styles.textAlignRight]}>
            {t('request.from')}: {item.user}
            {item.driverid ? ` • ${t('request.driver')}: ${item.driverid}` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      <Text style={[styles.screenTitle, isRTL && styles.textAlignRight]}>{t('request.history')}</Text>
      
      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('request.noRequests')}</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          getItemLayout={(data, index) => ({
            length: 220, // Approximate height of each item
            offset: 220 * index,
            index,
          })}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  containerRTL: {
    // RTL specific container styles if needed
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  requestItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  statusTextRTL: {
    marginLeft: 0,
    marginRight: 4,
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  locationContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  locationLine: {
    width: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  locationLineRTL: {
    marginRight: 0,
    marginLeft: 8,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  destinationDot: {
    backgroundColor: '#F44336',
  },
  locationDash: {
    width: 2,
    height: 30,
    backgroundColor: '#CCCCCC',
    marginVertical: 4,
  },
  locationTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
    height: 50,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  userInfo: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 8,
  },
  userInfoText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // RTL specific styles
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textAlignRight: {
    textAlign: 'right',
  },
});

export default DeliveryRequestsScreen;


// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   FlatList, 
//   TouchableOpacity, 
//   StyleSheet, 
//   ActivityIndicator 
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { useTranslation } from 'react-i18next';
// import { Ionicons } from '@expo/vector-icons';
// import { getReq } from '@/lib/appwrite';
// import { useAuthContext } from '@/lib/authContext';
// import { RequestType } from '@/types/globals';
// import { router, usePathname } from 'expo-router';


// const DeliveryRequestsScreen = () => {
//   const { t } = useTranslation();
//   const [requests, setRequests] = useState<RequestType[]>([]);
//   const [loading, setLoading] = useState(true);
//   const {userData} = useAuthContext()
//   const pathname = usePathname();
//   useEffect(() => {
//     // Replace with your actual API call
//     const fetchRequests = async () => {
//       try {
//         // Simulate API delay
//         const results = await getReq(userData?.$id!)
        
//         if(results){
          
          
//           setRequests(results.map(result => ({
//             ...result,
//             pickUpLan: result.pickUpLan,
//             pickUpLon: result.pickUpLon,
//             destinyLan: result.destinyLan,
//             destinyLon: result.destinyLon,
//             packageDetails: result.packageDetails,
//             price: result.price,
//             status: result.status,
//             user: result.user,
//             driverid: result.driverid
//           })));
//         }
//       } catch (error) {
//         console.error('Error fetching delivery requests:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRequests();
//   }, [pathname]);


//   const getStatusIcon = (status: string): { name: keyof typeof Ionicons.glyphMap, color: string } => {
//     switch (status) {
//       case 'pending':
//         return { name: 'time-outline', color: '#FFC107' }; // Yellow
//       case 'accepted':
//         return { name: 'checkmark-circle-outline', color: '#2196F3' }; // Blue
//       case 'onRoad':
//         return { name: 'car-outline', color: '#9C27B0' }; // Purple
//       case 'delivered':
//         return { name: 'checkmark-done-circle-outline', color: '#4CAF50' }; // Green
//       default:
//         return { name: 'help-circle-outline', color: '#9E9E9E' }; // Grey
//     }
//   };

  
//   const renderRequestItem = ({ item }: { item: RequestType }) => {
//     const statusIcon = getStatusIcon(item.status);
    
//     return (
//       <TouchableOpacity
//         style={styles.requestItem}
//         onPress={() => router.push(`/request/${item.$id}`)}
//       >
//         <View style={styles.requestHeader}>
//           <Text style={styles.requestId}>#{item.$id!.slice(-4)}</Text>
//           <View style={styles.statusContainer}>
            
//             <Ionicons name={statusIcon.name} size={18} color={statusIcon.color} />
//             <Text style={[styles.statusText, { color: statusIcon.color }]}>
//               {t(`request.status.${item.status}`)}
//             </Text>
//           </View>
//         </View>
        
//         <View style={styles.requestDetails}>
//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>{t('request.package')}:</Text>
//             <Text style={styles.detailValue}>{item.packageDetails}</Text>
//           </View>
          
//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>{t('request.price')}:</Text>
//             <Text style={styles.detailValue}>${item.price.toFixed(2)}</Text>
//           </View>
          
//           <View style={styles.locationContainer}>
//             <View style={styles.locationLine}>
//               <View style={styles.locationDot} />
//               <View style={styles.locationDash} />
//               <View style={[styles.locationDot, styles.destinationDot]} />
//             </View>
//             <View style={styles.locationTextContainer}>
//               <Text style={styles.locationText} numberOfLines={1}>
//                 {t('request.pickup')}: {item.pickUpLan.toFixed(4)}, {item.pickUpLon.toFixed(4)}
//               </Text>
//               <Text style={styles.locationText} numberOfLines={1}>
//                 {t('request.destination')}: {item.destinyLan.toFixed(4)}, {item.destinyLon.toFixed(4)}
//               </Text>
//             </View>
//           </View>
//         </View>
        
//         <View style={styles.userInfo}>
//           <Text style={styles.userInfoText}>
//             {t('request.from')}: {item.user}
//             {item.driverid ? ` • ${t('request.driver')}: ${item.driverid}` : ''}
//           </Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0066CC" />
//         <Text style={styles.loadingText}>{t('common.loading')}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.screenTitle}>{t('request.history')}</Text>
      
//       {requests.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>{t('request.noRequests')}</Text>
//         </View>
//       ) : (
//         <FlatList
//         data={requests}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={renderRequestItem}
//         contentContainerStyle={styles.listContainer}
//         initialNumToRender={10}
//         maxToRenderPerBatch={10}
//         windowSize={5}
//         getItemLayout={(data, index) => ({
//           length: 220, // Approximate height of each item
//           offset: 220 * index,
//           index,
//         })}
//       />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//     padding: 16,
//   },
//   screenTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#333',
//   },
//   listContainer: {
//     paddingBottom: 16,
//   },
//   requestItem: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   requestHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   requestId: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statusText: {
//     marginLeft: 4,
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   requestDetails: {
//     marginBottom: 12,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#666',
//     width: 80,
//   },
//   detailValue: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '500',
//     flex: 1,
//   },
//   locationContainer: {
//     marginTop: 8,
//     flexDirection: 'row',
//   },
//   locationLine: {
//     width: 20,
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   locationDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#4CAF50',
//   },
//   destinationDot: {
//     backgroundColor: '#F44336',
//   },
//   locationDash: {
//     width: 2,
//     height: 30,
//     backgroundColor: '#CCCCCC',
//     marginVertical: 4,
//   },
//   locationTextContainer: {
//     flex: 1,
//     justifyContent: 'space-between',
//     height: 50,
//   },
//   locationText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   userInfo: {
//     borderTopWidth: 1,
//     borderTopColor: '#EEE',
//     paddingTop: 8,
//   },
//   userInfoText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#666',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//   },
// });

// export default DeliveryRequestsScreen;
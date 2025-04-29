import { View, Text, Dimensions, TextInput, TouchableOpacity, Image, Modal, FlatList, StyleSheet, ActivityIndicator, I18nManager } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import MapView, { MapPressEvent, Marker } from 'react-native-maps'
import { images } from '@/constants'
import { RequestType, Transaction } from '@/types/globals'
import axios from 'axios'
import { createReq, createTraansaction } from '@/lib/appwrite'
import { router, usePathname } from 'expo-router'
import { useAuthContext } from '@/lib/authContext'
import { useLocationContext } from '@/lib/locationContxt'
import { useTranslation } from 'react-i18next'
import i18next, { t } from 'i18next'

interface Place {
  displayName: { languageCode: string, text: string },
  location: { latitude: number, longitude: number }
}

export interface LocationProps {
  latitude: number,
  longitude: number
}

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY

const CreateRequestScreen = () => {
  
  const { width, height } = Dimensions.get('screen')
  const { userData } = useAuthContext()
  const { location } = useLocationContext()
  const [locationForWhat, setLocationForWhat] = useState<0 | 1 | 2>(0)
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState("")
  const [places, setPlaces] = useState<Place[] | null>(null)
  const [marker, setMarker] = useState<LocationProps | null>(null)
  const [packageDetails, setPackageDetails] = useState("")
  const [packagePrice, setPackagePrice] = useState<string>("")
  const [modalVisible, setModalVisible] = useState(false)
  const [pickupLocation, setPickupLocation] = useState<LocationProps | null>(null)
  const [deliveryLocation, setDeliveryLocation] = useState<LocationProps | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mapRef = useRef<MapView>(null)
   const pathname = usePathname();

  const [isRTL, setIsRTL] = useState(false)
 
  useEffect(() => {
    // Check if current language is Arabic to set RTL
    const currentLanguage = i18next.language;
    
    
    const isArabicLanguage = currentLanguage === 'ar';
    setIsRTL(isArabicLanguage);
    
    
  }, [pathname]);

  // Initialize marker with current location when component mounts
  useEffect(() => {
    if (location) {
      setMarker(location)
    }
  }, [])

  // Animate map when marker changes
  useEffect(() => {
    if (marker && mapRef.current) {
      animateToLocation(marker)
    }
  }, [marker])
  
  useEffect(() => {
    if (query?.length === 0) {
      setPlaces(null)
    }
  }, [query])

  const animateToLocation = (location: LocationProps) => {
    mapRef.current?.animateCamera({
      center: { latitude: location.latitude, longitude: location.longitude },
      pitch: 0,
      zoom: 15,
    }, { duration: 1000 })
  }

  const handleSearch = async (text: string) => {
    try {
      if (query.length > 0) {
        const response = await axios.post('https://places.googleapis.com/v1/places:searchText',
          {
            textQuery: query,
            pageSize: 5
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
              'X-Goog-FieldMask': 'places.displayName,places.location',
            }
          })
        setPlaces(response.data.places)
      } else {
        setPlaces(null)
      }
    } catch (error) {
      console.error("Error searching location:", error)
    }
  }

  const handlePress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate
    setMarker({ latitude, longitude })
  }

  const handlePlacePick = (location: { latitude: number; longitude: number }) => {
    if (!location) return
    setMarker(location)
    setPlaces(null)
    setQuery("")
  }

  const handleConfirm = () => {
    if (marker) {
      if (locationForWhat === 1) {
        setPickupLocation({ latitude: marker.latitude, longitude: marker.longitude })
      } else if (locationForWhat === 2) {
        setDeliveryLocation({ latitude: marker.latitude, longitude: marker.longitude })
      }
      setModalVisible(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (query) {
        handleSearch(query)
      }
    }, 500)

    return () => clearTimeout(handler)
  }, [query])

  const handlePublish = async () => {
    if (!pickupLocation || !deliveryLocation || !packageDetails || !packagePrice) {
      // Show error or alert to fill in all fields
      return
    }

    try {
      setIsSubmitting(true)
      if (userData?.$id) {
        const requestForm = {
          pickUpLan: pickupLocation.latitude,
          pickUpLon: pickupLocation.longitude,
          destinyLan: deliveryLocation.latitude,
          destinyLon: deliveryLocation.longitude,
          status: 'pending',
          packageDetails: packageDetails,
          price: Number(packagePrice),
          user: userData.$id,
        }
        
        const results = await createReq(requestForm as unknown as RequestType)
        if(!(results instanceof Error)){
          await createTraansaction({
            amount: results!.price,
            request: results!.$id,
            // @ts-ignore
            createdAt: results.$createdAt,
            driver: results!.driverid,
            user: results!.user
          } as unknown as Partial<Transaction>)
        }
        console.log(results);
        
        router.replace('/(root)/home')
      } else {
        console.error("User ID is undefined")
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGetLocationPackage = () => {
    if (location) {
      setPickupLocation({ latitude: location.latitude, longitude: location.longitude })
    }
  }

  const handleGetLocationDelivery = () => {
    if (location) {
      setDeliveryLocation({ latitude: location.latitude, longitude: location.longitude })
    }
  }

  const handleMapLocationForPickUp = () => {
    setModalVisible(true)
    setLocationForWhat(1)
  }

  const handleMapLocationForDelivery = () => {
    setModalVisible(true)
    setLocationForWhat(2)
  }

  const isReadyToSubmit = pickupLocation && deliveryLocation && packageDetails.trim().length > 0

  const handlePriceChange = (text : string) => {
    // Remove non-numeric characters
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Optional: Limit decimal places
    const formattedText = cleanedText.includes('.') 
      ? cleanedText.split('.').map((part, index) => 
          index === 0 ? part : part.slice(0, 2)
        ).join('.')
      : cleanedText;
  
    setPackagePrice(formattedText);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{t('CreateNewRequest')}</Text>
      </View>

      {/* Package Details Section */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('PackageDetails')}</Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, isRTL && styles.rtlText]}>{t('PackageDataLabel')}</Text>
          <TextInput
            style={[styles.textInput, isRTL && styles.rtlTextInput]}
            placeholder={t('PackageDetails')}
            placeholderTextColor="#999"
            value={packageDetails}
            onChangeText={setPackageDetails}
            multiline
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, isRTL && styles.rtlText]}>{t('PricePackage')}</Text>
          <TextInput
              style={[styles.textInput, isRTL && styles.rtlTextInput]}
              placeholder={t('PricePackage')}
              placeholderTextColor="#999"
              value={packagePrice}
              onChangeText={handlePriceChange}
              keyboardType="number-pad"
              textAlign={isRTL ? 'right' : 'left'}
            />
        </View>
      </View>

      {/* Pickup Location Section */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('PackageLocation')}</Text>
        <View style={[styles.locationOptions, isRTL && styles.rtlFlexRow]}>
          <TouchableOpacity 
            onPress={handleMapLocationForPickUp} 
            style={[styles.locationButton, styles.primaryOutlineButton]}
          >
            <Image source={images.map} style={styles.buttonIcon} resizeMode="contain" />
            <Text style={[styles.primaryButtonText, isRTL && styles.rtlText]}>{t('PickFromCart')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleGetLocationPackage} 
            style={[styles.locationButton, styles.primaryFilledButton]}
          >
            <Image source={images.marker} style={[styles.buttonIcon, {tintColor: "#B5C8FF"}]} resizeMode="contain" />
            <Text style={[styles.whiteButtonText, isRTL && styles.rtlText]}>{t('CurrentLocation')}</Text>
          </TouchableOpacity>
        </View>
        
        {pickupLocation && (
          <View style={[styles.locationChip, isRTL && styles.rtlFlexRow]}>
            <Image source={images.marker} style={styles.smallIcon} />
            <Text style={[styles.locationText, isRTL && styles.rtlText]}>
              {pickupLocation.latitude.toFixed(6)}, {pickupLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      {/* Delivery Location Section */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('DeliveryLocation')}</Text>
        <View style={[styles.locationOptions, isRTL && styles.rtlFlexRow]}>
          <TouchableOpacity 
            onPress={handleMapLocationForDelivery} 
            style={[styles.locationButton, styles.primaryOutlineButton]}
          >
            <Image source={images.map} style={styles.buttonIcon} resizeMode="contain" />
            <Text style={[styles.primaryButtonText, isRTL && styles.rtlText]}>{t('PickFromCart')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleGetLocationDelivery} 
            style={[styles.locationButton, styles.primaryFilledButton]}
          >
            <Image source={images.marker} style={[styles.buttonIcon, {tintColor: "#B5C8FF"}]} resizeMode="contain" />
            <Text style={[styles.whiteButtonText, isRTL && styles.rtlText]}>{t('CurrentLocation')}</Text>
          </TouchableOpacity>
        </View>
        
        {deliveryLocation && (
          <View style={[styles.locationChip, isRTL && styles.rtlFlexRow]}>
            <Image source={images.marker} style={styles.smallIcon} />
            <Text style={[styles.locationText, isRTL && styles.rtlText]}>
              {deliveryLocation.latitude.toFixed(6)}, {deliveryLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <Text style={[styles.summaryTitle, isRTL && styles.rtlText]}>{t('Summary')}</Text>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryItem, isRTL && styles.rtlFlexRow]}>
            <Text style={[styles.summaryLabel, isRTL && styles.rtlText]}>{t('PackageDetails')}</Text>
            <Text 
              style={[styles.summaryValue, isRTL && styles.rtlTextRight]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {packageDetails || '-'}
            </Text>
          </View>
          
          <View style={[styles.summaryItem, isRTL && styles.rtlFlexRow]}>
            <Text style={[styles.summaryLabel, isRTL && styles.rtlText]}>{t('PricePackage')}</Text>
            <Text style={[styles.summaryValue, isRTL && styles.rtlTextRight]}>
              {packagePrice ? `${packagePrice} DZD` : '-'}
            </Text>
          </View>
          
          <View style={[styles.summaryItem, isRTL && styles.rtlFlexRow]}>
            <Text style={[styles.summaryLabel, isRTL && styles.rtlText]}>{t('PackageLocation')}</Text>
            <Text style={[styles.summaryValue, isRTL && styles.rtlTextRight]} numberOfLines={1}>
              {pickupLocation ? 
                `${pickupLocation.latitude.toFixed(4)}, ${pickupLocation.longitude.toFixed(4)}` : 
                '-'}
            </Text>
          </View>
          
          <View style={[styles.summaryItem, isRTL && styles.rtlFlexRow]}>
            <Text style={[styles.summaryLabel, isRTL && styles.rtlText]}>{t('DeliverLocation')}</Text>
            <Text style={[styles.summaryValue, isRTL && styles.rtlTextRight]} numberOfLines={1}>
              {deliveryLocation ? 
                `${deliveryLocation.latitude.toFixed(4)}, ${deliveryLocation.longitude.toFixed(4)}` : 
                '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Publish Button */}
      <TouchableOpacity 
        onPress={handlePublish} 
        disabled={!isReadyToSubmit || isSubmitting}
        style={[
          styles.submitButton, 
          !isReadyToSubmit && styles.disabledButton
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#B5C8FF" size="small" />
        ) : (
          <>
            <Image 
              source={images.edit} 
              style={[styles.buttonIcon, {tintColor: "#B5C8FF"}]} 
              resizeMode="contain" 
            />
            <Text style={[styles.submitButtonText, isRTL && styles.rtlText]}>{t('ConfirmRequest')}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Location Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSearchContainer, { paddingTop: insets.top + 10 }]}>
            <View style={[styles.searchBar, isRTL && styles.rtlFlexRow]}>
              <Image source={images.search} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, isRTL && styles.rtlTextInput]}
                placeholder="Search for a location..."
                placeholderTextColor="#666"
                value={query}
                onChangeText={setQuery}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
            
          
          </View>

          {places && places.length > 0 && (
            <FlatList
              style={styles.placesList}
              data={places}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.placeItem, isRTL && styles.rtlFlexRow]} 
                  onPress={() => handlePlacePick(item.location)}
                >
                  <Image source={images.marker} style={styles.placeIcon} />
                  <View style={styles.placeDetails}>
                    <Text style={[styles.placeName, isRTL && styles.rtlText]}>{item.displayName.text}</Text>
                    <Text style={[styles.placeCoords, isRTL && styles.rtlText]}>
                      {item.location.latitude.toFixed(6)}, {item.location.longitude.toFixed(6)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: location?.latitude || 0,
                longitude: location?.longitude || 0,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              }}
              onPress={handlePress}
            >
              {marker && (
                <Marker
                  coordinate={marker}
                  title="Selected Location"
                  image={images.marker}
                />
              )}
            </MapView>
          </View>

          <TouchableOpacity 
            onPress={handleConfirm} 
            disabled={!marker}
            style={[
              styles.confirmLocationButton,
              !marker && styles.disabledButton
            ]} 
          >
            <Text style={[styles.confirmButtonText, isRTL && styles.rtlText]}>{t('Confirm')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000B2B',
    textAlign: 'left',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000B2B',
    marginBottom: 12,
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    textAlign: 'left',
  },
  textInput: {
    borderBottomWidth: 2,
    borderBottomColor: '#000B2B',
    paddingVertical: 8,
    fontSize: 16,
    color: '#000B2B',
    textAlign: 'left',
  },
  locationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flexBasis: '48%',
  },
  primaryOutlineButton: {
    borderWidth: 2,
    borderColor: '#000B2B',
    backgroundColor: '#B5C8FF',
  },
  primaryFilledButton: {
    backgroundColor: '#000B2B',
    borderWidth: 2,
    borderColor: '#000B2B',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000B2B',
    marginLeft: 8,
  },
  whiteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B5C8FF',
    marginLeft: 8,
  },
  buttonIcon: {
    width: 24,
    height: 24,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 16,
    marginTop: 8,
  },
  smallIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000B2B',
    marginBottom: 8,
    textAlign: 'left',
  },
  summaryCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#000B2B',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(181, 200, 255, 0.2)',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000B2B',
    flex: 1,
    textAlign: 'left',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000B2B',
    textAlign: 'right',
    flex: 1,
  },
  submitButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#000B2B',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#B5C8FF',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 11, 43, 0.9)',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },
  closeModalButton: {
    marginLeft: 12,
    padding: 8,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#000B2B',
  },
  placesList: {
    position: 'absolute',
    zIndex: 50,
    top: 100,
    left: 16,
    right: 16,
    maxHeight: 200,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  placeIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  placeDetails: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000B2B',
    textAlign: 'left',
  },
  placeCoords: {
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
  },
  mapContainer: {
    flex: 1,
    marginTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  confirmLocationButton: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: '#B5C8FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000B2B',
    textAlign: 'center',
  },
  
  // RTL specific styles
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlTextInput: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlTextRight: {
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  rtlFlexRow: {
    flexDirection: 'row-reverse',
  },
  rtlIcon: {
    transform: [{ scaleX: -1 }],
  }
});

export default CreateRequestScreen;

// import { View, Text, Dimensions, TextInput, TouchableOpacity, Image, Modal, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
// import React, { useEffect, useRef, useState } from 'react'
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
// import MapView, { MapPressEvent, Marker } from 'react-native-maps'
// import { t } from 'i18next'
// import { images } from '@/constants'
// import { RequestType, Transaction } from '@/types/globals'
// import axios from 'axios'
// import { createReq, createTraansaction } from '@/lib/appwrite'
// import { router } from 'expo-router'
// import { useAuthContext } from '@/lib/authContext'
// import { useLocationContext } from '@/lib/locationContxt'

// interface Place {
//   displayName: { languageCode: string, text: string },
//   location: { latitude: number, longitude: number }
// }

// export interface LocationProps {
//   latitude: number,
//   longitude: number
// }

// const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY

// const CreateRequestScreen = () => {
//   const { width, height } = Dimensions.get('screen')
//   const { userData } = useAuthContext()
//   const { location } = useLocationContext()
//   const [locationForWhat, setLocationForWhat] = useState<0 | 1 | 2>(0)
//   const insets = useSafeAreaInsets()
//   const [query, setQuery] = useState("")
//   const [places, setPlaces] = useState<Place[] | null>(null)
//   const [marker, setMarker] = useState<LocationProps | null>(null)
//   const [packageDetails, setPackageDetails] = useState("")
//   const [packagePrice, setPackagePrice] = useState("200")
//   const [modalVisible, setModalVisible] = useState(false)
//   const [pickupLocation, setPickupLocation] = useState<LocationProps | null>(null)
//   const [deliveryLocation, setDeliveryLocation] = useState<LocationProps | null>(null)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const mapRef = useRef<MapView>(null)

//   // Initialize marker with current location when component mounts
//   useEffect(() => {
//     if (location) {
//       setMarker(location)
//     }
//   }, [])

//   // Animate map when marker changes
//   useEffect(() => {
//     if (marker && mapRef.current) {
//       animateToLocation(marker)
//     }
//   }, [marker])
//   useEffect(() => {
//     if (query?.length ===0) {
//       setPlaces(null)
//     }
//   }, [query])

//   const animateToLocation = (location: LocationProps) => {
//     mapRef.current?.animateCamera({
//       center: { latitude: location.latitude, longitude: location.longitude },
//       pitch: 0,
//       zoom: 15,
//     }, { duration: 1000 })
//   }

//   const handleSearch = async (text: string) => {
//     try {
//       if (query.length > 0) {
//         const response = await axios.post('https://places.googleapis.com/v1/places:searchText',
//           {
//             textQuery: query,
//             pageSize: 5
//           },
//           {
//             headers: {
//               'Content-Type': 'application/json',
//               'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
//               'X-Goog-FieldMask': 'places.displayName,places.location',
//             }
//           })
//         setPlaces(response.data.places)
//       } else {
//         setPlaces(null)
//       }
//     } catch (error) {
//       console.error("Error searching location:", error)
//     }
//   }

//   const handlePress = (event: MapPressEvent) => {
//     const { latitude, longitude } = event.nativeEvent.coordinate
//     setMarker({ latitude, longitude })
//   }

//   const handlePlacePick = (location: { latitude: number; longitude: number }) => {
//     if (!location) return
//     setMarker(location)
//     setPlaces(null)
//     setQuery("")
//   }

//   const handleConfirm = () => {
//     if (marker) {
//       if (locationForWhat === 1) {
//         setPickupLocation({ latitude: marker.latitude, longitude: marker.longitude })
//       } else if (locationForWhat === 2) {
//         setDeliveryLocation({ latitude: marker.latitude, longitude: marker.longitude })
//       }
//       setModalVisible(false)
//     }
//   }

//   // Debounce search
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       if (query) {
//         handleSearch(query)
//       }
//     }, 500)

//     return () => clearTimeout(handler)
//   }, [query])

//   const handlePublish = async () => {
//     if (!pickupLocation || !deliveryLocation || !packageDetails || !packagePrice) {
//       // Show error or alert to fill in all fields
//       return
//     }

//     try {
//       setIsSubmitting(true)
//       if (userData?.$id) {
//         const requestForm = {
//           pickUpLan: pickupLocation.latitude,
//           pickUpLon: pickupLocation.longitude,
//           destinyLan: deliveryLocation.latitude,
//           destinyLon: deliveryLocation.longitude,
//           status: 'pending',
//           packageDetails: packageDetails,
//           price: Number(packagePrice),
//           user: userData.$id,
//         }
        

//         const results = await createReq(requestForm as unknown as RequestType)
//         if(!(results instanceof Error)){
//           await createTraansaction({
//             amount : results!.price ,
//             request : results!.$id ,
//             // @ts-ignore
//             createdAt : results.$createdAt ,
//             driver : results!.driverid ,
//             user : results!.user
            
//           } as unknown as Partial<Transaction>)
//         }
//         console.log(results);
        
//         router.replace('/(root)/home')
//       } else {
//         console.error("User ID is undefined")
//       }
//     } catch (error) {
//       console.log(error)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleGetLocationPackage = () => {
//     if (location) {
//       setPickupLocation({ latitude: location.latitude, longitude: location.longitude })
//     }
//   }

//   const handleGetLocationDelivery = () => {
//     if (location) {
//       setDeliveryLocation({ latitude: location.latitude, longitude: location.longitude })
//     }
//   }

//   const handleMapLocationForPickUp = () => {
//     setModalVisible(true)
//     setLocationForWhat(1)
//   }

//   const handleMapLocationForDelivery = () => {
//     setModalVisible(true)
//     setLocationForWhat(2)
//   }

//   const isReadyToSubmit = pickupLocation && deliveryLocation && packageDetails.trim().length > 0

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.headerContainer}>
//         <Text style={styles.headerTitle}>{t('CreateNewRequest')}</Text>
//       </View>

//       {/* Package Details Section */}
//       <View style={styles.sectionContainer}>
//         <Text style={styles.sectionTitle}>{t('PackageDetails')}</Text>
        
//         <View style={styles.inputContainer}>
//           <Text style={styles.inputLabel}>{t('PackageDataLabel')}</Text>
//           <TextInput
//             style={styles.textInput}
//             placeholder={t('PackageDetails')}
//             placeholderTextColor="#999"
//             value={packageDetails}
//             onChangeText={setPackageDetails}
//             multiline
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Text style={styles.inputLabel}>{t('PricePackage')}</Text>
//           <TextInput
//             style={styles.textInput}
//             placeholder={t('PricePackage')}
//             placeholderTextColor="#999"
//             value={packagePrice}
//             onChangeText={setPackagePrice}
//             keyboardType="numeric"
//           />
//         </View>
//       </View>

//       {/* Pickup Location Section */}
//       <View style={styles.sectionContainer}>
//         <Text style={styles.sectionTitle}>{t('PackageLocation')}</Text>
//         <View style={styles.locationOptions}>
//           <TouchableOpacity 
//             onPress={handleMapLocationForPickUp} 
//             style={[styles.locationButton, styles.primaryOutlineButton]}
//           >
//             <Image source={images.map} style={styles.buttonIcon} resizeMode="contain" />
//             <Text style={styles.primaryButtonText}>{t('PickFromCart')}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             onPress={handleGetLocationPackage} 
//             style={[styles.locationButton, styles.primaryFilledButton]}
//           >
//             <Image source={images.marker} style={[styles.buttonIcon, {tintColor: "#B5C8FF"}]} resizeMode="contain" />
//             <Text style={styles.whiteButtonText}>{t('CurrentLocation')}</Text>
//           </TouchableOpacity>
//         </View>
        
//         {pickupLocation && (
//           <View style={styles.locationChip}>
//             <Image source={images.marker} style={styles.smallIcon} />
//             <Text style={styles.locationText}>
//               {pickupLocation.latitude.toFixed(6)}, {pickupLocation.longitude.toFixed(6)}
//             </Text>
//           </View>
//         )}
//       </View>

//       {/* Delivery Location Section */}
//       <View style={styles.sectionContainer}>
//         <Text style={styles.sectionTitle}>{t('DeliveryLocation')}</Text>
//         <View style={styles.locationOptions}>
//           <TouchableOpacity 
//             onPress={handleMapLocationForDelivery} 
//             style={[styles.locationButton, styles.primaryOutlineButton]}
//           >
//             <Image source={images.map} style={styles.buttonIcon} resizeMode="contain" />
//             <Text style={styles.primaryButtonText}>{t('PickFromCart')}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             onPress={handleGetLocationDelivery} 
//             style={[styles.locationButton, styles.primaryFilledButton]}
//           >
//             <Image source={images.marker} style={[styles.buttonIcon, {tintColor: "#B5C8FF"}]} resizeMode="contain" />
//             <Text style={styles.whiteButtonText}>{t('CurrentLocation')}</Text>
//           </TouchableOpacity>
//         </View>
        
//         {deliveryLocation && (
//           <View style={styles.locationChip}>
//             <Image source={images.marker} style={styles.smallIcon} />
//             <Text style={styles.locationText}>
//               {deliveryLocation.latitude.toFixed(6)}, {deliveryLocation.longitude.toFixed(6)}
//             </Text>
//           </View>
//         )}
//       </View>

//       {/* Summary Section */}
//       <View style={styles.summaryContainer}>
//         <Text style={styles.summaryTitle}>{t('Summary')}</Text>
//         <View style={styles.summaryCard}>
//           <View style={styles.summaryItem}>
//             <Text style={styles.summaryLabel}>{t('PackageDetails')}</Text>
//             <Text style={styles.summaryValue} numberOfLines={1} ellipsizeMode="tail">
//               {packageDetails || '-'}
//             </Text>
//           </View>
          
//           <View style={styles.summaryItem}>
//             <Text style={styles.summaryLabel}>{t('PricePackage')}</Text>
//             <Text style={styles.summaryValue}>
//               {packagePrice ? `${packagePrice} DZD` : '-'}
//             </Text>
//           </View>
          
//           <View style={styles.summaryItem}>
//             <Text style={styles.summaryLabel}>{t('PackageLocation')}</Text>
//             <Text style={styles.summaryValue} numberOfLines={1}>
//               {pickupLocation ? 
//                 `${pickupLocation.latitude.toFixed(4)}, ${pickupLocation.longitude.toFixed(4)}` : 
//                 '-'}
//             </Text>
//           </View>
          
//           <View style={styles.summaryItem}>
//             <Text style={styles.summaryLabel}>{t('DeliverLocation')}</Text>
//             <Text style={styles.summaryValue} numberOfLines={1}>
//               {deliveryLocation ? 
//                 `${deliveryLocation.latitude.toFixed(4)}, ${deliveryLocation.longitude.toFixed(4)}` : 
//                 '-'}
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* Publish Button */}
//       <TouchableOpacity 
//         onPress={handlePublish} 
//         disabled={!isReadyToSubmit || isSubmitting}
//         style={[
//           styles.submitButton, 
//           !isReadyToSubmit && styles.disabledButton
//         ]}
//       >
//         {isSubmitting ? (
//           <ActivityIndicator color="#B5C8FF" size="small" />
//         ) : (
//           <>
//             <Image 
//               source={images.edit} 
//               style={[styles.buttonIcon, {tintColor: "#B5C8FF"}]} 
//               resizeMode="contain" 
//             />
//             <Text style={styles.submitButtonText}>{t('ConfirmRequest')}</Text>
//           </>
//         )}
//       </TouchableOpacity>

//       {/* Location Selection Modal */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalSearchContainer, { paddingTop: insets.top + 10 }]}>
//             <View style={styles.searchBar}>
//               <Image source={images.search} style={styles.searchIcon} />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search for a location..."
//                 placeholderTextColor="#666"
//                 value={query}
//                 onChangeText={setQuery}
//               />
//             </View>
            
//             <TouchableOpacity 
//               style={styles.closeModalButton} 
//               onPress={() => setModalVisible(false)}
//             >
//               <Image source={images.rightArrow} style={styles.closeIcon} />
//             </TouchableOpacity>
//           </View>

//           {places && places.length > 0 && (
//             <FlatList
//               style={styles.placesList}
//               data={places}
//               keyExtractor={(item, index) => index.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity 
//                   style={styles.placeItem} 
//                   onPress={() => handlePlacePick(item.location)}
//                 >
//                   <Image source={images.marker} style={styles.placeIcon} />
//                   <View style={styles.placeDetails}>
//                     <Text style={styles.placeName}>{item.displayName.text}</Text>
//                     <Text style={styles.placeCoords}>
//                       {item.location.latitude.toFixed(6)}, {item.location.longitude.toFixed(6)}
//                     </Text>
//                   </View>
//                 </TouchableOpacity>
//               )}
//             />
//           )}

//           <View style={styles.mapContainer}>
//             <MapView
//               ref={mapRef}
//               style={styles.map}
//               initialRegion={{
//                 latitude: location?.latitude || 0,
//                 longitude: location?.longitude || 0,
//                 latitudeDelta: 0.01,
//                 longitudeDelta: 0.01
//               }}
//               onPress={handlePress}
//             >
//               {marker && (
//                 <Marker
//                   coordinate={marker}
//                   title="Selected Location"
//                   image={images.marker}
//                 />
//               )}
//             </MapView>
//           </View>

//           <TouchableOpacity 
//             onPress={handleConfirm} 
//             disabled={!marker}
//             style={[
//               styles.confirmLocationButton,
//               !marker && styles.disabledButton
//             ]} 
//           >
//             <Text style={styles.confirmButtonText}>{t('Confirm')}</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   headerContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F2F2F2',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#000B2B',
//   },
//   sectionContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F2F2F2',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#000B2B',
//     marginBottom: 12,
//   },
//   inputContainer: {
//     marginBottom: 16,
//   },
//   inputLabel: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#333',
//     marginBottom: 8,
//   },
//   textInput: {
//     borderBottomWidth: 2,
//     borderBottomColor: '#000B2B',
//     paddingVertical: 8,
//     fontSize: 16,
//     color: '#000B2B',
//   },
//   locationOptions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 8,
//   },
//   locationButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 8,
//     flexBasis: '48%',
//   },
//   primaryOutlineButton: {
//     borderWidth: 2,
//     borderColor: '#000B2B',
//     backgroundColor: '#B5C8FF',
//   },
//   primaryFilledButton: {
//     backgroundColor: '#000B2B',
//     borderWidth: 2,
//     borderColor: '#000B2B',
//   },
//   primaryButtonText: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#000B2B',
//     marginLeft: 8,
//   },
//   whiteButtonText: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#B5C8FF',
//     marginLeft: 8,
//   },
//   buttonIcon: {
//     width: 24,
//     height: 24,
//   },
//   locationChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//     padding: 8,
//     borderRadius: 16,
//     marginTop: 8,
//   },
//   smallIcon: {
//     width: 16,
//     height: 16,
//     marginRight: 4,
//   },
//   locationText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   summaryContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   summaryTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#000B2B',
//     marginBottom: 8,
//   },
//   summaryCard: {
//     borderWidth: 2,
//     borderStyle: 'dashed',
//     borderColor: '#000B2B',
//     borderRadius: 8,
//     padding: 12,
//     backgroundColor: 'rgba(181, 200, 255, 0.2)',
//   },
//   summaryItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginVertical: 6,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#000B2B',
//     flex: 1,
//   },
//   summaryValue: {
//     fontSize: 14,
//     color: '#000B2B',
//     textAlign: 'right',
//     flex: 1,
//   },
//   submitButton: {
//     position: 'absolute',
//     bottom: 80,
//     left: 16,
//     right: 16,
//     backgroundColor: '#000B2B',
//     padding: 16,
//     borderRadius: 8,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   submitButtonText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#B5C8FF',
//     marginLeft: 8,
//   },
//   disabledButton: {
//     opacity: 0.6,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 11, 43, 0.9)',
//   },
//   modalSearchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEE',
//   },
//   searchBar: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F1F1F1',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     height: 48,
//   },
//   searchIcon: {
//     width: 20,
//     height: 20,
//     marginRight: 8,
//     tintColor: '#666',
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#333',
//   },
//   closeModalButton: {
//     marginLeft: 12,
//     padding: 8,
//   },
//   closeIcon: {
//     width: 24,
//     height: 24,
//     tintColor: '#000B2B',
//   },
//   placesList: {
//     position: 'absolute',
//     zIndex: 50,
//     top: 100,
//     left: 16,
//     right: 16,
//     maxHeight: 200,
//   },
//   placeItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: 'white',
//     borderRadius: 8,
//     marginVertical: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   placeIcon: {
//     width: 20,
//     height: 20,
//     marginRight: 8,
//   },
//   placeDetails: {
//     flex: 1,
//   },
//   placeName: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#000B2B',
//   },
//   placeCoords: {
//     fontSize: 12,
//     color: '#666',
//   },
//   mapContainer: {
  
//     flex: 1,
//     marginTop: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
//   confirmLocationButton: {
//     position: 'absolute',
//     bottom: 40,
//     left: 16,
//     right: 16,
//     backgroundColor: '#B5C8FF',
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   confirmButtonText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#000B2B',
//   },
// });

// export default CreateRequestScreen;


// // import { View, Text, Dimensions, TextInput, TouchableOpacity, Image, Modal, FlatList, StyleSheet } from 'react-native'
// // import React, { useEffect, useRef, useState } from 'react'
// // import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
// // import MapView, { MapPressEvent, Marker } from 'react-native-maps';
// // import MapScreen from '@/components/MapScreen';
// // import { t } from 'i18next';
// // import { images } from '@/constants';
// // import LocationSearchModal from '../../components/MapModal';
// // import { RequestType } from '@/types/globals';
// // import axios from 'axios';
// // import { createReq } from '@/lib/appwrite';
// // import { router } from 'expo-router';
// // import { useAuthContext } from '@/lib/authContext';
// // import { useLocationContext } from '@/lib/locationContxt';

// // interface place {
// //   displayName: { languageCode: string, text: string },
// //   location: { latitude: number, longitude: number }
// // }

// // const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;

// // export interface locationProps  {
// // latitude: number, 
// // longitude: number
// // }

// // const activity = () => {
// //   const {width , height}= Dimensions.get('screen')
// //   // const{user , location} = useGlobalContext()
// //   const {userData} = useAuthContext()
// //   const {location} = useLocationContext()
// //   const [Location, setLocation] = useState<locationProps | null>()
// //   const [LocationForWhat, setLocationForWhat] = useState<0 | 1 | 2>(0)
// //   // TextSewarchElements
// //   const [Locations, setLocations] = useState([])
// //   const insets = useSafeAreaInsets();
// //   const [query, setQuery] = useState("");
// //   const [places, setPlaces] = useState<place[] | null>(null);
// //   const [marker, setMarker] = useState<locationProps | null>(null);
// //   const [packageDetails, setpackageDetails] = useState("")
// //   const [packagePrice, setpackagePrice] = useState("200")
// //   const [modalVisible, setModalVisible] = useState(false);
// //   const [pickupLocation, setpickupLocation] = useState<locationProps | null>(null)
// //   const [delliveryLocation, setdelliveryLocation] = useState<locationProps | null>(null)
// //   const mapRef = useRef<MapView>(null);
// //   // Initialize marker with the provided location when component mounts
// //       useEffect(() => {
// //           if (location) {
// //               setMarker(location);
// //           }
// //       }, []);

// //    // Animate map when marker changes
// //       useEffect(() => {
// //           if (marker && mapRef.current) {
// //               animateToLocation(marker);
// //           }
// //       }, [marker]);
// //       const animateToLocation = (location: locationProps) => {
// //         mapRef.current?.animateCamera({
// //             center: { latitude: location.latitude, longitude: location.longitude },
// //             pitch: 0,
// //             zoom: 15,
// //         }, { duration: 1000 });
// //     };

// //     const handleSearch = async (text: string) => {
// //             try {
// //                 if (query.length > 0) {
// //                     const response = await axios.post('https://places.googleapis.com/v1/places:searchText',
// //                         {
// //                             textQuery: query,
// //                             pageSize: 5
// //                         },
// //                         {
// //                             headers: {
// //                                 'Content-Type': 'application/json',
// //                                 'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
// //                                 'X-Goog-FieldMask': 'places.displayName,places.location',
// //                             }
// //                         });
// //                     setPlaces(response.data.places);
// //                 } else {
// //                     setPlaces(null);
// //                 }
// //             } catch (error) {
// //                 console.error("Error searching location:", error);
// //             }
// //         };

// //         const handlePress = (event: MapPressEvent) => {
// //                 const { latitude, longitude } = event.nativeEvent.coordinate;
// //                 setMarker({ latitude, longitude });
// //                 // Animation is now handled by the useEffect hook
// //             };

// //             const handlePlacePick = (location: { latitude: number; longitude: number }) => {
// //               if (!location) return;
// //               setMarker(location);
// //               setPlaces(null);
// //               setQuery("");
// //               // Animation is now handled by the useEffect hook
// //           };

// //           const handleConfirm = () => {
// //           if(marker){
// //             if(LocationForWhat == 1){
// //                setpickupLocation({latitude :marker.latitude! , longitude :marker.longitude!  })
// //               setModalVisible(false)
// //             }
// //             if(LocationForWhat == 2){
// //               setdelliveryLocation({latitude :marker.latitude! , longitude :marker.longitude!  })
// //              setModalVisible(false)
// //             }
// //           }
// //         };

// //           useEffect(() => {
// //                 const handler = setTimeout(() => {
// //                     if (query) {
// //                         handleSearch(query);
// //                     }
// //                 }, 500);
        
// //                 return () => clearTimeout(handler);
// //             }, [query]);
        
// //   function HandlePublish() {
// //     try {
// //       if (userData?.$id) {
// //         const requestForm = {
// //       pickUpLan : pickupLocation?.latitude ,
// //       pickUpLon   : pickupLocation?.longitude,
// //       destinyLan  : delliveryLocation?.latitude,
// //       destinyLon  :delliveryLocation?.longitude,
// //       status  :   'pending' ,
// //       packageDetails : packageDetails ,
// //       price : Number(packagePrice) ,
// //       user : userData.$id ,
// //         }

// //       createReq(requestForm as unknown as RequestType)
// //       router.replace('/(root)/home')
// //       } else {
// //         console.error("User ID is undefined");
// //       }
// //     } catch (error) {
// //       console.log(error)
// //     }
    
// //   }

// //   function handleGetLocationPackage (){
      
// //       setpickupLocation({latitude : location?.latitude! , longitude :location?.longitude! })
// //     }
// //   function handleGetLocationDelivery (){
// //     setdelliveryLocation({latitude : location?.latitude! , longitude :location?.longitude! })
// //   }

// //   function handleMapLocationForPickUp(){
// //     setModalVisible(true)
// //     setLocationForWhat(1)
// //   }

// //   function handleMapLocationforDelivery(){
// //     setModalVisible(true)
// //     setLocationForWhat(2)
// //   }

// //   return (
// //     <SafeAreaView style={{backgroundColor : 'white' , width : width , height: height}}>

// //       <Text className=' p-2 text-4xl font-Poppins-semibold'>{t('CreateNewRequest')}</Text>
// //       <Text className='p-2 text-2xl font-Poppins-medium'>{t('PackageDetails')}</Text>
// //       <View className='p-2'>
// //         <Text className='text-xl font-Poppins-medium'>{t('PackageDataLabel')}</Text>
// //           <TextInput
// //           className='text-xl font-Poppins-semibold mb-4'
// //           placeholder={t('PackageDetails')}
// //           placeholderTextColor={"#000B2B"}
// //           style={{   borderBottomColor : "#black" , borderBottomWidth : 2  }}
// //           value={packageDetails}
// //           onChangeText={setpackageDetails}
// //           />

// //         <Text className='text-xl font-Poppins-medium'>{t('PricePackage')}</Text>
// //           <TextInput
// //           className='text-xl font-Poppins-semibold mb-4'
// //           placeholder={t('PricePackage')}
// //           placeholderTextColor={"#000B2B"}
// //           style={{   borderBottomColor : "#black" , borderBottomWidth : 2  }}
// //           value={packagePrice}
// //           onChangeText={setpackagePrice}
// //           keyboardType='numeric'
// //           />
// //       </View>
// //       {/* package location section */}
// //       <Text className='text-xl font-Poppins-medium p-2'>{t('PackageLocation')}</Text>
// //       <View className='flex-row justify-between p-2'>
// //         <TouchableOpacity onPress={() => handleMapLocationForPickUp()} className='flex-row justify-center items-center' style={{ padding : 10 , borderColor : "#000B2B" , borderWidth : 2 ,backgroundColor : "#B5C8FF" ,  opacity : 0.9 }}>
// //             <Image source={images.map} style={{ width : 32 , height : 32}} resizeMode='contain'/>
// //             <Text className='text-xl font-Poppins-medium mx-2'>{t('PickFromCart')}</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity onPress={()=>{handleGetLocationPackage()}} className='flex-row justify-center items-center' style={{ padding : 10 , borderColor : "#000B2B" , borderWidth : 2 ,backgroundColor : "#000B2B" ,  opacity : 0.9 }}>
// //             <Image tintColor={"#B5C8FF"} source={images.marker} style={{ width : 32 , height : 32}} resizeMode='contain'/>
// //             <Text className='text-xl text-primary-100 font-Poppins-medium mx-2'>{t('CurrentLocation')}</Text>
// //         </TouchableOpacity>
        
// //       </View>

// //       {/* target Location section */}
// //       <Text className='text-xl font-Poppins-medium p-2'>{t('DeliveryLocation')}</Text>
// //       <View className='flex-row justify-between p-2'>
// //         <TouchableOpacity onPress={() => handleMapLocationforDelivery()} className='flex-row justify-center items-center' style={{ padding : 10 , borderColor : "#000B2B" , borderWidth : 2 ,backgroundColor : "#B5C8FF" ,  opacity : 0.9 }}>
// //             <Image source={images.map} style={{ width : 32 , height : 32}} resizeMode='contain'/>
// //             <Text className='text-xl font-Poppins-medium mx-2'>{t('PickFromCart')}</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity onPress={()=>{handleGetLocationDelivery()}} className='flex-row justify-center items-center' style={{ padding : 10 , borderColor : "#000B2B" , borderWidth : 2 ,backgroundColor : "#000B2B" ,  opacity : 0.9 }}>
// //             <Image tintColor={"#B5C8FF"} source={images.marker} style={{ width : 32 , height : 32}} resizeMode='contain'/>
// //             <Text className='text-xl text-primary-100 font-Poppins-medium mx-2'>{t('CurrentLocation')}</Text>
// //         </TouchableOpacity>
        
// //       </View>
// //       <Text className='text-2xl text-primary-200 p-2 font-Poppins-bold'>{t('Summary')}</Text>
// //       <View className='flex p-2 bg-primary-100/20' style={{borderWidth : 2 , borderColor : "black" , borderStyle : 'dotted'}}>
// //         <View className='flex-row justify-between my-2'>
// //           <Text className='text-sm font-Poppins-medium text-primary-300'>{t('PackageDetails')}</Text>
// //           <Text className='text-sm font-Poppins-medium text-primary-300'>{packageDetails}</Text>
// //         </View>
// //         <View className='flex-row justify-between my-2'>
// //           <Text className='text-sm font-Poppins-medium text-primary-300'>{t('PricePackage')}</Text>
// //           <Text className='text-sm font-Poppins-medium text-primary-300'>{packagePrice}</Text>
// //         </View>
// //         <View className='flex-row justify-between my-2'>
// //           <Text className='text-sm font-Poppins-medium text-primary-300'>{t('PackageLocation')}</Text>
// //           <Text className='text-sm font-Poppins-medium text-primary-300'>{pickupLocation?.latitude} , {pickupLocation?.longitude}</Text>
// //         </View>
// //         <View className='flex-row justify-between my-2'>
// //           <Text className='text-sm font-Poppins-medium text-primary-300'>{t('DeliverLocation')}</Text>
// //           <Text className='text-sm font-Poppins-medium text-primary-300'>{delliveryLocation?.latitude} , {delliveryLocation?.longitude}</Text>
// //         </View>
// //       </View>
// //       {/* this is the publish button */}
// //       <TouchableOpacity onPress={()=>{HandlePublish()}} className='flex-row justify-center items-center' style={{backgroundColor : "#000B2B" , padding : 20 , position : 'absolute' , bottom : height*0.15 , left : 10 , right : 10}}>
// //             <Image tintColor={"#B5C8FF"} source={images.edit} style={{ width : 32 , height : 32}} resizeMode='contain'/>
// //             <Text className='text-xl text-primary-100 font-Poppins-medium mx-2'>{t('ConfirmRequest')}</Text>
// //         </TouchableOpacity>
      
// //         <Modal
// //             visible={modalVisible}
// //             animationType="slide"
// //             transparent
// //             onRequestClose={()=>setModalVisible(false)}
// //             style={{
// //                 width: width * 0.8,
// //                 height: height * 0.7,
// //             }}
// //         >
// //             <View style={styles.overlay}>
// //                 <View style={[styles.searchContainer, { paddingTop: insets.top + 10 }]}>
// //                     <TextInput
// //                         style={styles.input}
// //                         placeholder="Search for a location..."
// //                         placeholderTextColor="#666"
// //                         value={query}
// //                         onChangeText={setQuery}
// //                     />
// //                 </View>

// //                 <FlatList
// //                     style={{
// //                         position: 'absolute',
// //                         zIndex: 50,
// //                         top: 120,
// //                         left: 10,
// //                         right: 10
// //                     }}
// //                     contentContainerClassName="flex items-center"
// //                     className=""
// //                     data={places}
// //                     keyExtractor={(item, index) => index.toString()}
// //                     renderItem={({ item }) => (
// //                         <TouchableOpacity 
// //                             className="flex justify-center item" 
// //                             onPress={() => handlePlacePick(item.location)} 
// //                             style={{ 
// //                                 width: width * 0.92, 
// //                                 padding: 10, 
// //                                 borderBottomWidth: 1, 
// //                                 backgroundColor: 'white', 
// //                                 borderRadius: 10 
// //                             }}
// //                         >
// //                             <Text className="text-xl font-Poppins-medium text-primary-200">{item.displayName.text}</Text>
// //                             <Text className="text-xs font-Poppins-Thin text-primary-300">
// //                                 {item.location.latitude}, {item.location.longitude}
// //                             </Text>
// //                         </TouchableOpacity>
// //                     )}
// //                 />

// //                 <View className="flex justify-center items-center">
// //                     <MapView
// //                         ref={mapRef}
// //                         style={{
// //                             width: width,
// //                             height: height * 0.5
// //                         }}
// //                         initialRegion={{
// //                             latitude: location!.latitude,
// //                             longitude: location!.longitude,
// //                             latitudeDelta: 0.01,
// //                             longitudeDelta: 0.01
// //                         }}
// //                         onPress={handlePress}
// //                     >
// //                         {marker && (
// //                             <Marker
// //                                 key={`${marker.latitude}-${marker.longitude}-${Date.now()}`}
// //                                 image={images.marker}
// //                                 coordinate={marker}
// //                                 title="Selected Location"
// //                             />
// //                         )}
// //                     </MapView>
// //                 </View>
// //             </View>
// //             <TouchableOpacity 
// //                 onPress={handleConfirm} 
// //                 className='flex-row justify-center items-center' 
// //                 style={{
// //                     zIndex: 70, 
// //                     backgroundColor: "#B5C8FF", 
// //                     padding: 20, 
// //                     position: 'absolute', 
// //                     bottom: 100, 
// //                     left: 10, 
// //                     right: 10
// //                 }}
// //             >
// //                 <Text className='text-xl text-primary-200 font-Poppins-medium mx-2'>{t('Confirm')}</Text>
// //             </TouchableOpacity>
// //         </Modal>
// //     </SafeAreaView>
// //   )
// // }
// // const styles = StyleSheet.create({
// //     overlay: {
// //         flex: 1,
// //         backgroundColor: "rgba(0, 11, 43, 0.7)",
// //         height: Dimensions.get('screen').height * 0.4
// //     },
// //     searchContainer: {
// //         height: "20%",
// //         flexDirection: "row",
// //         alignItems: "center",
// //         paddingHorizontal: 16,
// //         borderTopLeftRadius: 16,
// //         borderTopRightRadius: 16,
// //     },
// //     input: {
// //         flex: 1,
// //         height: 48,
// //         backgroundColor: "#f1f1f1",
// //         borderRadius: 8,
// //         paddingHorizontal: 12,
// //     },
// //     closeButton: {
// //         position: 'absolute',
// //         bottom: 100,
// //         left: 10,
// //         right: 10,
// //         backgroundColor: "rgba(0, 11, 43, 1)",
// //         zIndex: 60
// //     },
// // });
// // export default activity
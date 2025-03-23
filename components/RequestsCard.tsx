import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native'
import React from 'react'
import { RequestType } from '@/types/globals'
import { images } from '@/constants'
import { t } from 'i18next'

interface Props {
  request: RequestType
  onPress: () => void
}

const RequestsCard = ({ request, onPress }: Props) => {
  const { width } = Dimensions.get('screen')
  
  const getStatusIcon = () => {
    switch (request.status) {
      case 'pending':
        return images.pending
      case 'accepted':
        return images.accepted
      case 'onRoad':
        return images.onroad
      case 'delivered':
        return images.delivered
      default:
        return null
    }
  }
  
  return (
    <TouchableOpacity 
      style={[styles.container, { width: width * 0.9 }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <Text style={styles.idLabel}>ID:</Text>
          <Text style={styles.idValue}>{request.$id}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{request.status}</Text>
          {getStatusIcon() && <Image source={getStatusIcon()} style={styles.statusIcon} />}
        </View>
      </View>
      
      {/* Driver Info */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>{t('Driver')}:</Text>
        <Text style={styles.value}>{request.driverid ?? t('NoDriverYet')}</Text>
      </View>
      
      {/* Location Info */}
      <View style={styles.locationContainer}>
        <View style={styles.locationSection}>
          <Text style={styles.locationTitle}>{t('PickUp')}</Text>
          <Text style={styles.coordinates}>
            {request.pickUpLan}, {request.pickUpLon}
          </Text>
        </View>
        
        <Image source={images.rightArrow} style={styles.arrowIcon} />
        
        <View style={styles.locationSection}>
          <Text style={styles.locationTitle}>{t('Destination')}</Text>
          <Text style={styles.coordinates}>
            {request.destinyLan}, {request.destinyLon}
          </Text>
        </View>
      </View>
      
      {/* Package Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{t('PackageDetails')}</Text>
        <Text style={styles.detailsText}>{request.packageDetails}</Text>
      </View>
      
      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceValue}>{request.price} DZD</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 4,
  },
  idValue: {
    fontSize: 14,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginRight: 4,
    textTransform: 'capitalize',
  },
  statusIcon: {
    width: 16,
    height: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 4,
    width: 60,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  locationSection: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: '#777',
  },
  arrowIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 8,
  },
  detailsContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 13,
    color: '#555',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
});

export default RequestsCard

// import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
// import React from 'react'
// import { RequestType } from '@/types/globals'
// import { images } from '@/constants'
// import { t } from 'i18next'
// interface props {
//   request : RequestType ,
//   onPress : () => void
// }
// const RequestsCard = ({request , onPress} : props ) => {
//   const {width , height} = Dimensions.get('screen')
//   return (
//     <TouchableOpacity onPress={onPress} style={{ width : width*0.9 , height : height*0.24 ,backgroundColor: "rgba(0, 11, 43, 1)" ,  position : 'relative' , borderWidth : 10 , borderStyle : 'solid' , borderRadius : 10 , borderColor : '#B5C8FF'}} 
//               className='p-2'>
//      <View className='flex-row justify-between'>
//      <Text className='text-md font-Poppins-medium text-primary-100'>{request.driverid ?? t('NoDriverYet')}</Text>
//      <Text className='text-xs font-Poppins-light text-primary-100'>{request.$id}</Text>
//      </View>
     
     
//       <View className='flex-row items-center justify-between'>
//       <View className='flex-row items-center'>
//       <Image tintColor={"#B5C8FF"} source={images.marker} style={{width : 32 , height : 32}} resizeMode='contain'/>
//       <View className='mx-2'>
//       <Text className='text-md font-Poppins-medium text-primary-100'>{request.destinyLan}</Text>
//       <Text className='text-md font-Poppins-medium text-primary-100'> {request.destinyLon}</Text>
//       </View>
//       </View>



//       <View className='flex-row items-center'>
//       <Image tintColor={"#B5C8FF"} source={images.target} style={{width : 32 , height : 32}} resizeMode='contain'/>
//       <View className='mx-2'>
//       <Text className='text-md font-Poppins-medium text-primary-100'>{request.pickUpLan}</Text>
//       <Text className='text-md font-Poppins-medium text-primary-100'>{request.pickUpLon}</Text>
//       </View>
//       </View>
//       </View>
     
//       <Text className='text-md font-Poppins-medium text-center p-2 text-primary-100'>{request.packageDetails}</Text>
//       <Text className='text-md font-Poppins-medium text-center p-2 text-primary-100'>{request.price} DZD</Text>
//       <Text className='text-xl font-Poppins-bold text-center p-2 text-primary-100'>{request.status}</Text>
      
      
//       {request.status === 'pending' ? <Image source={images.pending} style={{position: 'absolute',width : 128 , height : 128 , bottom : 10 , right:10}}/> : null}
//       {request.status === 'accepted' ? <Image source={images.accepted} style={{position: 'absolute',width : 128 , height : 128 , bottom : 10 , right:10}}/> : null}
//       {request.status === 'onRoad' ? <Image source={images.onroad} style={{position: 'absolute',width : 128 , height : 128 , bottom : 10 , right:10}}/> : null}
//       {request.status === 'delivered' ? <Image source={images.delivered} style={{position: 'absolute',width : 128 , height : 128 , bottom : 10 , right:10}}/> : null}

      
//     </TouchableOpacity >
//   )
// }

// export default RequestsCard
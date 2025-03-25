import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const localhost = () => {
    useEffect(() => {
      router.replace('/(root)/home')
    
      
    }, [])
    
  return (
    <SafeAreaView>
      <Text>localhost</Text>
    </SafeAreaView>
  )
}

export default localhost
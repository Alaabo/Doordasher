import React, { useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY; // Replace with your API key

const MapScreen = () => {
  const {width , height} = Dimensions.get('screen')
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [marker, setMarker] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
  });

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text) {
      setPlaces([]);
      return;
    }

    try {
      const response = await axios.post('https://places.googleapis.com/v1/places:searchText', 
        {
          textQuery: query
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location'
          }
        })
      console.log(response.data.places[0].location);
      setMarker({latitude : response.data.places[0].location.latitude , longitude : response.data.places[0].location.longitude})
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  const handleLocationSelect = async (placeId: string) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      const { lat, lng } = response.data.result.geometry.location;
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setMarker({ latitude: lat, longitude: lng });
      setPlaces([]);
      setQuery("");
    } catch (error) {
      console.error("Error fetching location details:", error);
    }
  };

  return (
    <View >
      {/* Search Bar */}
      {/* <TextInput
        style={styles.input}
        placeholder="Search for a place"
        value={query}
        onChangeText={handleSearch}
      /> */}

      {/* Search Results */}
      {/* {places.length > 0 && (
        <FlatList
          data={places}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => handleLocationSelect(item.place_id)}>
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )} */}

      {/* Map with marker */}
      {/* <MapView
        // provider={PROVIDER_GOOGLE}
        style={{width : width , height : height/2}}
        // region={region}
        // onPress={(e) => setMarker(e.nativeEvent.coordinate)}
      /> */}
        {/* <Marker coordinate={marker} title="Selected Location" /> */}
      {/* </MapView> */}
    </View>
  );
};


export default MapScreen;

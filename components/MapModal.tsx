import React, { useEffect, useRef, useState } from "react";
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet, Dimensions, FlatList } from "react-native";
import MapView, { MapPressEvent, MapViewProps, Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import { locationProps } from "@/app/(root)/activity";
import { images } from "@/constants";
import { t } from "i18next";
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;

interface place {
    displayName: { languageCode: string, text: string },
    location: { latitude: number, longitude: number }
}

interface LocationSearchModalProps {
   visible: boolean;
    onClose: () => void;
    location: locationProps;
    dataHandler: (location: locationProps) => void;
    marker: locationProps | null; // Receive marker from parent
    setMarker: React.Dispatch<React.SetStateAction<locationProps | null>>
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({ visible, onClose, dataHandler, location }) => {
    const mapRef = useRef<MapView>(null);
    const { width, height } = Dimensions.get('screen');
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState("");
    const [places, setPlaces] = useState<place[] | null>(null);
    const [marker, setMarker] = useState<locationProps | null>(null);

    // Initialize marker with the provided location when component mounts
    useEffect(() => {
        if (location) {
            setMarker(location);
        }
    }, []);

    // Animate map when marker changes
    useEffect(() => {
        if (marker && mapRef.current) {
            animateToLocation(marker);
        }
    }, [marker]);

    const animateToLocation = (location: locationProps) => {
        mapRef.current?.animateCamera({
            center: { latitude: location.latitude, longitude: location.longitude },
            pitch: 0,
            zoom: 15,
        }, { duration: 1000 });
    };

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
                    });
                setPlaces(response.data.places);
            } else {
                setPlaces(null);
            }
        } catch (error) {
            console.error("Error searching location:", error);
        }
    };

    const handlePress = (event: MapPressEvent) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setMarker({ latitude, longitude });
        // Animation is now handled by the useEffect hook
    };

    const handlePlacePick = (location: { latitude: number; longitude: number }) => {
        if (!location) return;
        setMarker(location);
        setPlaces(null);
        setQuery("");
        // Animation is now handled by the useEffect hook
    };

    const handleConfirm = () => {
        if (marker) {
            dataHandler(marker);
        }
        onClose();
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query) {
                handleSearch(query);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [query]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
            style={{
                width: width * 0.8,
                height: height * 0.7,
            }}
        >
            <View style={styles.overlay}>
                <View style={[styles.searchContainer, { paddingTop: insets.top + 10 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Search for a location..."
                        placeholderTextColor="#666"
                        value={query}
                        onChangeText={setQuery}
                    />
                </View>

                <FlatList
                    style={{
                        position: 'absolute',
                        zIndex: 50,
                        top: 120,
                        left: 10,
                        right: 10
                    }}
                    contentContainerClassName="flex items-center"
                    className=""
                    data={places}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            className="flex justify-center item" 
                            onPress={() => handlePlacePick(item.location)} 
                            style={{ 
                                width: width * 0.92, 
                                padding: 10, 
                                borderBottomWidth: 1, 
                                backgroundColor: 'white', 
                                borderRadius: 10 
                            }}
                        >
                            <Text className="text-xl font-Poppins-medium text-primary-200">{item.displayName.text}</Text>
                            <Text className="text-xs font-Poppins-Thin text-primary-300">
                                {item.location.latitude}, {item.location.longitude}
                            </Text>
                        </TouchableOpacity>
                    )}
                />

                <View className="flex justify-center items-center">
                    <MapView
                        ref={mapRef}
                        style={{
                            width: width,
                            height: height * 0.5
                        }}
                        initialRegion={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01
                        }}
                        onPress={handlePress}
                    >
                        {marker && (
                            <Marker
                                key={`${marker.latitude}-${marker.longitude}-${Date.now()}`}
                                image={images.marker}
                                coordinate={marker}
                                title="Selected Location"
                            />
                        )}
                    </MapView>
                </View>
            </View>
            <TouchableOpacity 
                onPress={handleConfirm} 
                className='flex-row justify-center items-center' 
                style={{
                    zIndex: 70, 
                    backgroundColor: "#B5C8FF", 
                    padding: 20, 
                    position: 'absolute', 
                    bottom: 100, 
                    left: 10, 
                    right: 10
                }}
            >
                <Text className='text-xl text-primary-200 font-Poppins-medium mx-2'>{t('Confirm')}</Text>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 11, 43, 0.7)",
        height: Dimensions.get('screen').height * 0.4
    },
    searchContainer: {
        height: "20%",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    input: {
        flex: 1,
        height: 48,
        backgroundColor: "#f1f1f1",
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    closeButton: {
        position: 'absolute',
        bottom: 100,
        left: 10,
        right: 10,
        backgroundColor: "rgba(0, 11, 43, 1)",
        zIndex: 60
    },
});

export default LocationSearchModal;
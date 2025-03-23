import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';

export type Transaction = {
    $id: string 
    amount: number 
    createdAt: Date
    request: string 
    driver: string
    user: string
    status: 'pending' | 'completed' | 'failed'
}

type TransactionCardProps = {
    transaction: Transaction;
    onPress?: (transaction: Transaction) => void;
}

const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
        case 'completed':
            return '#4CAF50'; // Green
        case 'pending':
            return '#FFC107'; // Yellow/Amber
        case 'failed':
            return '#F44336'; // Red
        default:
            return '#9E9E9E'; // Grey
    }
}

const TransactionCard = ({ transaction, onPress }: TransactionCardProps) => {
    const { $id, amount, createdAt, status } = transaction;
    
    // Format the date
    const formattedDate = format(new Date(createdAt), 'MMM dd, yyyy • h:mm a');
    
    // Format the amount
    const formattedAmount = `$${amount.toFixed(2)}`;
    
    // Handle the card press
    const handlePress = () => {
        if (onPress) {
            onPress(transaction);
        }
    };

    return (
        <TouchableOpacity 
            style={styles.container} 
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Text style={styles.id}>Transaction #{$id.substring(0, 8)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                    <Text style={styles.statusText}>{status.toUpperCase()}</Text>
                </View>
            </View>
            
            <View style={styles.body}>
                <View style={styles.row}>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.amount}>{formattedAmount}</Text>
                </View>
                
                <View style={styles.row}>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.date}>{formattedDate}</Text>
                </View>
            </View>
            
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Request ID: {transaction.request.substring(0, 8)}
                </Text>
                <Text style={styles.footerText}>
                    Driver ID: {transaction.driver ? transaction.driver.substring(0, 8) : "pending"}
                </Text>
                <Text style={styles.footerText}>
                    User ID: {transaction.user.substring(0, 8)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    id: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    body: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    label: {
        fontSize: 14,
        color: '#757575',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    date: {
        fontSize: 14,
        color: '#333333',
    },
    footer: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    footerText: {
        fontSize: 12,
        color: '#9E9E9E',
        marginVertical: 2,
    }
});

export default TransactionCard;
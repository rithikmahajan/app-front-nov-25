// Tracking Timeline Component - Reusable tracking visualization
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const TrackingTimeline = ({ trackingEvents = [], currentStatus = null }) => {
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'order confirmed': return '📦';
      case 'picked up': return '🚚';
      case 'in transit': return '🚛';
      case 'out for delivery': return '🏃‍♂️';
      case 'delivered': return '✅';
      case 'cancelled': return '❌';
      case 'returned': return '↩️';
      default: return '📋';
    }
  };

  const getStatusColor = (status, isCompleted = false) => {
    if (isCompleted) return '#28a745'; // Green for completed
    
    switch (status?.toLowerCase()) {
      case 'delivered': return '#28a745';
      case 'out for delivery': return '#fd7e14';
      case 'in transit': return '#007bff';
      case 'picked up': return '#6f42c1';
      case 'order confirmed': return '#17a2b8';
      case 'cancelled': return '#dc3545';
      case 'returned': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid date';
    }
  };

  const isEventCompleted = (event, index) => {
    if (!currentStatus) return false;
    
    // If this event's status matches current status, it's the current one
    if (event.status.toLowerCase() === currentStatus.toLowerCase()) {
      return true;
    }
    
    // Define status hierarchy for completion logic
    const statusHierarchy = [
      'order confirmed',
      'picked up', 
      'in transit',
      'out for delivery',
      'delivered'
    ];
    
    const currentIndex = statusHierarchy.findIndex(s => 
      s === currentStatus.toLowerCase()
    );
    const eventIndex = statusHierarchy.findIndex(s => 
      s === event.status.toLowerCase()
    );
    
    return eventIndex <= currentIndex && currentIndex !== -1;
  };

  if (!trackingEvents || trackingEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📦 Tracking information will appear here once available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.timeline}>
        {trackingEvents.map((event, index) => {
          const isCompleted = isEventCompleted(event, index);
          const statusColor = getStatusColor(event.status, isCompleted);
          
          return (
            <View key={`${event.status}-${index}`} style={styles.timelineItem}>
              {/* Timeline Connector */}
              <View style={styles.timelineConnector}>
                {/* Status Icon */}
                <View style={[
                  styles.statusIconContainer,
                  { 
                    backgroundColor: statusColor,
                  },
                  isCompleted ? styles.completedIcon : styles.pendingIcon
                ]}>
                  <Text style={styles.statusIcon}>
                    {getStatusIcon(event.status)}
                  </Text>
                </View>
                
                {/* Vertical Line */}
                {index < trackingEvents.length - 1 && (
                  <View style={[
                    styles.timelineLine,
                    isCompleted ? 
                      { ...styles.completedLine, backgroundColor: statusColor } : 
                      styles.pendingLine
                  ]} />
                )}
              </View>

              {/* Event Details */}
              <View style={styles.eventDetails}>
                <View style={styles.eventHeader}>
                  <Text style={[
                    styles.eventStatus,
                    { color: statusColor }
                  ]}>
                    {event.status}
                  </Text>
                  <Text style={styles.eventTime}>
                    {formatDate(event.timestamp)}
                  </Text>
                </View>
                
                {event.location && (
                  <Text style={styles.eventLocation}>
                    📍 {event.location}
                  </Text>
                )}
                
                {event.description && (
                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>
                )}

                {/* Additional Details */}
                {event.courierName && (
                  <Text style={styles.courierInfo}>
                    🚚 {event.courierName}
                  </Text>
                )}
                
                {event.expectedDate && event.expectedDate !== event.timestamp && (
                  <Text style={styles.expectedDate}>
                    Expected: {formatDate(event.expectedDate)}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Summary Footer */}
      <View style={styles.summaryFooter}>
        <Text style={styles.summaryText}>
          {currentStatus === 'delivered' 
            ? '🎉 Your order has been delivered!' 
            : `📦 Current Status: ${currentStatus || 'Processing'}`
          }
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timeline: {
    paddingVertical: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineConnector: {
    alignItems: 'center',
    width: 50,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIcon: {
    fontSize: 18,
    color: 'white',
  },
  timelineLine: {
    width: 3,
    flex: 1,
    minHeight: 20,
  },
  eventDetails: {
    flex: 1,
    marginLeft: 16,
    paddingBottom: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  eventStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  eventTime: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  eventLocation: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 4,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 4,
  },
  courierInfo: {
    fontSize: 13,
    color: '#6f42c1',
    marginBottom: 2,
  },
  expectedDate: {
    fontSize: 12,
    color: '#fd7e14',
    fontStyle: 'italic',
  },
  summaryFooter: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
    textAlign: 'center',
  },
  completedIcon: {
    opacity: 1,
  },
  pendingIcon: {
    opacity: 0.5,
  },
  completedLine: {
    opacity: 0.8,
  },
  pendingLine: {
    backgroundColor: '#e9ecef',
    opacity: 0.3,
  },
});

export default TrackingTimeline;

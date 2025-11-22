#!/bin/bash

echo "🔍 FINDING YOUR IP ADDRESS FOR REACT NATIVE"
echo "==========================================="

# Method 1: Try to get WiFi IP
echo "Method 1: WiFi Interface (en0)"
WIFI_IP=$(ipconfig getifaddr en0 2>/dev/null)
if [ ! -z "$WIFI_IP" ]; then
    echo "✅ WiFi IP found: $WIFI_IP"
else
    echo "❌ No WiFi IP found"
fi

# Method 2: Try ethernet
echo ""
echo "Method 2: Ethernet Interface (en1)"
ETH_IP=$(ipconfig getifaddr en1 2>/dev/null)
if [ ! -z "$ETH_IP" ]; then
    echo "✅ Ethernet IP found: $ETH_IP"
else
    echo "❌ No Ethernet IP found"
fi

# Method 3: Parse ifconfig output
echo ""
echo "Method 3: All network interfaces"
ifconfig | grep "inet " | grep -v 127.0.0.1 | while read line; do
    IP=$(echo $line | awk '{print $2}')
    echo "📡 Found IP: $IP"
done

# Method 4: Try route command
echo ""
echo "Method 4: Default route method"
DEFAULT_IP=$(route -n get default 2>/dev/null | grep 'interface:' | awk '{print $2}' | xargs ipconfig getifaddr 2>/dev/null)
if [ ! -z "$DEFAULT_IP" ]; then
    echo "✅ Default route IP: $DEFAULT_IP"
else
    echo "❌ No default route IP found"
fi

echo ""
echo "🎯 INSTRUCTIONS:"
echo "1. Look at the IPs listed above"
echo "2. Choose the one that looks like 192.168.x.x or 10.0.x.x"
echo "3. Tell me which IP you want to use"
echo "4. I'll update your React Native configuration automatically"

echo ""
echo "💡 Common patterns:"
echo "   • Home WiFi: 192.168.1.x or 192.168.0.x"
echo "   • Office: 10.0.0.x or 172.16.x.x"
echo "   • Mobile hotspot: varies"

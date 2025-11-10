#!/bin/bash

# Fix glog C++ headers for Xcode 16+ compatibility
# This script fixes the 'iosfwd' file not found error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
GLOG_HEADER="${SCRIPT_DIR}/Pods/glog/src/glog/logging.h"

if [ -f "$GLOG_HEADER" ]; then
    echo "Fixing glog headers..."
    
    # Replace double quotes with angle brackets for standard C++ headers
    sed -i '' 's/#include <glog\/log_severity.h>/#include <glog\/log_severity.h>/g' "$GLOG_HEADER"
    
    # Ensure iosfwd is properly included
    if ! grep -q "#include <iosfwd>" "$GLOG_HEADER"; then
        sed -i '' '/#include <glog\/log_severity.h>/a\
#include <iosfwd>
' "$GLOG_HEADER"
    fi
    
    echo "✅ glog headers fixed"
else
    echo "⚠️  glog header not found at: $GLOG_HEADER"
fi

# Fix umbrella header
UMBRELLA_HEADER="${SCRIPT_DIR}/Pods/Target Support Files/glog/glog-umbrella.h"
if [ -f "$UMBRELLA_HEADER" ]; then
    sed -i '' 's/#import "logging.h"/#import <glog\/logging.h>/g' "$UMBRELLA_HEADER"
    echo "✅ glog umbrella header fixed"
fi

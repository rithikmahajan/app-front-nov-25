#!/usr/bin/env python3
"""
Make remaining screens responsive by adding responsive helper imports
and converting hardcoded values to responsive ones.
"""

import re
import os
import sys
from datetime import datetime

SCREENS_DIR = "/Users/rithikmahajan/Desktop/may-be-safe/app-frontend-ios-android-nov10/src/screens"

FILES_TO_UPDATE = [
    "bagemptyscreen.js",
    "bagquantityselectormodaloverlay.js",
    "bagsizeselectormodaloverlay.js",
    "InviteAFriend.js",
]

def backup_file(filepath):
    """Create a timestamped backup of the file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{filepath}.backup.{timestamp}"
    with open(filepath, 'r') as f:
        content = f.read()
    with open(backup_path, 'w') as f:
        f.write(content)
    print(f"  💾 Backup created: {os.path.basename(backup_path)}")

def add_responsive_imports(content):
    """Add responsive helper imports after StyleSheet import."""
    # Check if already has responsive imports
    if "from '../utils/responsive'" in content or 'from "../utils/responsive"' in content:
        return content, False
    
    # Find StyleSheet import and add responsive imports after it
    pattern = r'(import\s+{[^}]*StyleSheet[^}]*}\s+from\s+[\'"]react-native[\'"];?)'
    
    responsive_import = "\nimport { getResponsiveFontSize, getResponsiveSpacing, getResponsiveValue, getResponsiveGrid } from '../utils/responsive';"
    
    new_content = re.sub(pattern, r'\1' + responsive_import, content, count=1)
    
    return new_content, new_content != content

def convert_to_responsive(content):
    """Convert hardcoded style values to responsive helper calls."""
    
    # fontSize: 16 -> fontSize: getResponsiveFontSize(16)
    content = re.sub(r'fontSize:\s*(\d+),', r'fontSize: getResponsiveFontSize(\1),', content)
    
    # Padding variants
    content = re.sub(r'padding:\s*(\d+),', r'padding: getResponsiveSpacing(\1),', content)
    content = re.sub(r'paddingHorizontal:\s*(\d+),', r'paddingHorizontal: getResponsiveSpacing(\1),', content)
    content = re.sub(r'paddingVertical:\s*(\d+),', r'paddingVertical: getResponsiveSpacing(\1),', content)
    content = re.sub(r'paddingTop:\s*(\d+),', r'paddingTop: getResponsiveSpacing(\1),', content)
    content = re.sub(r'paddingBottom:\s*(\d+),', r'paddingBottom: getResponsiveSpacing(\1),', content)
    content = re.sub(r'paddingLeft:\s*(\d+),', r'paddingLeft: getResponsiveSpacing(\1),', content)
    content = re.sub(r'paddingRight:\s*(\d+),', r'paddingRight: getResponsiveSpacing(\1),', content)
    
    # Margin variants
    content = re.sub(r'margin:\s*(\d+),', r'margin: getResponsiveSpacing(\1),', content)
    content = re.sub(r'marginHorizontal:\s*(\d+),', r'marginHorizontal: getResponsiveSpacing(\1),', content)
    content = re.sub(r'marginVertical:\s*(\d+),', r'marginVertical: getResponsiveSpacing(\1),', content)
    content = re.sub(r'marginTop:\s*(\d+),', r'marginTop: getResponsiveSpacing(\1),', content)
    content = re.sub(r'marginBottom:\s*(\d+),', r'marginBottom: getResponsiveSpacing(\1),', content)
    content = re.sub(r'marginLeft:\s*(\d+),', r'marginLeft: getResponsiveSpacing(\1),', content)
    content = re.sub(r'marginRight:\s*(\d+),', r'marginRight: getResponsiveSpacing(\1),', content)
    
    # Gap
    content = re.sub(r'gap:\s*(\d+),', r'gap: getResponsiveSpacing(\1),', content)
    
    # Border radius (3-tier scaling for phones/tablets/large tablets)
    content = re.sub(r'borderRadius:\s*(\d+),', lambda m: f'borderRadius: getResponsiveValue({m.group(1)}, {int(m.group(1)) * 1.2}, {int(m.group(1)) * 1.4}),', content)
    
    return content

def process_file(filename):
    """Process a single file to make it responsive."""
    filepath = os.path.join(SCREENS_DIR, filename)
    
    print(f"\n{'━' * 50}")
    print(f"📝 Processing: {filename}")
    
    if not os.path.exists(filepath):
        print(f"  ⏭️  File not found, skipping...")
        return 'skip'
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  ❌ Error reading file: {e}")
        return 'error'
    
    # Check if StyleSheet is imported
    if 'StyleSheet' not in content:
        print(f"  ⏭️  No StyleSheet import found, skipping...")
        return 'skip'
    
    # Create backup
    print(f"  🔧 Adding responsive utilities...")
    backup_file(filepath)
    
    # Add responsive imports
    new_content, imports_added = add_responsive_imports(content)
    
    if not imports_added:
        print(f"  ✅ Already has responsive imports")
        return 'skip'
    
    print(f"  ✅ Added responsive imports")
    print(f"  🔄 Converting hardcoded values...")
    
    # Convert to responsive
    new_content = convert_to_responsive(new_content)
    
    # Write back
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  ✅ Successfully updated!")
        return 'success'
    except Exception as e:
        print(f"  ❌ Error writing file: {e}")
        return 'error'

def main():
    """Main execution function."""
    print("🎨 Making remaining critical screens responsive...")
    print("")
    
    os.chdir(SCREENS_DIR)
    
    results = {'success': 0, 'skip': 0, 'error': 0}
    
    for filename in FILES_TO_UPDATE:
        result = process_file(filename)
        results[result] = results.get(result, 0) + 1
    
    print(f"\n{'━' * 50}")
    print("🎉 Processing complete!")
    print("")
    print("📊 Summary:")
    print(f"  ✅ Successfully updated: {results['success']}")
    print(f"  ⏭️  Skipped: {results['skip']}")
    print(f"  ❌ Errors: {results['error']}")
    print("")
    print("💾 Backup files created with timestamp")
    print("🔍 Please review and test the changes")
    print("")
    
    if results['error'] > 0:
        print("⚠️  Some files had errors. Please review them manually.")
        sys.exit(1)
    
    sys.exit(0)

if __name__ == "__main__":
    main()

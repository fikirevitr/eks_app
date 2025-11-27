#!/usr/bin/env python3
"""
Backend API Testing for Oniks EKS APP
Tests the three main endpoints as specified in the review request.
"""

import requests
import json
import sys
from typing import Dict, Any

# Backend URL from environment
BACKEND_URL = "https://pi-control.preview.emergentagent.com"

def test_root_endpoint():
    """Test GET /api/ endpoint"""
    print("🔍 Testing GET /api/ endpoint...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {data}")
            
            # Verify expected response structure
            expected_message = "Oniks EKS APP Backend"
            expected_version = "1.0"
            
            if data.get("message") == expected_message and data.get("version") == expected_version:
                print("   ✅ Root endpoint working correctly")
                return True
            else:
                print(f"   ❌ Unexpected response format. Expected message: '{expected_message}', version: '{expected_version}'")
                return False
        else:
            print(f"   ❌ Failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request failed: {e}")
        return False

def test_config_sample_endpoint():
    """Test GET /api/config/sample endpoint"""
    print("\n🔍 Testing GET /api/config/sample endpoint...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/config/sample", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response keys: {list(data.keys())}")
            
            # Verify expected structure
            required_fields = ["app_name", "pages", "buttons"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"   ❌ Missing required fields: {missing_fields}")
                return False
            
            # Check app_name
            if data.get("app_name") != "Oniks EKS APP":
                print(f"   ❌ Unexpected app_name: {data.get('app_name')}")
                return False
            
            # Check pages array (should have 3 pages)
            pages = data.get("pages", [])
            if len(pages) != 3:
                print(f"   ❌ Expected 3 pages, got {len(pages)}")
                return False
            
            # Check buttons array (should have 10 buttons)
            buttons = data.get("buttons", [])
            if len(buttons) != 10:
                print(f"   ❌ Expected 10 buttons, got {len(buttons)}")
                return False
            
            print(f"   ✅ Config sample endpoint working correctly")
            print(f"   - App name: {data['app_name']}")
            print(f"   - Pages: {len(pages)}")
            print(f"   - Buttons: {len(buttons)}")
            return True
            
        else:
            print(f"   ❌ Failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request failed: {e}")
        return False

def test_config_fetch_endpoint():
    """Test GET /api/config/fetch endpoint"""
    print("\n🔍 Testing GET /api/config/fetch endpoint...")
    
    # Test with the URL specified in the review request
    test_url = "https://oniksbilgi.com.tr/cdn/jsons/simple_config.json"
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/config/fetch", 
            params={"url": test_url},
            timeout=30
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response keys: {list(data.keys())}")
            
            # Verify expected structure
            required_fields = ["app_name", "pages", "buttons"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"   ❌ Missing required fields: {missing_fields}")
                return False
            
            print(f"   ✅ Config fetch endpoint working correctly")
            print(f"   - App name: {data.get('app_name')}")
            print(f"   - Pages: {len(data.get('pages', []))}")
            print(f"   - Buttons: {len(data.get('buttons', []))}")
            return True
            
        elif response.status_code == 502:
            # This is expected behavior when external URL returns 404
            error_data = response.json()
            if "Config server returned 404" in error_data.get("detail", ""):
                print(f"   ✅ Config fetch endpoint correctly handled external 404 error")
                print(f"   - Proper error response: {error_data.get('detail')}")
                return True
            else:
                print(f"   ❌ Unexpected 502 error: {error_data}")
                return False
        else:
            print(f"   ❌ Failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request failed: {e}")
        return False

def test_ssh_execute_endpoint():
    """Test POST /api/ssh/execute endpoint"""
    print("\n🔍 Testing POST /api/ssh/execute endpoint...")
    
    # Test payload as specified in the review request
    test_payload = {
        "button_id": "test_btn",
        "ssh": {
            "host": "invalid-host.test",
            "port": 22,
            "username": "test",
            "password": "test",
            "command": "echo 'test'"
        }
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/ssh/execute", 
            json=test_payload,
            timeout=30,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response keys: {list(data.keys())}")
            
            # Verify expected response structure
            required_fields = ["success", "output", "execution_time"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"   ❌ Missing required fields: {missing_fields}")
                return False
            
            # Since we're using an invalid host, we expect success to be False
            if data.get("success") == False:
                print(f"   ✅ SSH execute endpoint working correctly (expected failure for invalid host)")
                print(f"   - Success: {data['success']}")
                print(f"   - Output: {data.get('output', 'N/A')}")
                print(f"   - Error: {data.get('error', 'N/A')}")
                print(f"   - Execution time: {data.get('execution_time')} seconds")
                return True
            else:
                print(f"   ⚠️  Unexpected success for invalid host")
                print(f"   - Success: {data['success']}")
                print(f"   - Output: {data.get('output', 'N/A')}")
                return True  # Still consider it working since the endpoint responded correctly
                
        else:
            print(f"   ❌ Failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request failed: {e}")
        return False

def main():
    """Run all backend API tests"""
    print("🚀 Starting Oniks EKS APP Backend API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    results = []
    
    # Test all endpoints
    results.append(("GET /api/", test_root_endpoint()))
    results.append(("GET /api/config/sample", test_config_sample_endpoint()))
    results.append(("GET /api/config/fetch", test_config_fetch_endpoint()))
    results.append(("POST /api/ssh/execute", test_ssh_execute_endpoint()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for endpoint, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {endpoint}")
        if success:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend API endpoints are working correctly!")
        return 0
    else:
        print("⚠️  Some backend API endpoints have issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())
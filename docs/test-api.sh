#!/bin/bash

# WorkPulse API Test Script
# This script demonstrates the complete workflow using curl commands

set -e  # Exit on error

BASE_URL="http://10.10.0.43:3000"

echo "🚀 WorkPulse API Test Script"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Register new organization
echo -e "${BLUE}Step 1: Registering new organization...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testorg.com",
    "password": "TestPassword123!",
    "confirm_password": "TestPassword123!",
    "first_name": "Test",
    "last_name": "Admin",
    "employee_id": "EMP001",
    "organization_name": "Test Organization"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

# Extract token and IDs
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.user.id')
ORG_ID=$(echo $REGISTER_RESPONSE | jq -r '.user.organization_id')

echo -e "${GREEN}✓ Registration successful!${NC}"
echo "Token: $TOKEN"
echo "User ID: $USER_ID"
echo "Organization ID: $ORG_ID"
echo ""

# Step 2: Get system project
echo -e "${BLUE}Step 2: Getting system project...${NC}"
SYSTEM_PROJECT=$(curl -s -X GET $BASE_URL/projects/system \
  -H "Authorization: Bearer $TOKEN")

echo "$SYSTEM_PROJECT" | jq '.'

PROJECT_ID=$(echo $SYSTEM_PROJECT | jq -r '.id')
echo -e "${GREEN}✓ System project ID: $PROJECT_ID${NC}"
echo ""

# Step 3: List all projects
echo -e "${BLUE}Step 3: Listing all projects...${NC}"
curl -s -X GET $BASE_URL/projects \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 4: Start a work session
echo -e "${BLUE}Step 4: Starting work session...${NC}"
SESSION_RESPONSE=$(curl -s -X POST $BASE_URL/sessions/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"project_id\": \"$PROJECT_ID\"}")

echo "$SESSION_RESPONSE" | jq '.'

SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.id')
echo -e "${GREEN}✓ Session started! Session ID: $SESSION_ID${NC}"
echo ""

# Step 5: Log activity
echo -e "${BLUE}Step 5: Logging activity...${NC}"
curl -s -X POST $BASE_URL/sessions/$SESSION_ID/activity \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "active",
    "appName": "Terminal",
    "windowTitle": "API Test Script",
    "url": "file:///test"
  }' | jq '.'
echo -e "${GREEN}✓ Activity logged!${NC}"
echo ""

# Step 6: Get my active session
echo -e "${BLUE}Step 6: Getting active session...${NC}"
curl -s -X GET $BASE_URL/sessions/active/mine \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 7: List all users
echo -e "${BLUE}Step 7: Listing all users...${NC}"
curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 8: Create a new project
echo -e "${BLUE}Step 8: Creating new project...${NC}"
NEW_PROJECT=$(curl -s -X POST $BASE_URL/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "A test project created via API"
  }')

echo "$NEW_PROJECT" | jq '.'
NEW_PROJECT_ID=$(echo $NEW_PROJECT | jq -r '.id')
echo -e "${GREEN}✓ New project created! ID: $NEW_PROJECT_ID${NC}"
echo ""

# Step 9: Assign user to new project
echo -e "${BLUE}Step 9: Assigning user to new project...${NC}"
curl -s -X POST $BASE_URL/projects/$NEW_PROJECT_ID/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"user_ids\": [\"$USER_ID\"]}"
echo -e "${GREEN}✓ User assigned to project!${NC}"
echo ""

# Step 10: Stop the session
echo -e "${BLUE}Step 10: Stopping work session...${NC}"
curl -s -X POST $BASE_URL/sessions/$SESSION_ID/stop \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo -e "${GREEN}✓ Session stopped!${NC}"
echo ""

# Step 11: Health check
echo -e "${BLUE}Step 11: Health check...${NC}"
curl -s -X GET $BASE_URL/health | jq '.'
echo ""

echo -e "${GREEN}=============================="
echo "✓ All tests completed successfully!"
echo "==============================${NC}"
echo ""
echo "Saved credentials:"
echo "  Email: admin@testorg.com"
echo "  Password: TestPassword123!"
echo "  Organization ID: $ORG_ID"
echo "  Access Token: $TOKEN"
